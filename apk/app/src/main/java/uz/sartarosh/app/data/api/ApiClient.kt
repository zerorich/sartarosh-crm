package uz.sartarosh.app.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import uz.sartarosh.app.BuildConfig
import java.util.concurrent.TimeUnit

object ApiClient {

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(AuthInterceptor())
            .addInterceptor(
                HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                },
            )
            .build()
    }

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun <T> createService(service: Class<T>): T = retrofit.create(service)

    val authApi: AuthApi by lazy { createService(AuthApi::class.java) }
    val userApi: UserApi by lazy { createService(UserApi::class.java) }
    val salonApi: SalonApi by lazy { createService(SalonApi::class.java) }
    val catalogApi: CatalogApi by lazy { createService(CatalogApi::class.java) }
    val staffApi: StaffApi by lazy { createService(StaffApi::class.java) }
    val bookingApi: BookingApi by lazy { createService(BookingApi::class.java) }
}
