# BlinkBet Solana 合约测试报告与调用指南

本文档记录了 `BlinkBet` 智能合约在 Solana Devnet 上的测试过程、调用方式以及业务流程。

## 1. 合约基本信息

*   **Program ID**: `AcAyrnzU2cTMTGR6TV9ry8VHCbiPU68R3mG964agr8uv`
*   **网络**: Solana Devnet
*   **RPC 节点**: `https://solana-devnet.nodit.io/g_geDW2RLecIkMAlMGV6TL6veVho5cNS`
*   **开发框架**: Anchor v0.30.1

---

## 2. 环境准备

测试脚本位于 `code/blink_bet_contract/scripts/`。

### 运行环境
*   Node.js: v20+ (推荐)
*   工具: `ts-node`
*   钱包: `~/.config/solana/id.json` (需存有足够 Devnet SOL)

### 安装依赖
```bash
cd code/blink_bet_contract
npm install
```

---

## 3. 业务流程与测试步骤

我们通过 5 个核心步骤验证了完整的去中心化下注生命周期。

### 步骤 1: 初始化全局配置 (Initialize Config)
*   **脚本**: `scripts/init-devnet.ts`
*   **说明**: 设置合约管理员及手续费。
*   **参数**: `fee_bps = 500` (代表 5% 手续费)。
*   **状态**: **已完成**。

### 步骤 2: 创建比赛 (Initialize Match)
*   **脚本**: 同 `scripts/init-devnet.ts` (第二部分)
*   **说明**: 在链上开启一场新的预测比赛。
*   **测试数据**: `match_1776848001`。
*   **PDA**: `3LJLa5rCJoLCBVCfiBMtPYTgcaYdDG2t8Vw73Ldovk3F`。
*   **状态**: **已完成**。

### 步骤 3: 用户下注 (Place Bet)
*   **脚本**: `scripts/test-bet.ts`
*   **逻辑**: 
    1. 计算用户下注 PDA (种子: `[b"bet", match_id, user_pubkey]`)。
    2. 转账 SOL 进入 `MatchPool` 账户。
*   **测试记录**: 用户 `Cjisa...` 下注 0.1 SOL 至主队 (Side 1)。
*   **状态**: **已完成** (TX: `wg485v1...`)。

### 步骤 4: 比赛结算 (Settle Match)
*   **脚本**: `scripts/test-settle.ts`
*   **说明**: 管理员（Oracle）根据真实比赛结果设定胜方，锁定池子。
*   **测试记录**: 设定主队 (Home) 获胜。
*   **状态**: **已完成** (TX: `f1BbvAH...`)。

### 步骤 5: 领取奖金 (Claim Prize)
*   **脚本**: `scripts/test-claim.ts`
*   **逻辑**: 
    1. 计算赔率：根据 `total_pool_a` 和 `total_pool_b` 的比例分配奖金。
    2. 扣除 5% 手续费至管理员钱包。
    3. 退还 `UserBet` 账户租金并销毁账户。
*   **状态**: **已完成** (TX: `2VEwGTU...`)。

---

## 4. 后续开发调用参考

### 关键 PDA 种子定义 (Seeds)
开发前端或后端时，必须使用以下种子计算账号：

| 账户类型 | Seeds (种子) | 说明 |
| :--- | :--- | :--- |
| **Config** | `[b"config"]` | 全局配置账号 |
| **Match** | `[b"match", match_id.as_bytes()]` | 存储比赛资金和状态 |
| **UserBet** | `[b"bet", match_id.as_bytes(), user.key().as_ref()]` | 记录用户下注详情 |

### 下注选项
*   `1`: 主队胜利 (Home Win)
*   `2`: 客队胜利 (Away Win)

---

## 5. 常见问题记录
1.  **ConstraintSeeds 错误**: 确保计算 `user_bet` PDA 时，第一个种子是 `"bet"` 而非 `"user_bet"`。
2.  **Account config not provided**: 调用 `settle` 和 `claim` 指令时，必须传入 `config` 账户以验证管理员地址和手续费设置。

---
*文档生成于: 2026-04-22*
