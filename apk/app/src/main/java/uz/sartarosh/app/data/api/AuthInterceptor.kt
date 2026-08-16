package uz.sartarosh.app.data.api

import okhttp3.Interceptor
import okhttp3.Response
import uz.sartarosh.app.SartaroshApp

class AuthInterceptor(
    private val sessionProvider: () -> String? = {
        SartaroshApp.instance.sessionManager.accessToken
    },
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val requestBuilder = chain.request().newBuilder()
        sessionProvider()?.let { token ->
            requestBuilder.header("Authorization", "Bearer $token")
        }
        return chain.proceed(requestBuilder.build())
    }
}
