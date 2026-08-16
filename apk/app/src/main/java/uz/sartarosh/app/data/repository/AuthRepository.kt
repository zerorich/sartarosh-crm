package uz.sartarosh.app.data.repository

import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import uz.sartarosh.app.SartaroshApp
import uz.sartarosh.app.data.api.ApiClient
import uz.sartarosh.app.data.api.AuthApi
import uz.sartarosh.app.data.local.SessionManager
import uz.sartarosh.app.data.model.ROLE_CLIENT
import uz.sartarosh.app.data.model.SendOtpData
import uz.sartarosh.app.data.model.SendOtpRequest
import uz.sartarosh.app.data.model.VerifyOtpData
import uz.sartarosh.app.data.model.VerifyOtpRequest
import java.io.IOException

class AuthRepository(
    private val authApi: AuthApi = ApiClient.authApi,
    private val sessionManager: SessionManager = SartaroshApp.instance.sessionManager,
    private val gson: Gson = Gson(),
) {

    suspend fun sendOtp(phone: String): Result<SendOtpData> = withContext(Dispatchers.IO) {
        try {
            val response = authApi.sendOtp(
                SendOtpRequest(phone = phone, role = ROLE_CLIENT),
            )
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(ApiException(response.message ?: "Failed to send OTP", response.code))
            }
        } catch (error: Exception) {
            Result.failure(mapError(error))
        }
    }

    suspend fun verifyOtp(phone: String, otp: String): Result<VerifyOtpData> = withContext(Dispatchers.IO) {
        try {
            val response = authApi.verifyOtp(
                VerifyOtpRequest(phone = phone, otp = otp, role = ROLE_CLIENT),
            )
            if (response.success && response.data != null) {
                val data = response.data
                sessionManager.saveSession(
                    accessToken = data.tokens.accessToken,
                    refreshToken = data.tokens.refreshToken,
                    userJson = gson.toJson(data.user),
                )
                Result.success(data)
            } else {
                Result.failure(ApiException(response.message ?: "Failed to verify OTP", response.code))
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
