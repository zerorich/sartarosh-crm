package uz.sartarosh.app.ui.salons

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import uz.sartarosh.app.data.model.SalonDto
import uz.sartarosh.app.data.model.ServiceDto
import uz.sartarosh.app.data.model.StaffMemberDto
import uz.sartarosh.app.data.model.isActiveBarber
import uz.sartarosh.app.data.repository.SalonRepository

data class SalonDetailState(
    val salon: SalonDto? = null,
    val services: List<ServiceDto> = emptyList(),
    val staff: List<StaffMemberDto> = emptyList(),
    val selectedBarberId: String? = null,
)

class SalonDetailViewModel(
    private val repository: SalonRepository = SalonRepository(),
) : ViewModel() {

    private val _state = MutableLiveData(SalonDetailState())
    val state: LiveData<SalonDetailState> = _state

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>(null)
    val error: LiveData<String?> = _error

    fun loadSalonDetail(salonId: String) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                val detail = coroutineScope {
                    val salonDeferred = async { repository.getSalon(salonId) }
                    val servicesDeferred = async { repository.getServices(salonId) }
                    val staffDeferred = async { repository.getStaff(salonId) }
                    Triple(
                        salonDeferred.await(),
                        servicesDeferred.await(),
                        staffDeferred.await(),
                    )
                }
                val (salon, services, staff) = detail
                val activeStaff = staff.filter { it.isActiveBarber() }
                _state.value = SalonDetailState(
                    salon = salon,
                    services = services.filter { it.isActive },
                    staff = activeStaff,
                    selectedBarberId = activeStaff.firstOrNull()?.barberId,
                )
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load salon"
            } finally {
                _loading.value = false
            }
        }
    }

    fun selectBarber(barberId: String) {
        val current = _state.value ?: return
        _state.value = current.copy(selectedBarberId = barberId)
    }

    fun resolveBarberIdForBooking(): String? {
        val current = _state.value ?: return null
        return current.selectedBarberId ?: current.staff.firstOrNull()?.barberId
    }
}
