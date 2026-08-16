package uz.sartarosh.app.data.api

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import uz.sartarosh.app.data.model.UpdateProfileRequest
import uz.sartarosh.app.data.model.UserProfile

interface UserApi {

    @GET("users/me")
    suspend fun getMe(): ApiResponse<UserProfile>

    @PATCH("users/me")
    suspend fun updateMe(@Body body: UpdateProfileRequest): ApiResponse<UserProfile>
}
