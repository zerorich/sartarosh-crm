package uz.sartarosh.app.data.local

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import uz.sartarosh.app.data.model.AuthUser

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private val gson = Gson()

    var accessToken: String?
        get() = prefs.getString(KEY_ACCESS_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_ACCESS_TOKEN, value).apply()

    var refreshToken: String?
        get() = prefs.getString(KEY_REFRESH_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_REFRESH_TOKEN, value).apply()

    val userPhone: String?
        get() = getUser()?.phone

    val isLoggedIn: Boolean
        get() = !accessToken.isNullOrBlank()

    fun saveSession(accessToken: String, refreshToken: String, userJson: String) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, accessToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .putString(KEY_USER_JSON, userJson)
            .apply()
    }

    fun getUser(): AuthUser? {
        val json = prefs.getString(KEY_USER_JSON, null) ?: return null
        return runCatching { gson.fromJson(json, AuthUser::class.java) }.getOrNull()
    }

    fun saveUser(userJson: String) {
        prefs.edit().putString(KEY_USER_JSON, userJson).apply()
    }

    fun clear() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val PREFS_NAME = "sartarosh_session"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_JSON = "user_json"

        @Volatile
        private var instance: SessionManager? = null

        fun getInstance(): SessionManager {
            return checkNotNull(instance) {
                "SessionManager not initialized. Call init() from Application.onCreate()."
            }
        }

        fun init(context: Context) {
            if (instance == null) {
                synchronized(this) {
                    if (instance == null) {
                        instance = SessionManager(context.applicationContext)
                    }
                }
            }
        }
    }
}
