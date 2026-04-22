import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlinkBetContract } from "../target/types/blink_bet_contract";
import fs from "fs";

/**
 * 这是一个独立的初始化脚本，可以直接通过 ts-node 运行
 * 命令: npx ts-node scripts/init-devnet.ts
 */

async function main() {
    // 1. 设置 Provider
    // 强制使用你的专用 RPC 节点
    const RPC_URL = "https://solana-devnet.nodit.io/g_geDW2RLecIkMAlMGV6TL6veVho5cNS";
    const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
    
    // 使用本地 solana 配置的钱包
    const walletPath = `${process.env.HOME}/.config/solana/id.json`;
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")));
    const keypair = anchor.web3.Keypair.fromSecretKey(secretKey);
    const wallet = new anchor.Wallet(keypair);

    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });
    anchor.setProvider(provider);

    const program = anchor.workspace.BlinkBetContract as Program<BlinkBetContract>;
    console.log("Program ID:", program.programId.toBase58());
    console.log("Admin Wallet:", wallet.publicKey.toBase58());

    // PDA 种子
    const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
    );

    // --- 步骤 1: 初始化 Config ---
    console.log("\n--- Step 1: Initialize Config ---");
    try {
        const tx = await program.methods
            .initializeConfig(500) // 5% fee
            .accounts({
                config: configPda,
                admin: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            } as any)
            .rpc();
        console.log("Success! Config TX:", tx);
    } catch (err) {
        if (err.logs && err.logs.some(log => log.includes("already in use"))) {
            console.log("Notice: Config already initialized.");
        } else {
            console.error("Error initializing config:", err);
        }
    }

    // --- 步骤 2: 创建测试比赛 ---
    console.log("\n--- Step 2: Initialize Test Match ---");
    const matchId = `match_${Math.floor(Date.now() / 1000)}`;
    const startTime = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // 1天后

    const [matchPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("match"), Buffer.from(matchId)],
        program.programId
    );

    try {
        const tx = await program.methods
            .initializeMatch(matchId, startTime)
            .accounts({
                matchPool: matchPda,
                config: configPda,
                admin: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            } as any)
            .rpc();
        console.log(`Success! Match [${matchId}] Created.`);
        console.log("Match TX:", tx);
        console.log("Match PDA Address:", matchPda.toBase58());
    } catch (err) {
        console.error("Error initializing match:", err);
    }
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
