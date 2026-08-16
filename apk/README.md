# Sartarosh — Android (Kotlin)

Нативное Android-приложение для записи в барбершопы платформы Sartarosh.

## Быстрый старт (демо)

### 1. Запустите backend

```bash
cd ../server
docker compose up
# или: npm install && npm run dev
```

API: `http://localhost:4000`

### 2. Соберите debug APK

> **Важно:** путь с кириллицей (`Рабочий стол`) ломает Android Gradle. Собирайте из копии:
> ```bash
> rsync -a --exclude node_modules --exclude .gradle --exclude app/build \
>   "/home/zerorich/Рабочий стол/sartarosh/apk/" /tmp/sartarosh-apk-build/
> cd /tmp/sartarosh-apk-build
> ./gradlew assembleDebug
> cp app/build/outputs/apk/debug/app-debug.apk ~/app-debug.apk
> ```

```bash
cd apk
chmod +x gradlew
./gradlew assembleDebug
```

JDK 17 задан в `gradle.properties` (`org.gradle.java.home=/home/zerorich/.jdks/jdk-17`). Если JDK в другом месте — поправь путь там.

APK: `app/build/outputs/apk/debug/app-debug.apk`

### 3. Установка на телефон

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

Или скопируйте `app-debug.apk` на телефон и откройте файл (разрешите установку из неизвестных источников).

## Демо-учётные данные

| Поле | Значение |
|------|----------|
| Телефон | `+998900000041` (seed-клиенты: `+998900000041` … `+998900000060`) |
| OTP | показывается на экране как **debugOtp** после «Отправить код» (только в dev-режиме backend) |

## URL API

| Устройство | BASE_URL |
|------------|----------|
| Эмулятор Android | `http://10.0.2.2:4000/api/` (по умолчанию в `build.gradle.kts`) |
| Реальный телефон (та же Wi‑Fi) | `http://<IP_НОУТБУКА>:4000/api/` |

Узнать IP ноутбука: `ip addr` или `hostname -I`

Изменить URL — в `app/build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:4000/api/\"")
```

Пересоберите APK после изменения.

## Требования для сборки

- **JDK 17** (обязательно; Java 25 не поддерживается Gradle 8.2)
- **Android SDK** с API 34
- `local.properties` с путём к SDK:

```properties
sdk.dir=/home/USER/Android/Sdk
```

### Установка Android SDK (Linux, если нет Android Studio)

```bash
mkdir -p ~/Android/Sdk/cmdline-tools
cd ~/Android/Sdk/cmdline-tools
# Скачайте commandlinetools-linux-* с developer.android.com
# Распакуйте в cmdline-tools/latest/

export ANDROID_HOME=~/Android/Sdk
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

echo "sdk.dir=$ANDROID_HOME" > apk/local.properties
```

### JDK 17 (если система использует Java 25)

```bash
# Portable JDK уже может быть в ~/.local/jdk-17
export JAVA_HOME=$HOME/.local/jdk-17
cd apk && ./gradlew assembleDebug
```

Или установите системный JDK 17:

```bash
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

## Навигация в приложении

- **Салоны** — список барбершопов, детали, запись
- **Записи** — мои бронирования
- **Профиль** — телефон пользователя, кнопка «Выйти»

## Иконка

Сгенерирована AI (золотые ножницы на тёмном фоне), ресурсы в `res/mipmap-*` и adaptive icon `mipmap-anydpi-v26/ic_launcher.xml`.

## Структура

```
app/src/main/java/uz/sartarosh/app/
├── ui/auth/LoginFragment.kt
├── ui/salons/…
├── ui/bookings/…
├── ui/profile/ProfileFragment.kt
├── data/api/ApiClient.kt
└── data/local/SessionManager.kt
```
