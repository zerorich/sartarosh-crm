import {
  BookingStatus,
  ExpenseCategory,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PrismaClient,
  Role,
  SalaryType,
  SalonStatus,
  StaffStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

function phone(n: number) {
  return `+99890000${String(n).padStart(4, "0")}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("Seeding database...");

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.barberService.deleteMany();
  await prisma.servicePriceHistory.deleteMany();
  await prisma.service.deleteMany();
  await prisma.salonStaff.deleteMany();
  await prisma.workingHour.deleteMany();
  await prisma.blockedTime.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.barberProfile.deleteMany();
  await prisma.ownerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminSetting.deleteMany();

  await prisma.adminSetting.create({
    data: {
      noShowLimit: 3,
      noShowRestrictionDays: 14,
      barberDelayThreshold: 5,
      barberDelayCompensationPercent: 10,
      couponExpirationDays: 30,
      reviewEditWindow: 48,
      defaultSearchRadius: 10,
      reminder24hEnabled: true,
      reminder30mEnabled: true,
    },
  });

  const superAdmin = await prisma.user.create({
    data: { phone: phone(1), role: Role.SUPER_ADMIN, firstName: "Super", lastName: "Admin" },
  });

  const admins = await Promise.all(
    [2, 3].map((n) =>
      prisma.user.create({
        data: { phone: phone(n), role: Role.ADMIN, firstName: "Admin", lastName: String(n) },
      }),
    ),
  );

  const owners = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.user.create({
        data: {
          phone: phone(10 + i),
          role: Role.OWNER,
          firstName: "Owner",
          lastName: String(i + 1),
          ownerProfile: { create: {} },
        },
        include: { ownerProfile: true },
      }),
    ),
  );

  const barbers = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          phone: phone(20 + i),
          role: Role.BARBER,
          firstName: "Barber",
          lastName: String(i + 1),
          barberProfile: { create: { bio: `Professional barber #${i + 1}` } },
        },
        include: { barberProfile: true },
      }),
    ),
  );

  const clients = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.user.create({
        data: {
          phone: phone(40 + i),
          role: Role.CLIENT,
          firstName: "Client",
          lastName: String(i + 1),
          clientProfile: { create: {} },
        },
      }),
    ),
  );

  const salonData = [
    { name: "Classic Cut Tashkent", city: "Tashkent", lat: 41.311, lng: 69.279, status: SalonStatus.ACTIVE },
    { name: "Urban Fade", city: "Tashkent", lat: 41.32, lng: 69.25, status: SalonStatus.ACTIVE },
    { name: "Samarkand Style", city: "Samarkand", lat: 39.654, lng: 66.959, status: SalonStatus.ACTIVE },
    { name: "Pending Salon", city: "Bukhara", lat: 39.768, lng: 64.455, status: SalonStatus.PENDING },
    { name: "Elite Grooming", city: "Tashkent", lat: 41.29, lng: 69.24, status: SalonStatus.ACTIVE },
  ];

  const salons = [];
  for (let i = 0; i < salonData.length; i++) {
    const data = salonData[i]!;
    const owner = owners[i % owners.length]!;
    const salon = await prisma.salon.create({
      data: {
        ownerId: owner.ownerProfile!.id,
        name: data.name,
        description: `${data.name} — premium barbershop`,
        address: `${data.city} Main St ${i + 1}`,
        city: data.city,
        lat: data.lat,
        lng: data.lng,
        phone: phone(100 + i),
        status: data.status,
      },
    });
    salons.push(salon);
  }

  const serviceNames = ["Haircut", "Beard Trim", "Combo", "Kids Cut", "Head Shave"];
  const servicesBySalon: Record<string, { id: string; price: number }[]> = {};
  /** JS Date.getDay(): 0 Sunday … 6 Saturday — matches assertSlotAvailable. */
  const weekHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    startTime: "09:00",
    endTime: "20:00",
  }));

  for (const salon of salons.filter((s) => s.status === SalonStatus.ACTIVE)) {
    servicesBySalon[salon.id] = [];
    for (let i = 0; i < 3; i++) {
      const price = 50000 + i * 25000;
      const service = await prisma.service.create({
        data: {
          salonId: salon.id,
          name: serviceNames[i]!,
          durationMinutes: 30 + i * 15,
          price,
        },
      });
      servicesBySalon[salon.id]!.push({ id: service.id, price });
      await prisma.servicePriceHistory.create({
        data: {
          serviceId: service.id,
          price,
          effectiveFrom: daysAgo(60),
        },
      });
    }

    await prisma.workingHour.createMany({
      data: weekHours.map((h) => ({ ...h, salonId: salon.id })),
    });
  }

  const salaryTypes: SalaryType[] = ["FIXED", "PERCENTAGE", "FIXED_PLUS_PERCENTAGE"];
  for (let i = 0; i < barbers.length; i++) {
    const barber = barbers[i]!;
    const salon = salons[i % 4]!;
    if (salon.status !== SalonStatus.ACTIVE) continue;

    await prisma.salonStaff.create({
      data: {
        salonId: salon.id,
        barberId: barber.barberProfile!.id,
        status: StaffStatus.ACTIVE,
        salaryType: salaryTypes[i % 3]!,
        salaryFixed: 500000 + i * 100000,
        salaryPercent: 40 + i * 2,
        acceptedAt: daysAgo(30),
      },
    });

    const salonServices = servicesBySalon[salon.id] ?? [];
    for (const svc of salonServices) {
      await prisma.barberService.create({
        data: { barberId: barber.barberProfile!.id, serviceId: svc.id },
      });
    }

    await prisma.workingHour.createMany({
      data: weekHours.map((h) => ({ ...h, barberId: barber.barberProfile!.id })),
    });
  }

  const invitedBarber = barbers[7]!;
  const invitedSalon = salons[0]!;
  await prisma.salonStaff.create({
    data: {
      salonId: invitedSalon.id,
      barberId: invitedBarber.barberProfile!.id,
      status: StaffStatus.INVITED,
      salaryType: SalaryType.PERCENTAGE,
      salaryPercent: 50,
      invitedAt: new Date(),
    },
  });
  for (const svc of servicesBySalon[invitedSalon.id] ?? []) {
    await prisma.barberService.create({
      data: { barberId: invitedBarber.barberProfile!.id, serviceId: svc.id },
    });
  }

  const completedBookings = [];
  for (let i = 0; i < 15; i++) {
    const client = clients[i % clients.length]!;
    const barber = barbers[i % barbers.length]!;
    const salon = salons[i % 4]!;
    const services = servicesBySalon[salon.id] ?? [];
    const service = services[i % services.length];
    if (!service) continue;

    const startAt = daysAgo(10 - (i % 10));
    startAt.setHours(10 + (i % 6), 0, 0, 0);
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        salonId: salon.id,
        barberId: barber.barberProfile!.id,
        serviceId: service.id,
        status: BookingStatus.COMPLETED,
        startAt,
        endAt,
        scheduledStartAt: startAt,
        actualStartAt: startAt,
        actualEndAt: endAt,
        price: service.price,
        depositAmount: Math.round(service.price * 0.25),
        remainingAmount: Math.round(service.price * 0.75),
      },
    });
    completedBookings.push(booking);

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: service.price,
        method: i % 2 === 0 ? PaymentMethod.CASH : PaymentMethod.ONLINE,
        type: PaymentType.FULL,
        status: PaymentStatus.PAID,
        verifiedAt: endAt,
      },
    });
  }

  for (let i = 0; i < 8; i++) {
    const booking = completedBookings[i]!;
    const rating = 3 + (i % 3);
    await prisma.review.create({
      data: {
        bookingId: booking.id,
        clientId: booking.clientId,
        salonId: booking.salonId,
        barberId: booking.barberId,
        serviceId: booking.serviceId,
        barberRating: rating,
        salonRating: rating,
        serviceRating: rating,
        comment: i % 2 === 0 ? "Great service!" : undefined,
      },
    });
  }

  for (const salon of salons.filter((s) => s.status === SalonStatus.ACTIVE)) {
    const agg = await prisma.review.aggregate({
      where: { salonId: salon.id, isHidden: false },
      _avg: { salonRating: true },
      _count: true,
    });
    await prisma.salon.update({
      where: { id: salon.id },
      data: { rating: agg._avg.salonRating ?? 0, reviewCount: agg._count },
    });
  }

  const barberIds = [...new Set(completedBookings.map((b) => b.barberId))];
  for (const barberId of barberIds) {
    const agg = await prisma.review.aggregate({
      where: { barberId, isHidden: false },
      _avg: { barberRating: true },
      _count: true,
    });
    await prisma.barberProfile.update({
      where: { id: barberId },
      data: { rating: agg._avg.barberRating ?? 0, reviewCount: agg._count },
    });
  }

  for (const salon of salons.filter((s) => s.status === SalonStatus.ACTIVE)) {
    const categories: ExpenseCategory[] = ["RENT", "CONSUMABLE", "MARKETING", "UTILITY"];
    for (let i = 0; i < categories.length; i++) {
      await prisma.expense.create({
        data: {
          salonId: salon.id,
          category: categories[i]!,
          amount: 100000 * (i + 1),
          date: daysAgo(5 + i),
          note: `${categories[i]} expense`,
        },
      });
    }
  }

  await prisma.complaint.create({
    data: {
      clientId: clients[0]!.id,
      salonId: salons[0]!.id,
      subject: "Long wait time",
      body: "I had to wait 30 minutes past my appointment time.",
      status: "OPEN",
    },
  });

  await prisma.complaint.create({
    data: {
      clientId: clients[1]!.id,
      bookingId: completedBookings[0]!.id,
      subject: "Service quality",
      body: "The haircut was uneven on one side.",
      status: "IN_REVIEW",
      handledById: admins[0]!.id,
    },
  });

  for (let i = 0; i < 3; i++) {
    const startAt = daysFromNow(i === 0 ? 1 : 0);
    startAt.setHours(14, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000);
    const client = clients[15 + i]!;
    const barber = barbers[i]!;
    const salon = salons[0]!;
    const service = servicesBySalon[salon.id]![0]!;

    await prisma.booking.create({
      data: {
        clientId: client.id,
        salonId: salon.id,
        barberId: barber.barberProfile!.id,
        serviceId: service.id,
        status: BookingStatus.CONFIRMED,
        startAt,
        endAt,
        scheduledStartAt: startAt,
        price: service.price,
        depositAmount: Math.round(service.price * 0.25),
        remainingAmount: Math.round(service.price * 0.75),
        reminder24hSent: false,
        reminder30mSent: false,
      },
    });
  }

  console.log("Seed complete:");
  console.log(`  SUPER_ADMIN: ${superAdmin.phone}`);
  console.log(`  ADMINs: ${admins.length}, OWNERS: ${owners.length}, BARBERS: ${barbers.length}, CLIENTS: ${clients.length}`);
  console.log(`  SALONS: ${salons.length}, completed bookings: ${completedBookings.length}`);
  console.log(`  INVITED staff: 1 (${invitedBarber.phone} → ${invitedSalon.name})`);
  console.log("  Working hours: ACTIVE salons + ACTIVE barbers, 09:00-20:00 every day");
  console.log("  ServicePriceHistory: open record per seeded service");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
