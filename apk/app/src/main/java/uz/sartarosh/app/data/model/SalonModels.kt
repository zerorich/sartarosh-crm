package uz.sartarosh.app.data.model

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.annotations.JsonAdapter
import com.google.gson.annotations.SerializedName
import java.lang.reflect.Type

data class SalonDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val address: String,
    val city: String? = null,
    val lat: Double = 0.0,
    val lng: Double = 0.0,
    val phone: String? = null,
    @SerializedName("coverUrl")
    val coverUrl: String? = null,
    val status: String? = null,
    val rating: Double = 0.0,
    @SerializedName("reviewCount")
    val reviewCount: Int = 0,
    @SerializedName("depositType")
    val depositType: String? = null,
    @SerializedName("depositValue")
    val depositValue: Double? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null,
    @SerializedName("workingHours")
    val workingHours: List<WorkingHourDto>? = null,
    @SerializedName("blockedTimes")
    val blockedTimes: List<BlockedTimeDto>? = null,
)

data class WorkingHourDto(
    @SerializedName("dayOfWeek")
    val dayOfWeek: Int,
    @SerializedName("startTime")
    val startTime: String,
    @SerializedName("endTime")
    val endTime: String,
)

data class BlockedTimeDto(
    val id: String? = null,
    @SerializedName("startAt")
    val startAt: String? = null,
    @SerializedName("endAt")
    val endAt: String? = null,
)

data class ServiceDto(
    val id: String,
    @SerializedName("salonId")
    val salonId: String,
    val name: String,
    val description: String? = null,
    @SerializedName("durationMinutes")
    val durationMinutes: Int = 0,
    @JsonAdapter(FlexibleDoubleAdapter::class)
    val price: Double = 0.0,
    @SerializedName("isActive")
    val isActive: Boolean = true,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null,
)

data class StaffMemberDto(
    val id: String,
    @SerializedName("salonId")
    val salonId: String,
    @SerializedName("barberId")
    val barberId: String,
    val status: String,
    @SerializedName("salaryType")
    val salaryType: String? = null,
    @SerializedName("salaryFixed")
    val salaryFixed: Double? = null,
    @SerializedName("salaryPercent")
    val salaryPercent: Double? = null,
    val barber: BarberInfoDto,
)

data class BarberInfoDto(
    val id: String,
    val bio: String? = null,
    val rating: Double = 0.0,
    @SerializedName("reviewCount")
    val reviewCount: Int = 0,
    val user: BarberUserDto,
)

data class BarberUserDto(
    val id: String,
    @SerializedName("firstName")
    val firstName: String? = null,
    @SerializedName("lastName")
    val lastName: String? = null,
    @SerializedName("avatarUrl")
    val avatarUrl: String? = null,
    val phone: String? = null,
)

class FlexibleDoubleAdapter : JsonDeserializer<Double> {
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?,
    ): Double {
        if (json == null || json.isJsonNull) return 0.0
        return when {
            json.isJsonPrimitive && json.asJsonPrimitive.isNumber -> json.asDouble
            json.isJsonPrimitive && json.asJsonPrimitive.isString ->
                json.asString.toDoubleOrNull() ?: 0.0
            else -> 0.0
        }
    }
}

fun BarberUserDto.displayName(): String {
    val fullName = listOfNotNull(firstName, lastName)
        .joinToString(" ")
        .trim()
    return fullName.ifBlank { phone ?: "Barber" }
}

fun StaffMemberDto.isActiveBarber(): Boolean = status == "ACTIVE"
