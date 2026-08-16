import { ApiError, ERROR_CODES } from "@/types/api";

const MESSAGES: Record<string, string> = {
  [ERROR_CODES.VALIDATION_ERROR]: "Kiritilgan ma'lumotlar noto'g'ri. Qaytadan tekshiring.",
  [ERROR_CODES.UNAUTHORIZED]: "Davom etish uchun tizimga kiring.",
  [ERROR_CODES.FORBIDDEN]: "Bu amal uchun ruxsatingiz yo'q.",
  [ERROR_CODES.NOT_FOUND]: "So'ralgan ma'lumot topilmadi.",
  [ERROR_CODES.CONFLICT]: "Bu vaqt band qilingan. Boshqa vaqt tanlang.",
  [ERROR_CODES.RATE_LIMITED]: "Juda ko'p urinish. Birozdan so'ng qayta urining.",
  [ERROR_CODES.USER_BLOCKED]: "Hisobingiz bloklangan. Yordam xizmatiga murojaat qiling.",
  [ERROR_CODES.USER_RESTRICTED]: "Bir nechta bo'lmagan tashrif tufayli bron qilish vaqtincha cheklangan.",
  [ERROR_CODES.OTP_INVALID]: "SMS-kod noto'g'ri.",
  [ERROR_CODES.OTP_EXPIRED]: "SMS-kod muddati tugagan. Qaytadan so'rang.",
  [ERROR_CODES.SALON_NOT_ACTIVE]: "Bu sartaroshxona hozircha faol emas.",
  [ERROR_CODES.SALON_CLOSED]: "Sartaroshxona bu vaqtda yopiq.",
  [ERROR_CODES.BARBER_NOT_WORKING]: "Sartarosh bu vaqtda ishlamaydi.",
  [ERROR_CODES.BARBER_NOT_IN_SALON]: "Bu sartarosh ushbu salonda ishlamaydi.",
  [ERROR_CODES.SERVICE_INACTIVE]: "Bu xizmat hozircha mavjud emas.",
  [ERROR_CODES.SERVICE_NOT_OFFERED]: "Bu sartarosh tanlangan xizmatni ko'rsatmaydi.",
  [ERROR_CODES.TIME_BLOCKED]: "Bu vaqt band. Boshqa vaqt tanlang.",
  [ERROR_CODES.BOOKING_SLOT_UNAVAILABLE]: "Afsuski, bu vaqt hozirgina band bo'ldi. Boshqa vaqt tanlang.",
  [ERROR_CODES.BOOKING_INVALID_STATUS]: "Bu amalni bajarib bo'lmaydi (bron holati mos kelmadi).",
  [ERROR_CODES.PAYMENT_UNVERIFIED]: "To'lovni tasdiqlab bo'lmadi. Qaytadan urining.",
  [ERROR_CODES.PAYMENT_INVALID]: "To'lov noto'g'ri yoki allaqachon bajarilgan.",
  [ERROR_CODES.COUPON_INVALID]: "Kupon yaroqsiz.",
  [ERROR_CODES.COUPON_EXPIRED]: "Kupon muddati tugagan.",
  [ERROR_CODES.REVIEW_NOT_ALLOWED]: "Bu bron uchun sharh qoldirib bo'lmaydi.",
  [ERROR_CODES.REVIEW_EXISTS]: "Bu bron uchun sharh allaqachon qoldirilgan.",
  [ERROR_CODES.INTERNAL_ERROR]: "Server xatosi. Birozdan so'ng qayta urining.",
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? error.message ?? MESSAGES[ERROR_CODES.INTERNAL_ERROR];
  }
  if (
    typeof window !== "undefined" &&
    error instanceof TypeError &&
    /fetch|network/i.test(error.message)
  ) {
    return "Internet aloqasi yo'q. Ulanishni tekshirib qayta urining.";
  }
  if (error instanceof Error) return error.message;
  return "Noma'lum xatolik yuz berdi.";
}
