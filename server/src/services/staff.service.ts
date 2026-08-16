import type { SalaryType, StaffStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { staffRepository } from "../repositories/staff.repository";
import { assertSalonAccessible } from "./salon.service";
import { AppError } from "../utils/app-error";
import { ERROR_CODES } from "../types";

export interface InviteStaffInput {
  barberEmail: string;
  salaryType?: SalaryType;
  salaryFixed?: number;
  salaryPercent?: number;
}

export interface UpdateStaffInput {
  status?: StaffStatus;
  salaryType?: SalaryType;
  salaryFixed?: number;
  salaryPercent?: number;
}

const BARBER_ALLOWED_STATUSES: StaffStatus[] = ["ACTIVE", "REJECTED"];

async function attachSalonServices(barberId: string, salonId: string) {
  await staffRepository.assignActiveSalonServices(barberId, salonId);
}

export async function inviteStaff(salonId: string, input: InviteStaffInput) {
  await assertSalonAccessible(salonId, false);

  const barberUser = await prisma.user.findUnique({
    where: { email: input.barberEmail },
    include: { barberProfile: true },
  });

  if (!barberUser?.barberProfile) {
    throw AppError.notFound("Barber not found for this email address");
  }
  if (barberUser.role !== "BARBER") {
    throw AppError.badRequest("User is not a barber");
  }

  const barberId = barberUser.barberProfile.id;
  const existing = await staffRepository.findBySalonAndBarber(salonId, barberId);
  if (existing && existing.status !== "REMOVED" && existing.status !== "REJECTED") {
    throw AppError.conflict("Barber is already invited or active in this salon");
  }

  const staff = existing
    ? await staffRepository.update(existing.id, {
        status: "INVITED",
        invitedAt: new Date(),
        acceptedAt: null,
        salaryType: input.salaryType,
        salaryFixed: input.salaryFixed,
        salaryPercent: input.salaryPercent,
      })
    : await staffRepository.create({
        salon: { connect: { id: salonId } },
        barber: { connect: { id: barberId } },
        status: "INVITED",
        salaryType: input.salaryType,
        salaryFixed: input.salaryFixed,
        salaryPercent: input.salaryPercent,
      });

  await attachSalonServices(barberId, salonId);
  return staff;
}

export async function listSalonStaff(
  salonId: string,
  user?: { role: string; ownerProfileId?: string },
) {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { id: true, status: true, ownerId: true },
  });
  if (!salon) throw AppError.notFound("Salon not found");

  const isOwner = user?.ownerProfileId === salon.ownerId;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (salon.status !== "ACTIVE" && !isOwner && !isAdmin) {
    throw AppError.notFound("Salon not found", ERROR_CODES.SALON_NOT_ACTIVE);
  }

  const statusFilter = isOwner || isAdmin ? undefined : ("ACTIVE" as StaffStatus);
  return staffRepository.findBySalon(salonId, statusFilter);
}

export async function updateStaff(
  staffId: string,
  input: UpdateStaffInput,
  actor: { role: string; id: string; barberProfileId?: string; ownerProfileId?: string },
) {
  const staff = await staffRepository.findById(staffId);
  if (!staff) throw AppError.notFound("Staff record not found");

  const isOwner = actor.ownerProfileId === staff.salon.ownerId;
  const isBarber = actor.barberProfileId === staff.barberId;

  if (actor.role === "BARBER" && isBarber) {
    if (staff.status !== "INVITED") {
      throw AppError.badRequest("Only pending invitations can be accepted or rejected");
    }
    if (!input.status || !BARBER_ALLOWED_STATUSES.includes(input.status)) {
      throw AppError.badRequest("Barber can only accept (ACTIVE) or reject (REJECTED) invitation");
    }

    const accepted = input.status === "ACTIVE";
    const updated = await staffRepository.update(staffId, {
      status: input.status,
      acceptedAt: accepted ? new Date() : null,
    });
    if (accepted) {
      await attachSalonServices(staff.barberId, staff.salonId);
    }
    return updated;
  }

  if (isOwner || actor.role === "ADMIN" || actor.role === "SUPER_ADMIN") {
    const data: UpdateStaffInput = {};
    if (input.salaryType !== undefined) data.salaryType = input.salaryType;
    if (input.salaryFixed !== undefined) data.salaryFixed = input.salaryFixed;
    if (input.salaryPercent !== undefined) data.salaryPercent = input.salaryPercent;
    if (input.status !== undefined) {
      if (input.status === "REMOVED") {
        data.status = "REMOVED";
      } else if (input.status === "ACTIVE") {
        if (staff.status !== "INVITED" && staff.status !== "ACTIVE") {
          throw AppError.badRequest("Staff can only be activated from INVITED");
        }
        if (staff.status === "INVITED") {
          data.status = "ACTIVE";
        }
      } else if (input.status === "INVITED") {
        throw AppError.badRequest("Re-invite a removed or rejected barber via POST /api/salons/:id/staff");
      } else {
        throw AppError.badRequest("Owner cannot set this staff status");
      }
    }
    const updated = await staffRepository.update(staffId, {
      ...data,
      ...(data.status === "ACTIVE" ? { acceptedAt: new Date() } : {}),
    });
    if (data.status === "ACTIVE") {
      await attachSalonServices(staff.barberId, staff.salonId);
    }
    return updated;
  }

  throw AppError.forbidden("You cannot update this staff record");
}

export async function removeStaff(staffId: string) {
  const staff = await staffRepository.findById(staffId);
  if (!staff) throw AppError.notFound("Staff record not found");

  return staffRepository.update(staffId, { status: "REMOVED" });
}

export async function getBarberById(barberId: string) {
  const barber = await staffRepository.findBarberProfile(barberId);
  if (!barber) throw AppError.notFound("Barber not found");

  return {
    ...barber,
    staffAssignments: barber.staffAssignments.filter((a) => a.salon.status === "ACTIVE"),
    services: barber.barberServices
      .map((bs) => bs.service)
      .filter((s) => s.isActive),
  };
}

export async function assertBarberInSalon(barberProfileId: string, salonId: string) {
  const assigned = await staffRepository.isBarberInSalon(barberProfileId, salonId);
  if (!assigned) {
    throw AppError.forbidden("Barber is not assigned to this salon", ERROR_CODES.BARBER_NOT_IN_SALON);
  }
}
