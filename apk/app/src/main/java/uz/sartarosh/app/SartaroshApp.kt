package uz.sartarosh.app

import android.app.Application
import uz.sartarosh.app.data.local.SessionManager

class SartaroshApp : Application() {

    lateinit var sessionManager: SessionManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        SessionManager.init(this)
        sessionManager = SessionManager.getInstance()
    }

    companion object {
        lateinit var instance: SartaroshApp
            private set
    }
}
