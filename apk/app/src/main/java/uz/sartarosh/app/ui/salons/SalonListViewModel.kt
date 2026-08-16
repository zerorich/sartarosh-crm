package uz.sartarosh.app.ui.salons

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import uz.sartarosh.app.data.model.SalonDto
import uz.sartarosh.app.data.repository.SalonRepository

class SalonListViewModel(
    private val repository: SalonRepository = SalonRepository(),
) : ViewModel() {

    private val _salons = MutableLiveData<List<SalonDto>>(emptyList())
    val salons: LiveData<List<SalonDto>> = _salons

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>(null)
    val error: LiveData<String?> = _error

    fun loadSalons(refresh: Boolean = false) {
        if (_loading.value == true && !refresh) return

        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            try {
                val result = repository.getSalons(page = 1, limit = 20)
                _salons.value = result.items
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load salons"
            } finally {
                _loading.value = false
            }
        }
    }
}
