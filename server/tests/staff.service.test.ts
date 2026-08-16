import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/utils/app-error";

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  salon: { findUnique: vi.fn() },
}));

const mockStaffRepository = vi.hoisted(() => ({
  findBySalonAndBarber: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  findBySalon: vi.fn(),
  assignActiveSalonServices: vi.fn(),
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/repositories/staff.repository", () => ({
  staffRepository: mockStaffRepository,
}));
vi.mock("../src/services/salon.service", () => ({
  assertSalonAccessible: vi.fn().mockResolvedValue(undefined),
}));

import { inviteStaff, updateStaff } from "../src/services/staff.service";

const barberUser = {
  id: "user-1",
  phone: "+998900002007",
  role: "BARBER",
  barberProfile: { id: "barber-1" },
};

const invitedStaff = {
  id: "staff-1",
  salonId: "salon-1",
  barberId: "barber-1",
  status: "INVITED",
  salon: { id: "salon-1", name: "Classic", ownerId: "owner-1", status: "ACTIVE" },
};

describe("inviteStaff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(barberUser);
    mockStaffRepository.findBySalonAndBarber.mockResolvedValue(null);
    mockStaffRepository.create.mockResolvedValue({ ...invitedStaff, status: "INVITED" });
    mockStaffRepository.assignActiveSalonServices.mockResolvedValue({ count: 3 });
  });

  it("creates INVITED staff and attaches all active salon services", async () => {
    const result = await inviteStaff("salon-1", { barberPhone: barberUser.phone });

    expect(mockStaffRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "INVITED",
        salon: { connect: { id: "salon-1" } },
        barber: { connect: { id: "barber-1" } },
      }),
    );
    expect(mockStaffRepository.assignActiveSalonServices).toHaveBeenCalledWith("barber-1", "salon-1");
    expect(result.status).toBe("INVITED");
  });

  it("re-invites after REJECTED and re-attaches services", async () => {
    mockStaffRepository.findBySalonAndBarber.mockResolvedValue({
      ...invitedStaff,
      status: "REJECTED",
    });
    mockStaffRepository.update.mockResolvedValue({ ...invitedStaff, status: "INVITED" });

    await inviteStaff("salon-1", { barberPhone: barberUser.phone });

    expect(mockStaffRepository.update).toHaveBeenCalledWith(
      "staff-1",
      expect.objectContaining({
        status: "INVITED",
        acceptedAt: null,
        invitedAt: expect.any(Date),
      }),
    );
    expect(mockStaffRepository.assignActiveSalonServices).toHaveBeenCalledWith("barber-1", "salon-1");
  });

  it("re-invites after REMOVED", async () => {
    mockStaffRepository.findBySalonAndBarber.mockResolvedValue({
      ...invitedStaff,
      status: "REMOVED",
    });
    mockStaffRepository.update.mockResolvedValue({ ...invitedStaff, status: "INVITED" });

    await inviteStaff("salon-1", { barberPhone: barberUser.phone });

    expect(mockStaffRepository.update).toHaveBeenCalled();
    expect(mockStaffRepository.create).not.toHaveBeenCalled();
  });

  it("rejects a second invite while already INVITED or ACTIVE", async () => {
    mockStaffRepository.findBySalonAndBarber.mockResolvedValue({
      ...invitedStaff,
      status: "ACTIVE",
    });

    await expect(inviteStaff("salon-1", { barberPhone: barberUser.phone })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(mockStaffRepository.assignActiveSalonServices).not.toHaveBeenCalled();
  });
});

describe("updateStaff invitation flow", () => {
  const barberActor = {
    role: "BARBER",
    id: "user-1",
    barberProfileId: "barber-1",
  };
  const ownerActor = {
    role: "OWNER",
    id: "user-owner",
    ownerProfileId: "owner-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStaffRepository.findById.mockResolvedValue(invitedStaff);
    mockStaffRepository.assignActiveSalonServices.mockResolvedValue({ count: 3 });
  });

  it("lets the barber accept INVITED → ACTIVE and sets acceptedAt", async () => {
    mockStaffRepository.update.mockResolvedValue({ ...invitedStaff, status: "ACTIVE" });

    await updateStaff("staff-1", { status: "ACTIVE" }, barberActor);

    expect(mockStaffRepository.update).toHaveBeenCalledWith(
      "staff-1",
      expect.objectContaining({
        status: "ACTIVE",
        acceptedAt: expect.any(Date),
      }),
    );
    expect(mockStaffRepository.assignActiveSalonServices).toHaveBeenCalledWith("barber-1", "salon-1");
  });

  it("lets the barber reject INVITED → REJECTED and clears acceptedAt", async () => {
    mockStaffRepository.update.mockResolvedValue({ ...invitedStaff, status: "REJECTED" });

    await updateStaff("staff-1", { status: "REJECTED" }, barberActor);

    expect(mockStaffRepository.update).toHaveBeenCalledWith(
      "staff-1",
      expect.objectContaining({
        status: "REJECTED",
        acceptedAt: null,
      }),
    );
    expect(mockStaffRepository.assignActiveSalonServices).not.toHaveBeenCalled();
  });

  it("rejects accept when the invitation is not pending", async () => {
    mockStaffRepository.findById.mockResolvedValue({ ...invitedStaff, status: "ACTIVE" });

    await expect(updateStaff("staff-1", { status: "ACTIVE" }, barberActor)).rejects.toBeInstanceOf(AppError);
  });

  it("lets the owner confirm INVITED → ACTIVE", async () => {
    mockStaffRepository.update.mockResolvedValue({ ...invitedStaff, status: "ACTIVE" });

    await updateStaff("staff-1", { status: "ACTIVE" }, ownerActor);

    expect(mockStaffRepository.update).toHaveBeenCalledWith(
      "staff-1",
      expect.objectContaining({
        status: "ACTIVE",
        acceptedAt: expect.any(Date),
      }),
    );
  });

  it("tells the owner to re-invite via POST instead of PATCH INVITED", async () => {
    mockStaffRepository.findById.mockResolvedValue({ ...invitedStaff, status: "REJECTED" });

    await expect(updateStaff("staff-1", { status: "INVITED" }, ownerActor)).rejects.toMatchObject({
      message: expect.stringContaining("POST /api/salons/:id/staff"),
    });
  });
});
