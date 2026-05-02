# BlinkEsportsBetLive

BlinkEsportsBetLive is a decentralized sports betting platform built on the Solana blockchain. It leverages Solana Blinks (Actions) and Pari-mutuel betting pools to provide a seamless, transparent, and high-performance betting experience directly within social media or through a dedicated DApp.

## 🚀 Features

- **Decentralized Betting Pools**: Every match has its own on-chain pool. Odds are calculated dynamically based on the volume of bets (Pari-mutuel model).
- **On-chain Contract (Devnet)**: `AcAyrnzU2cTMTGR6TV9ry8VHCbiPU68R3mG964agr8uv`
- **Solana Blinks Support**: Bet directly from your Twitter/X feed or any shareable link using Solana Actions.
- **Admin Management**: On-chain match initialization and management tools integrated into the frontend.
- **Real-time Odds**: Backend calculation service that provides live odds based on pool size minus platform fees.
- **DApp Interface**: A modern React-based web interface for exploring matches and placing bets.

## 🏗 Project Structure

```text
├── code/
│   ├── backend/             # Rust (Axum) server providing APIs & Action handlers
│   ├── dapp/                # React (Vite) frontend for the web application
│   ├── blink_bet_contract/  # Solana Anchor smart contract
│   └── mobile/              # Mobile application (Expo/React Native)
├── doc/                     # Architecture, database design, and logic documentation
├── scripts/                 # Database initialization and maintenance scripts
└── ui/                      # Design assets and icons
```

## 🛠 Tech Stack

- **Blockchain**: Solana, Anchor Framework (Rust)
- **Backend**: Rust (Axum, SeaORM)
- **Frontend**: React, Tailwind CSS, Solana Wallet Adapter, Anchor Portal
- **Database**: PostgreSQL (managed via SeaORM)
- **Infrastructure**: Solana Blinks (Actions)

## 🏁 Getting Started

### Prerequisites

- [Rust & Cargo](https://rustup.rs/)
- [Node.js & pnpm](https://nodejs.org/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation)

### Backend Setup

1. Navigate to `code/backend/rust_backend`
2. Configure `config.yaml` with your database and RPC settings.
3. Run `cargo run`.

### Frontend Setup

1. Navigate to `code/dapp`
2. Run `pnpm install`.
3. Start development server: `pnpm dev`.

### Smart Contract

1. Navigate to `code/blink_bet_contract`
2. Build: `anchor build`
3. Deploy: `anchor deploy --provider.cluster devnet`

## ⚖️ Odds Calculation Logic

The project uses a **Pari-mutuel** model:
- **Formula**: `Real-time Odds = (Total Pool / Side Pool) * 0.95` (where 0.95 accounts for a 5% platform fee).
- **Default Odds**: `2.00` (used when the pool is empty or unbalanced to guide initial bets).

## 📄 Documentation

Check the `/doc` directory for detailed specifications:
- [Backend Odds Logic](doc/backend/odds_logic.md)
- [Database Design](doc/数据库设计.md) (CN)
- [Technical Architecture](doc/技术架构.md) (CN)

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
