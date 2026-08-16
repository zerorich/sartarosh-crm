package uz.sartarosh.app.data.repository

import uz.sartarosh.app.data.api.ApiClient
import uz.sartarosh.app.data.model.BookingDto
import uz.sartarosh.app.data.model.BookingStatus
import uz.sartarosh.app.data.model.CancelBookingRequest
import uz.sartarosh.app.data.model.CreateBookingRequest
import uz.sartarosh.app.data.model.isActiveBarber

class BookingRepository {

    suspend fun listBookings(page: Int = 1, limit: Int = 20): Result<List<BookingDto>> = runCatching {
        val response = ApiClient.bookingApi.listBookings(page = page, limit = limit)
        if (!response.success || response.data == null) {
            throw AuthRepository.ApiException(response.message ?: "Failed to load bookings", response.code)
        }
        response.data.items
    }

    suspend fun createBooking(
        salonId: String,
        serviceId: String,
        barberId: String?,
        startAtIso: String,
    ): Result<BookingDto> = runCatching {
        val resolvedBarberId = barberId?.takeIf { it.isNotBlank() }
            ?: resolveFirstActiveBarber(salonId)

        val response = ApiClient.bookingApi.createBooking(
            CreateBookingRequest(
                salonId = salonId,
                barberId = resolvedBarberId,
                serviceId = serviceId,
                startAt = startAtIso,
            ),
        )
        if (!response.success || response.data == null) {
            throw AuthRepository.ApiException(response.message ?: "Failed to create booking", response.code)
        }
        response.data
    }

    suspend fun cancelBooking(id: String, reason: String? = null): Result<BookingDto> = runCatching {
        val response = ApiClient.bookingApi.cancelBooking(id, CancelBookingRequest(reason))
        if (!response.success || response.data == null) {
            throw AuthRepository.ApiException(response.message ?: "Failed to cancel booking", response.code)
        }
        response.data
    }

    private suspend fun resolveFirstActiveBarber(salonId: String): String {
        val response = ApiClient.staffApi.listStaff(salonId)
        if (!response.success || response.data == null) {
            throw AuthRepository.ApiException(response.message ?: "Failed to load salon staff", response.code)
        }
        return response.data
            .firstOrNull { it.isActiveBarber() }
            ?.barberId
            ?: throw AuthRepository.ApiException("No active barber found for this salon", null)
    }

    fun canCancel(status: BookingStatus): Boolean =
        status !in setOf(
            BookingStatus.CANCELLED,
            BookingStatus.COMPLETED,
            BookingStatus.NO_SHOW,
        )
}
