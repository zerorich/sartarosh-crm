package uz.sartarosh.app.data.repository

import uz.sartarosh.app.data.api.ApiClient
import uz.sartarosh.app.data.api.CatalogApi
import uz.sartarosh.app.data.api.SalonApi
import uz.sartarosh.app.data.api.StaffApi
import uz.sartarosh.app.data.api.PaginatedData
import uz.sartarosh.app.data.api.requireData
import uz.sartarosh.app.data.model.SalonDto
import uz.sartarosh.app.data.model.ServiceDto
import uz.sartarosh.app.data.model.StaffMemberDto

class SalonRepository(
    private val salonApi: SalonApi = ApiClient.salonApi,
    private val catalogApi: CatalogApi = ApiClient.catalogApi,
    private val staffApi: StaffApi = ApiClient.staffApi,
) {

    suspend fun getSalons(page: Int = 1, limit: Int = 20): PaginatedData<SalonDto> {
        return salonApi.listSalons(page, limit).requireData()
    }

    suspend fun getSalon(salonId: String): SalonDto {
        return salonApi.getSalon(salonId).requireData()
    }

    suspend fun getServices(salonId: String): List<ServiceDto> {
        return catalogApi.listServices(salonId).requireData()
    }

    suspend fun getStaff(salonId: String): List<StaffMemberDto> {
        return staffApi.listStaff(salonId).requireData()
    }
}
