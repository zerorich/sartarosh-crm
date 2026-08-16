package uz.sartarosh.app.data.api

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import uz.sartarosh.app.data.model.BookingDto
import uz.sartarosh.app.data.model.CancelBookingRequest
import uz.sartarosh.app.data.model.CreateBookingRequest

interface BookingApi {

    @GET("bookings")
    suspend fun listBookings(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null,
    ): ApiResponse<PaginatedData<BookingDto>>

    @POST("bookings")
    suspend fun createBooking(
        @Body body: CreateBookingRequest,
    ): ApiResponse<BookingDto>

    @POST("bookings/{id}/cancel")
    suspend fun cancelBooking(
        @Path("id") id: String,
        @Body body: CancelBookingRequest = CancelBookingRequest(),
    ): ApiResponse<BookingDto>
}
