package uz.sartarosh.app.data.model

import com.google.gson.annotations.SerializedName

data class SendOtpRequest(
    @SerializedName("phone") val phone: String,
    @SerializedName("role") val role: String = ROLE_CLIENT,
)

data class SendOtpData(
    @SerializedName("phone") val phone: String,
    @SerializedName("expiresInSeconds") val expiresInSeconds: Int,
    @SerializedName("debugOtp") val debugOtp: String? = null,
)

data class VerifyOtpRequest(
    @SerializedName("phone") val phone: String,
    @SerializedName("otp") val otp: String,
    @SerializedName("role") val role: String = ROLE_CLIENT,
)

data class AuthTokens(
    @SerializedName("accessToken") val accessToken: String,
    @SerializedName("refreshToken") val refreshToken: String,
    @SerializedName("expiresIn") val expiresIn: String,
)

data class AuthUser(
    @SerializedName("id") val id: String,
    @SerializedName("phone") val phone: String,
    @SerializedName("role") val role: String,
    @SerializedName("firstName") val firstName: String?,
    @SerializedName("lastName") val lastName: String?,
    @SerializedName("avatarUrl") val avatarUrl: String?,
    @SerializedName("isBlocked") val isBlocked: Boolean,
    @SerializedName("noShowCount") val noShowCount: Int,
    @SerializedName("restrictedUntil") val restrictedUntil: String?,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String,
)

data class VerifyOtpData(
    @SerializedName("user") val user: AuthUser,
    @SerializedName("tokens") val tokens: AuthTokens,
    @SerializedName("isNewUser") val isNewUser: Boolean,
)

const val ROLE_CLIENT = "CLIENT"
