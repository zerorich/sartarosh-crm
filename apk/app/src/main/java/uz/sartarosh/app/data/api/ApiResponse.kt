package uz.sartarosh.app.data.api

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String? = null,
    val code: String? = null,
)

data class PaginatedData<T>(
    val items: List<T>,
    val page: Int,
    val limit: Int,
    val total: Int,
)

fun <T> ApiResponse<T>.requireData(): T {
    check(success && data != null) {
        message ?: "Request failed"
    }
    return data!!
}
