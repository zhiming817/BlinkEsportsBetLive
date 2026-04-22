import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlinkBetContract } from "../target/types/blink_bet_contract";
import fs from "fs";

/**
 * 这是一个独立的创建比赛脚本
 * 命令: npx ts-node scripts/init-match.ts [matchId] [startTimeOffsetInSeconds]
 * 示例: npx ts-node scripts/init-match.ts match_test_001 86400
 */

async function main() {
    // 1. 设置 Provider
    const RPC_URL = "https://solana-devnet.nodit.io/g_geDW2RLecIkMAlMGV6TL6veVho5cNS";
    const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
    
    const walletPath = `${process.env.HOME}/.config/solana/id.json`;
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")));
    const keypair = anchor.web3.Keypair.fromSecretKey(secretKey);
    const wallet = new anchor.Wallet(keypair);

    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });
    anchor.setProvider(provider);

    const program = anchor.workspace.BlinkBetContract as Program<BlinkBetContract>;
    
    // 从命令行参数获取 matchId 和 startTime
    const args = process.argv.slice(2);
    let matchId = args[0] || `match_${Math.floor(Date.now() / 1000)}`;
    matchId = "1420913";
    const offset = parseInt(args[1] || "86400"); // 默认 1 天后
    const startTime = new anchor.BN(Math.floor(Date.now() / 1000) + offset);

    console.log("Program ID:", program.programId.toBase58());
    console.log("Match ID:", matchId);
    console.log("Start Time (Unix):", startTime.toString());

    // PDA 种子
    const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
    );

    const [matchPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("match"), Buffer.from(matchId)],
        program.programId
    );

    console.log("\n--- Creating Match ---");
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
        
        console.log(`✅ Success! Match [${matchId}] Created.`);
        console.log("Transaction Signature:", tx);
        console.log("Match PDA Address:", matchPda.toBase58());
    } catch (err) {
        console.error("❌ Error initializing match:", err);
    }
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
);
