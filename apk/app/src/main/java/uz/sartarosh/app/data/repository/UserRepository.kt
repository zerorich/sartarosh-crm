package uz.sartarosh.app.data.repository

import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import uz.sartarosh.app.SartaroshApp
import uz.sartarosh.app.data.api.ApiClient
import uz.sartarosh.app.data.api.UserApi
import uz.sartarosh.app.data.local.SessionManager
import uz.sartarosh.app.data.model.UpdateProfileRequest
import uz.sartarosh.app.data.model.UserProfile
import java.io.IOException

class UserRepository(
    private val userApi: UserApi = ApiClient.userApi,
    private val sessionManager: SessionManager = SartaroshApp.instance.sessionManager,
    private val gson: Gson = Gson(),
) {

    suspend fun getMyProfile(): Result<UserProfile> = withContext(Dispatchers.IO) {
        try {
            val response = userApi.getMe()
            if (response.success && response.data != null) {
                sessionManager.saveUser(gson.toJson(response.data))
                Result.success(response.data)
            } else {
                Result.failure(ApiException(response.message ?: "Failed to load profile", response.code))
            }
        } catch (error: Exception) {
            Result.failure(mapError(error))
        }
    }

    suspend fun updateProfile(firstName: String?, lastName: String?): Result<UserProfile> =
        withContext(Dispatchers.IO) {
            try {
                val response = userApi.updateMe(UpdateProfileRequest(firstName, lastName))
                if (response.success && response.data != null) {
                    sessionManager.saveUser(gson.toJson(response.data))
                    Result.success(response.data)
                } else {
                    Result.failure(ApiException(response.message ?: "Failed to update profile", response.code))
                }
            } catch (error: Exception) {
                Result.failure(mapError(error))
            }
        }

    private fun mapError(error: Throwable): Throwable {
        if (error is ApiException) return error

        if (error is HttpException) {
            val body = error.response()?.errorBody()?.string()
            if (!body.isNullOrBlank()) {
                runCatching {
                    val parsed = gson.fromJson(body, ApiErrorBody::class.java)
                    if (!parsed.message.isNullOrBlank()) {
                        return ApiException(parsed.message, parsed.code)
                    }
                }
            }
            return ApiException("Server error (${error.code()})", null)
        }

        if (error is IOException) {
            return ApiException("Network error. Check API URL and connection.", null)
        }

        return error
    }

    class ApiException(
        override val message: String,
        val code: String?,
    ) : Exception(message)

    private data class ApiErrorBody(
        val success: Boolean? = null,
        val message: String? = null,
        val code: String? = null,
    )
}
