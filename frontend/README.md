# EV Locate

This is an Expo React Native project.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Git](https://git-scm.com/)

### Installation

1.  Clone the repository (if you haven't already).
2.  Install dependencies:

    ```bash
    npm install
    ```

### Running Locally

To start the development server:

```bash
npm run dev
```

This will start the Expo development server. You can then:

- Scan the QR code with the **Expo Go** app on your Android device.
- Press `a` to run on an Android Emulator (if set up).
- Press `w` to run in the web browser.

---

## Building for Android

There are two main ways to build your Android app: **EAS Build** (cloud-based, recommended) and **Local Build** (requires Android Studio).

### Option 1: EAS Build (Recommended)

EAS (Expo Application Services) Build is the simplest way to build your app. It handles the build process in the cloud.

1.  **Install EAS CLI:**

    ```bash
    npm install -g eas-cli
    ```

2.  **Login to Expo:**

    ```bash
    eas login
    ```

    (Create an account at [expo.dev](https://expo.dev) if you don't have one).

3.  **Configure the project:**

    ```bash
    eas build:configure
    ```

    Follow the prompts to configure the project for Android.

4.  **Build the APK (for testing):**

    ```bash
    eas build -p android --profile preview
    ```

    This will generate an APK that you can install directly on your device.

5.  **Build for Play Store (AAB):**

    ```bash
    eas build -p android --profile production
    ```

    This generates an `.aab` file ready for the Google Play Store.

### Option 2: Local Build

If you prefer to build locally on your machine, you need **Android Studio** installed and configured.

1.  **Generate Native Code:**

    ```bash
    npx expo prebuild
    ```

    This will create an `android` directory in your project.

2.  **Open in Android Studio:**

    - Open Android Studio.
    - Select "Open an existing project".
    - Navigate to the `android` folder inside your project directory.

3.  **Build:**
    - Let Gradle sync.
    - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    - The APK will be generated in `android/app/build/outputs/apk/debug/`.
