import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Sartarosh API",
      version: "1.0.0",
      description:
        "Barbershop booking platform — Auth, Users, Salons, Barbers, Services, Booking, Payments, Reviews, Finance, Admin",
    },
    servers: [{ url: `http://localhost:${env.PORT}`, description: "Local" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      parameters: {
        IdParam: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        PageQuery: {
          name: "page",
          in: "query",
          schema: { type: "integer", minimum: 1, default: 1 },
        },
        LimitQuery: {
          name: "limit",
          in: "query",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        },
        SalonIdQuery: {
          name: "salonId",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        PeriodStartQuery: {
          name: "periodStart",
          in: "query",
          required: true,
          schema: { type: "string", format: "date-time" },
        },
        PeriodEndQuery: {
          name: "periodEnd",
          in: "query",
          required: true,
          schema: { type: "string", format: "date-time" },
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            code: { type: "string" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
        Paginated: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                items: { type: "array", items: { type: "object" } },
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
              },
            },
          },
        },
        SendOtpRequest: {
          type: "object",
          required: ["phone"],
          properties: {
            phone: { type: "string", example: "+998901234567" },
            role: { type: "string", enum: ["CLIENT", "BARBER", "OWNER"], default: "CLIENT" },
          },
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["phone", "otp"],
          properties: {
            phone: { type: "string" },
            otp: { type: "string", example: "123456" },
            role: { type: "string", enum: ["CLIENT", "BARBER", "OWNER"] },
            firstName: { type: "string" },
            lastName: { type: "string" },
          },
        },
        RefreshRequest: {
          type: "object",
          properties: {
            refreshToken: { type: "string" },
          },
        },
        LogoutRequest: {
          type: "object",
          properties: {
            refreshToken: { type: "string" },
          },
        },
        WorkingHour: {
          type: "object",
          required: ["dayOfWeek", "startTime", "endTime"],
          properties: {
            dayOfWeek: { type: "integer", minimum: 0, maximum: 6 },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "18:00" },
          },
        },
        SalonCreate: {
          type: "object",
          required: ["name", "address", "lat", "lng"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            lat: { type: "number" },
            lng: { type: "number" },
            phone: { type: "string" },
            coverUrl: { type: "string", format: "uri" },
            depositType: { type: "string", enum: ["PERCENTAGE", "FIXED", "NONE"] },
            depositValue: { type: "number" },
            workingHours: { type: "array", items: { $ref: "#/components/schemas/WorkingHour" } },
          },
        },
        SalonUpdate: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            lat: { type: "number" },
            lng: { type: "number" },
            phone: { type: "string" },
            coverUrl: { type: "string", format: "uri" },
            depositType: { type: "string", enum: ["PERCENTAGE", "FIXED", "NONE"] },
            depositValue: { type: "number" },
            workingHours: { type: "array", items: { $ref: "#/components/schemas/WorkingHour" } },
          },
        },
        InviteStaff: {
          type: "object",
          required: ["barberPhone"],
          properties: {
            barberPhone: { type: "string" },
            salaryType: { type: "string", enum: ["FIXED", "PERCENTAGE", "FIXED_PLUS_PERCENTAGE"] },
            salaryFixed: { type: "number" },
            salaryPercent: { type: "number", minimum: 0, maximum: 100 },
          },
        },
        UpdateStaff: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["INVITED", "ACTIVE", "REJECTED", "REMOVED"] },
            salaryType: { type: "string", enum: ["FIXED", "PERCENTAGE", "FIXED_PLUS_PERCENTAGE"] },
            salaryFixed: { type: "number" },
            salaryPercent: { type: "number", minimum: 0, maximum: 100 },
          },
        },
        ServiceCreate: {
          type: "object",
          required: ["name", "durationMinutes", "price"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            durationMinutes: { type: "integer", minimum: 5, maximum: 480 },
            price: { type: "number" },
          },
        },
        ServiceUpdate: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string", nullable: true },
            durationMinutes: { type: "integer", minimum: 5, maximum: 480 },
            isActive: { type: "boolean" },
          },
        },
        ChangePrice: {
          type: "object",
          required: ["price"],
          properties: {
            price: { type: "number", minimum: 0 },
          },
        },
        BookingCreate: {
          type: "object",
          required: ["salonId", "barberId", "serviceId", "startAt"],
          properties: {
            salonId: { type: "string", format: "uuid" },
            barberId: { type: "string", format: "uuid" },
            serviceId: { type: "string", format: "uuid" },
            startAt: { type: "string", format: "date-time" },
            couponId: { type: "string", format: "uuid" },
          },
        },
        BookingCancel: {
          type: "object",
          properties: {
            reason: { type: "string" },
          },
        },
        PaymentCreate: {
          type: "object",
          required: ["bookingId", "method", "type"],
          properties: {
            bookingId: { type: "string", format: "uuid" },
            method: { type: "string", enum: ["ONLINE", "CASH", "CARD"] },
            type: { type: "string", enum: ["DEPOSIT", "REMAINING", "FULL"] },
          },
        },
        PaymentVerify: {
          type: "object",
          properties: {
            signature: { type: "string" },
          },
        },
        PaymentRefund: {
          type: "object",
          properties: {
            reason: { type: "string" },
          },
        },
        ReviewCreate: {
          type: "object",
          required: ["bookingId", "barberRating", "salonRating", "serviceRating"],
          properties: {
            bookingId: { type: "string", format: "uuid" },
            barberRating: { type: "integer", minimum: 1, maximum: 5 },
            salonRating: { type: "integer", minimum: 1, maximum: 5 },
            serviceRating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string" },
          },
        },
        ReviewUpdate: {
          type: "object",
          properties: {
            barberRating: { type: "integer", minimum: 1, maximum: 5 },
            salonRating: { type: "integer", minimum: 1, maximum: 5 },
            serviceRating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string", nullable: true },
          },
        },
        ExpenseCreate: {
          type: "object",
          required: ["salonId", "category", "amount", "date"],
          properties: {
            salonId: { type: "string", format: "uuid" },
            category: {
              type: "string",
              enum: ["EQUIPMENT", "CONSUMABLE", "RENT", "UTILITY", "MARKETING", "SALARY", "OTHER"],
            },
            amount: { type: "number" },
            date: { type: "string", format: "date-time" },
            note: { type: "string" },
            barberId: { type: "string", format: "uuid" },
          },
        },
        ExpenseUpdate: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["EQUIPMENT", "CONSUMABLE", "RENT", "UTILITY", "MARKETING", "SALARY", "OTHER"],
            },
            amount: { type: "number" },
            date: { type: "string", format: "date-time" },
            note: { type: "string", nullable: true },
            barberId: { type: "string", format: "uuid", nullable: true },
          },
        },
        ComplaintCreate: {
          type: "object",
          required: ["subject", "body"],
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
            salonId: { type: "string", format: "uuid" },
            bookingId: { type: "string", format: "uuid" },
          },
        },
        ComplaintUpdate: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"] },
            adminNote: { type: "string" },
          },
        },
        AdminSettings: {
          type: "object",
          properties: {
            noShowLimit: { type: "integer" },
            noShowRestrictionDays: { type: "integer" },
            barberDelayThreshold: { type: "integer" },
            barberDelayCompensationPercent: { type: "number" },
            couponExpirationDays: { type: "integer" },
            reviewEditWindow: { type: "integer" },
            defaultSearchRadius: { type: "integer" },
            reminder24hEnabled: { type: "boolean" },
            reminder30mEnabled: { type: "boolean" },
          },
        },
        BlockUser: {
          type: "object",
          required: ["block"],
          properties: {
            block: { type: "boolean" },
            reason: { type: "string" },
          },
        },
        RejectSalon: {
          type: "object",
          required: ["reason"],
          properties: {
            reason: { type: "string" },
          },
        },
        BlockSalon: {
          type: "object",
          properties: {
            reason: { type: "string" },
          },
        },
      },
    },
    tags: [
      { name: "Auth" },
      { name: "Users" },
      { name: "Salons" },
      { name: "Barbers" },
      { name: "Services" },
      { name: "Booking" },
      { name: "Payments" },
      { name: "Reviews" },
      { name: "Finance" },
      { name: "Admin" },
      { name: "Complaints" },
      { name: "Notifications" },
    ],
  },
  apis: ["./src/routes/*.ts"],
});
