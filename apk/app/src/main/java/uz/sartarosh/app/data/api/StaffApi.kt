package uz.sartarosh.app.data.api

import retrofit2.http.GET
import retrofit2.http.Path
import uz.sartarosh.app.data.model.StaffMemberDto

interface StaffApi {

    @GET("salons/{id}/staff")
    suspend fun listStaff(
        @Path("id") salonId: String,
    ): ApiResponse<List<StaffMemberDto>>
}
