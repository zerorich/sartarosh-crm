package uz.sartarosh.app.data.api

import retrofit2.http.GET
import retrofit2.http.Path
import uz.sartarosh.app.data.model.ServiceDto

interface CatalogApi {

    @GET("salons/{id}/services")
    suspend fun listServices(
        @Path("id") salonId: String,
    ): ApiResponse<List<ServiceDto>>
}
