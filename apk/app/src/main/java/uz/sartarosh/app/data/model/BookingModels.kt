package uz.sartarosh.app.data.model

import com.google.gson.annotations.SerializedName

enum class BookingStatus {
    @SerializedName("PENDING") PENDING,
    @SerializedName("CONFIRMED") CONFIRMED,
    @SerializedName("ARRIVED") ARRIVED,
    @SerializedName("IN_PROGRESS") IN_PROGRESS,
    @SerializedName("COMPLETED") COMPLETED,
    @SerializedName("CANCELLED") CANCELLED,
    @SerializedName("NO_SHOW") NO_SHOW,
}

data class BookingSalonRef(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("ownerId") val ownerId: String? = null,
)

data class BookingBarberRef(
    @SerializedName("id") val id: String,
    @SerializedName("userId") val userId: String? = null,
)

data class BookingServiceRef(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("durationMinutes") val durationMinutes: Int? = null,
)

data class BookingDto(
    @SerializedName("id") val id: String,
    @SerializedName("clientId") val clientId: String,
    @SerializedName("salonId") val salonId: String,
    @SerializedName("barberId") val barberId: String,
    @SerializedName("serviceId") val serviceId: String,
    @SerializedName("status") val status: BookingStatus,
    @SerializedName("startAt") val startAt: String,
    @SerializedName("endAt") val endAt: String? = null,
    @SerializedName("scheduledStartAt") val scheduledStartAt: String? = null,
    @SerializedName("price") val price: Double,
    @SerializedName("depositAmount") val depositAmount: Double,
    @SerializedName("remainingAmount") val remainingAmount: Double? = null,
    @SerializedName("cancelledAt") val cancelledAt: String? = null,
    @SerializedName("cancelReason") val cancelReason: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("salon") val salon: BookingSalonRef? = null,
    @SerializedName("barber") val barber: BookingBarberRef? = null,
    @SerializedName("service") val service: BookingServiceRef? = null,
)

data class CreateBookingRequest(
    @SerializedName("salonId") val salonId: String,
    @SerializedName("barberId") val barberId: String,
    @SerializedName("serviceId") val serviceId: String,
    @SerializedName("startAt") val startAt: String,
    @SerializedName("couponId") val couponId: String? = null,
)

data class CancelBookingRequest(
    @SerializedName("reason") val reason: String? = null,
)
