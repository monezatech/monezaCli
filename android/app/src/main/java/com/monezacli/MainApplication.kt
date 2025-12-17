package com.monezacli

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  private val _reactNativeHost: ReactNativeHost by lazy {
    object : ReactNativeHost(this) {
      override fun getUseDeveloperSupport() = BuildConfig.DEBUG

      override fun getPackages() = PackageList(this@MainApplication).packages
    }
  }

  private val _reactHost: ReactHost by lazy {
    com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost(this.applicationContext, _reactNativeHost)
  }

  override val reactNativeHost: ReactNativeHost get() = _reactNativeHost

  override val reactHost: ReactHost get() = _reactHost

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, /* native exopackage */ false)
  }
}
