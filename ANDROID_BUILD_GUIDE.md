# Joseph AI - Android APK Build Guide

Your app is now ready to be built as an Android APK! All the Capacitor setup is complete.

## Project Configuration

- **App Name**: Joseph AI
- **Bundle ID**: com.josephai.app
- **Web Assets**: Synced to `android/app/src/main/assets/public`
- **Permissions**: Internet access (for OpenRouter API calls)

## Option 1: Build APK Using Android Studio (Recommended)

### Prerequisites
1. Install [Android Studio](https://developer.android.com/studio)
2. Install Java Development Kit (JDK) 17 or higher

### Steps
1. Open Android Studio
2. Click **"Open an Existing Project"**
3. Navigate to and select the `android` folder in this project
4. Wait for Gradle sync to complete
5. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
6. Once built, the APK will be located at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Option 2: Build APK Using Command Line

If you have Android SDK and Gradle installed:

```bash
cd android
./gradlew assembleDebug
```

The APK will be created at `android/app/build/outputs/apk/debug/app-debug.apk`

## Option 3: Build Release APK (For Distribution)

### Generate Signing Key
```bash
keytool -genkey -v -keystore joseph-ai-release-key.keystore -alias joseph-ai -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Signing in Android Studio
1. Open `android/app/build.gradle`
2. Add signing configuration
3. Build → Generate Signed Bundle / APK
4. Follow the wizard to create a signed release APK

## Installing the APK

### On Your Android Device
1. Enable **"Unknown Sources"** or **"Install Unknown Apps"** in Settings
2. Transfer the APK to your device
3. Open and install the APK
4. Grant necessary permissions

### Via ADB (Android Debug Bridge)
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Making Updates

After updating your app code:

1. Build the web assets:
   ```bash
   npm run build
   ```

2. Sync to Android:
   ```bash
   npx cap sync android
   ```

3. Rebuild the APK using one of the methods above

## Important Notes

- **Debug APK**: For testing only, larger file size
- **Release APK**: For distribution, optimized and smaller
- **API Keys**: The OpenRouter API key is embedded in the build. For production, consider using environment-specific configurations
- **Storage**: User chats persist using device ID stored in localStorage
- **Offline Mode**: The app works offline thanks to PWA service worker

## Troubleshooting

### Build Failed
- Ensure you have the correct Java version (17+)
- Clear Gradle cache: `cd android && ./gradlew clean`
- Invalidate Android Studio caches: File → Invalidate Caches / Restart

### App Crashes
- Check if internet permission is enabled in AndroidManifest.xml
- Verify the API key is correctly configured
- Check Android Studio Logcat for error messages

## Next Steps

1. Download Android Studio if you haven't already
2. Open the `android` folder in Android Studio
3. Build your APK
4. Test on a real Android device
5. Share the APK with others or publish to Play Store (requires Google Play Console account)

---

**Ready to build!** The Capacitor setup is complete and your app is Android-ready.
