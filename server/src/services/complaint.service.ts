import type { ComplaintStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { writeAudit } from "./audit.service";

export async function createComplaint(params: {
  clientId: string;
  subject: string;
  body: string;
  salonId?: string;
  bookingId?: string;
}) {
  if (params.bookingId) {
    const booking = await prisma.booking.findUnique({ where: { id: params.bookingId } });
    if (!booking) throw AppError.notFound("Booking not found");
    if (booking.clientId !== params.clientId) {
      throw AppError.forbidden("Booking does not belong to you");
    }
  }

  if (params.salonId) {
    const salon = await prisma.salon.findUnique({ where: { id: params.salonId } });
    if (!salon) throw AppError.notFound("Salon not found");
  }

  const complaint = await prisma.complaint.create({
    data: {
      clientId: params.clientId,
      salonId: params.salonId,
      bookingId: params.bookingId,
      subject: params.subject,
      body: params.body,
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      salon: { select: { id: true, name: true } },
    },
  });

  await writeAudit({
    actorId: params.clientId,
    action: "COMPLAINT_CREATED",
    entityType: "Complaint",
    entityId: complaint.id,
  });

  return complaint;
}

export async function listComplaints(params: {
  page: number;
  limit: number;
  status?: ComplaintStatus;
}) {
  const where: Prisma.ComplaintWhereInput = {};
  if (params.status) where.status = params.status;

  const [items, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, phone: true } },
        salon: { select: { id: true, name: true } },
        handledBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return { items, page: params.page, limit: params.limit, total };
}

export async function getComplaintById(complaintId: string) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      salon: { select: { id: true, name: true } },
      handledBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!complaint) throw AppError.notFound("Complaint not found");
  return complaint;
}

export async function updateComplaint(params: {
  complaintId: string;
  adminId: string;
  status?: ComplaintStatus;
  adminNote?: string;
}) {
  const complaint = await prisma.complaint.findUnique({ where: { id: params.complaintId } });
  if (!complaint) throw AppError.notFound("Complaint not found");

  const updated = await prisma.complaint.update({
    where: { id: params.complaintId },
    data: {
      ...(params.status !== undefined ? { status: params.status } : {}),
      ...(params.adminNote !== undefined ? { adminNote: params.adminNote } : {}),
      handledById: params.adminId,
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      salon: { select: { id: true, name: true } },
      handledBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  await writeAudit({
    actorId: params.adminId,
    action: "COMPLAINT_UPDATED",
    entityType: "Complaint",
    entityId: params.complaintId,
    metadata: { status: params.status, adminNote: params.adminNote },
  });

  return updated;
}
