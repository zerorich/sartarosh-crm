import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/utils/app-error";

const mockPrisma = vi.hoisted(() => ({
  booking: { findUnique: vi.fn() },
  salon: { findUnique: vi.fn() },
  complaint: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/services/audit.service", () => ({
  writeAudit: vi.fn().mockResolvedValue({}),
}));

import { writeAudit } from "../src/services/audit.service";
import { createComplaint, updateComplaint } from "../src/services/complaint.service";

describe("ComplaintService.createComplaint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a complaint and writes COMPLAINT_CREATED audit", async () => {
    mockPrisma.salon.findUnique.mockResolvedValue({ id: "salon-1" });
    mockPrisma.complaint.create.mockResolvedValue({
      id: "complaint-1",
      clientId: "client-1",
      salonId: "salon-1",
      subject: "Late barber",
      body: "Waited 40 minutes",
      status: "OPEN",
    });

    const result = await createComplaint({
      clientId: "client-1",
      salonId: "salon-1",
      subject: "Late barber",
      body: "Waited 40 minutes",
    });

    expect(result.id).toBe("complaint-1");
    expect(mockPrisma.complaint.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clientId: "client-1",
          salonId: "salon-1",
          subject: "Late barber",
        }),
      }),
    );
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "client-1",
        action: "COMPLAINT_CREATED",
        entityType: "Complaint",
        entityId: "complaint-1",
      }),
    );
  });

  it("rejects a complaint for someone else's booking", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      clientId: "other-client",
    });

    await expect(
      createComplaint({
        clientId: "client-1",
        bookingId: "booking-1",
        subject: "Issue",
        body: "Details",
      }),
    ).rejects.toBeInstanceOf(AppError);
    expect(mockPrisma.complaint.create).not.toHaveBeenCalled();
  });
});

describe("ComplaintService.updateComplaint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets admin change status and writes COMPLAINT_UPDATED audit", async () => {
    mockPrisma.complaint.findUnique.mockResolvedValue({
      id: "complaint-1",
      status: "OPEN",
    });
    mockPrisma.complaint.update.mockResolvedValue({
      id: "complaint-1",
      status: "RESOLVED",
      adminNote: "Refunded deposit",
      handledById: "admin-1",
    });

    const result = await updateComplaint({
      complaintId: "complaint-1",
      adminId: "admin-1",
      status: "RESOLVED",
      adminNote: "Refunded deposit",
    });

    expect(result.status).toBe("RESOLVED");
    expect(mockPrisma.complaint.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "complaint-1" },
        data: expect.objectContaining({
          status: "RESOLVED",
          adminNote: "Refunded deposit",
          handledById: "admin-1",
        }),
      }),
    );
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "admin-1",
        action: "COMPLAINT_UPDATED",
        entityType: "Complaint",
        entityId: "complaint-1",
        metadata: { status: "RESOLVED", adminNote: "Refunded deposit" },
      }),
    );
  });
});
