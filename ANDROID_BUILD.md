# Building Android APK with GitHub Actions

This project is configured to automatically build Android APK files using GitHub Actions.

## How It Works

The workflow file `.github/workflows/build-android.yml` automatically builds the Android APK when you:
- Push code to the `main` or `master` branch
- Create a pull request
- Manually trigger the workflow from the GitHub Actions tab

## Build Process

The workflow performs these steps:
1. Checks out your code
2. Sets up Node.js and installs dependencies
3. Builds the web application (`npm run build`)
4. Sets up Java JDK 17 and Android SDK
5. Syncs the web build to Capacitor Android project
6. Builds the debug APK using Gradle
7. Uploads the APK as a downloadable artifact

## Downloading the APK

After the workflow completes:

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. Select the most recent workflow run
4. Scroll down to the "Artifacts" section
5. Download `joseph-ai-debug.zip`
6. Extract the ZIP file to get `app-debug.apk`

## Installing the APK

### On Android Device:

1. Transfer the `app-debug.apk` to your Android device
2. Open the file on your device
3. If prompted, enable "Install from unknown sources" in Settings
4. Follow the installation prompts

### Using ADB:

```bash
adb install app-debug.apk
```

## Building Locally (Optional)

If you want to build locally instead:

```bash
# Build the web app
npm run build

# Sync to Android
npx cap sync android

# Build the APK
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Production/Release Build

For a production release build with signing:

1. Generate a keystore file
2. Add secrets to your GitHub repository:
   - `KEYSTORE_FILE` (base64 encoded keystore)
   - `KEYSTORE_PASSWORD`
   - `KEY_ALIAS`
   - `KEY_PASSWORD`
3. Modify the workflow to use `assembleRelease` instead of `assembleDebug`
4. Add keystore configuration in the workflow

## Troubleshooting

**Build fails at Capacitor sync:**
- Make sure `capacitor.config.ts` is properly configured
- Ensure `webDir: 'dist/public'` matches your build output

**Gradle build fails:**
- Check Android SDK versions in the workflow
- Verify that `android` folder exists and is properly initialized

**APK won't install:**
- Enable "Unknown sources" in Android settings
- Check that the APK architecture matches your device

## Current Configuration

- **App ID**: `com.josephai.app`
- **App Name**: Joseph AI
- **Android Scheme**: HTTPS
- **Build Type**: Debug (unsigned)
- **Artifact Retention**: 30 days
