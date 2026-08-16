package uz.sartarosh.app.data.model

import com.google.gson.annotations.SerializedName

data class ProfileStats(
    @SerializedName("totalBookings") val totalBookings: Int,
    @SerializedName("completedBookings") val completedBookings: Int,
    @SerializedName("reviewsCount") val reviewsCount: Int,
    @SerializedName("memberSince") val memberSince: String,
)

data class UserProfile(
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
    @SerializedName("stats") val stats: ProfileStats? = null,
)

fun UserProfile.displayName(): String {
    val name = listOfNotNull(firstName, lastName).joinToString(" ").trim()
    return name.ifBlank { phone }
}

data class UpdateProfileRequest(
    @SerializedName("firstName") val firstName: String? = null,
    @SerializedName("lastName") val lastName: String? = null,
)
