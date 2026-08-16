package uz.sartarosh.app.data.api

import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import uz.sartarosh.app.data.model.SalonDto

interface SalonApi {

    @GET("salons")
    suspend fun listSalons(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): ApiResponse<PaginatedData<SalonDto>>

    @GET("salons/{id}")
    suspend fun getSalon(
        @Path("id") salonId: String,
    ): ApiResponse<SalonDto>
}
