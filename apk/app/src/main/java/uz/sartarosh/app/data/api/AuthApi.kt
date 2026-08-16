package uz.sartarosh.app.data.api

import retrofit2.http.Body
import retrofit2.http.POST
import uz.sartarosh.app.data.model.SendOtpData
import uz.sartarosh.app.data.model.SendOtpRequest
import uz.sartarosh.app.data.model.VerifyOtpData
import uz.sartarosh.app.data.model.VerifyOtpRequest

interface AuthApi {

    @POST("auth/send-otp")
    suspend fun sendOtp(@Body body: SendOtpRequest): ApiResponse<SendOtpData>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body body: VerifyOtpRequest): ApiResponse<VerifyOtpData>
}
