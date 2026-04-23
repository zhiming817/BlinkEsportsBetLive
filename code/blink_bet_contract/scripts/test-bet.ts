import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlinkBetContract } from "../target/types/blink_bet_contract";
import fs from "fs";

/**
 * 步骤 3: 测试下注 (Place Bet)
 * 命令: npx ts-node scripts/test-bet.ts
 */

async function main() {
    // 1. 设置 Provider
    const RPC_URL = "https://solana-devnet.nodit.io/g_geDW2RLecIkMAlMGV6TL6veVho5cNS";
    const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
    
    const walletPath = `${process.env.HOME}/.config/solana/id.json`;
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")));
    const keypair = anchor.web3.Keypair.fromSecretKey(secretKey);
    const wallet = new anchor.Wallet(keypair);

    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);

    const program = anchor.workspace.BlinkBetContract as Program<BlinkBetContract>;

    // 请确认这是你上一步生成的 Match ID
    // 你可以手动修改这个 ID 来测试不同的比赛
    const matchId = "1420915"; 
    
    // 下注参数
    const amount = new anchor.BN(100_000_000); // 0.1 SOL (1亿 Lamports)
    const selection = 1; // 假设 1 代表主队胜, 2 代表客队胜, 0 代表平局

    // PDA 计算
    const [matchPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("match"), Buffer.from(matchId)],
        program.programId
    );

    const [userBetPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("bet"), // 修复：使用 "bet" 而不是 "user_bet"
            Buffer.from(matchId), // 修复：直接使用 matchId 字符串而不是 matchPda.toBuffer()
            wallet.publicKey.toBuffer()
        ],
        program.programId
    );

    console.log(`\n--- Testing Place Bet ---`);
    console.log(`Match ID: ${matchId}`);
    console.log(`Match PDA: ${matchPda.toBase58()}`);
    console.log(`User Bet PDA: ${userBetPda.toBase58()}`);
    console.log(`Amount: 0.1 SOL`);
    console.log(`Selection: ${selection === 1 ? "Home Win" : "Away Win"}`);

    try {
        const tx = await program.methods
            .placeBet(matchId, amount, selection) // 修复：添加第一个参数 matchId
            .accounts({
                matchPool: matchPda,
                userBet: userBetPda,
                user: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            } as any)
            .rpc();

        console.log("Success! Bet TX:", tx);
        
        // 验证状态
        const matchData = await program.account.matchPool.fetch(matchPda);
        console.log("\n--- Current Match Pool Status ---");
        // 修复：使用正确的字段名 totalPoolA, totalPoolB
        const total = matchData.totalPoolA.add(matchData.totalPoolB).toNumber() / anchor.web3.LAMPORTS_PER_SOL;
        console.log(`Total Collected: ${total} SOL`);
        console.log(`Home Pool (A): ${matchData.totalPoolA.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        console.log(`Away Pool (B): ${matchData.totalPoolB.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        
    } catch (err) {
        console.error("Error placing bet:", err);
    }
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
