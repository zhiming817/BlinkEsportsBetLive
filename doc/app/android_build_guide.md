# Android 打包指南 (APK)

该项目使用 Expo 开发，支持通过 EAS Build (云端) 或本地环境进行打包。

## 环境准备

1. **安装 EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
2. **登录 Expo 账号**:
   ```bash
   eas login
   # 如果忘记密码，可使用浏览器授权：eas login --browser
   ```

## 方案一：使用 EAS 云端打包 (推荐)

这是最简单的方法，不需要本地安装 Android SDK。

1. **进入项目目录**:
   ```bash
   cd code/mobile/BlinkBetLive-app
   ```
2. **预览版下载 (APK)**:
   如果您想直接生成安装包分发给测试人员，请使用 `preview` 配置：
   ```bash
   eas build -p android --profile preview
   ```
   *注意：请确保 `eas.json` 中 `preview` 配置的 `buildType` 为 `"apk"`。*

3. **生产发布版 (AAB)**:
   如果您要发布到 Google Play：
   ```bash
   eas build -p android --profile production
   ```

## 方案二：本地打包 (Local Build)

需要本地配置有 Java JDK 17+ 和 Android SDK。

1. **生成/同步原生代码**:
   ```bash
   cd code/mobile/BlinkBetLive-app
   npm run android:build
   ```
2. **执行编译**:
   ```bash
   cd android
   # 打包测试版 APK
   ./gradlew assembleDebug
   # 打包正式版 APK
   ./gradlew assembleRelease
   ```
   打包后的文件路径：`android/app/build/outputs/apk/release/app-release.apk`

## 常见问题

- **忘记密码**: 访问 [https://expo.dev/forgot-password](https://expo.dev/forgot-password) 重置。
- **查看当前登录用户**: `eas whoami`
- **查看打包任务状态**: `eas build:list`
