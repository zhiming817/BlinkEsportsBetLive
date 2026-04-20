# Solana Mobile App 问题修复总结报告

本报告总结了在开发和配置 Solana 移动端应用（基于 Expo/React Native）过程中遇到的关键问题及其解决方案。

## 1. Android 构建错误 (NDK 版本不匹配)

### 问题描述
构建 Android 应用时失败，错误提示：
`NDK at /Users/zhaozhiming/work/tool/Android/ndk-bundle did not have a source.properties file`
这是由于 Gradle 默认寻找的 NDK 版本与本地安装的版本不一致导致的。

### 解决方案
1. **确定本地 NDK 版本**:
   - 检查路径 `/Users/zhaozhiming/work/tool/Android/sdk/ndk/` 下的文件夹名称。
   - 在本案例中，确定的版本号为 `29.0.14206865`。

2. **显式指定 NDK 版本**:
   - **修改文件**: [android/build.gradle](android/build.gradle)
   - **操作**: 在 `buildscript` 之前的 `ext` 块中添加 `ndkVersion` 定义。
   - **代码示例**:
     ```gradle
     buildscript {
         ext {
             buildToolsVersion = "35.0.0"
             minSdkVersion = 24
             compileSdkVersion = 35
             targetSdkVersion = 34
             ndkVersion = "29.0.14206865" // 强制指定匹配本地环境的版本
         }
         // ...
     }
     ```

3. **配置本地 SDK 路径**:
   - **修改文件**: [android/local.properties](android/local.properties)
   - **操作**: 确保 `sdk.dir` 指向正确的 Android SDK 目录，以便 Gradle 能找到 NDK。
   - **内容示例**:
     ```properties
     sdk.dir=/Users/zhaozhiming/work/tool/Android/sdk
     ```

4. **原理说明**:
   - Expo 在执行 `prebuild` 时会生成默认的 Android 工程配置。如果本地环境的 NDK 路径或版本与默认配置不符，Gradle 会尝试在错误的路径（如 `ndk-bundle`）寻找 `source.properties`。通过在 `build.gradle` 中显式声明版本，可以强制 Gradle 使用正确的 NDK 目录。

---

## 2. 钱包连接失败 (Sign Request Declined)

### 问题描述
点击“连接钱包”时报错：
`SolanaMobileWalletAdapterProtocolError: -3/sign request declined`
这通常是因为使用了部分钱包尚未完全支持的 `signIn` (SIWS - Sign-In-With-Solana) 协议。

### 解决方案
- **修改文件**: [components/auth/auth-provider.tsx](components/auth/auth-provider.tsx)
- **操作**: 将身份验证逻辑从 `signIn` 切换为更基础且兼容性更好的 `connect` 协议。
- **优化**: 在 [components/app-providers.tsx](components/app-providers.tsx) 中完善了 `MobileWalletProvider` 的 `cluster` 和 `identity` 配置，确保钱包能正确识别应用身份。

---

## 3. 转账后的 WebSocket 错误 (ws error: undefined)

### 问题描述
转账成功后，App 弹出红屏报错 `ws error: undefined`。
**原因**: 在移动端，当用户跳转到钱包应用进行授权时，原 App 进入后台，导致与 RPC 节点的 WebSocket 连接断开。`connection.confirmTransaction` 依赖此连接，因此会抛出异常。

### 解决方案
- **修改文件**: [components/account/use-transfer-sol.tsx](components/account/use-transfer-sol.tsx) 和 [components/account/use-request-airdrop.tsx](components/account/use-request-airdrop.tsx)
- **操作**: 弃用 `confirmTransaction`，改用**手动轮询 (Polling)** 机制。通过 `getSignatureStatus` 定时检查交易状态，直到达到 `confirmed` 或 `finalized` 状态。
- **容错**: 在 [polyfill.js](polyfill.js) 中添加了控制台拦截器，过滤掉非致命的 `ws error` 提示，提升用户体验。

---

## 4. 环境补丁与 Polyfills 缺失

### 问题描述
Solana Web3.js 依赖许多 Node.js 原生模块（如 `Buffer`, `process`, `crypto`），这些在 React Native 环境中默认不存在。

### 解决方案
- **修改文件**: [polyfill.js](polyfill.js)
- **操作**: 
    - 引入 `buffer` 并挂载到 `global.Buffer`。
    - 引入 `process` 补丁。
    - 引入 `react-native-get-random-values` 解决加密随机数问题。
    - 引入 `text-encoding-polyfill` 解决 `TextEncoder` 缺失问题（用于消息签名）。
- **入口配置**: 确保在 `index.js` 的最顶部引入了该补丁文件。

---

## 总结
通过以上修复，应用现在具备了：
1. **稳定的构建环境**：适配本地 NDK。
2. **高兼容性的钱包连接**：支持主流 Solana 移动钱包。
3. **鲁棒的交易确认逻辑**：不再受 WebSocket 断连影响。
4. **完整的运行环境**：解决了所有必要的 Web3 兼容性补丁。
