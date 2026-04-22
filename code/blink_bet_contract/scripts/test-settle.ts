import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlinkBetContract } from "../target/types/blink_bet_contract";
import fs from "fs";

/**
 * 步骤 4: 测试结算 (Settle Match)
 * 注意：通常由后台管理员调用。结算后，资金池会被锁定。
 * 命令: npx ts-node scripts/test-settle.ts
 */

async function main() {
    const RPC_URL = "https://solana-devnet.nodit.io/g_geDW2RLecIkMAlMGV6TL6veVho5cNS";
    const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
    
    const walletPath = `${process.env.HOME}/.config/solana/id.json`;
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")));
    const keypair = anchor.web3.Keypair.fromSecretKey(secretKey);
    const wallet = new anchor.Wallet(keypair);

    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    anchor.setProvider(provider);

    const program = anchor.workspace.BlinkBetContract as Program<BlinkBetContract>;

    const matchId = "match_1776867348"; 
    const result = 1; // 宣告 1 (主队) 获胜

    const [matchPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("match"), Buffer.from(matchId)],
        program.programId
    );

    const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
    );

    console.log(`\n--- Testing Settle Match ---`);
    console.log(`Match ID: ${matchId}`);
    console.log(`Result: ${result === 1 ? "Home Win" : "Away Win"}`);

    try {
        const tx = await program.methods
            .settleMatch(matchId, result)
            .accounts({
                matchPool: matchPda,
                config: configPda, // 修复：传入缺失的 config 账户
                admin: wallet.publicKey,
            } as any)
            .rpc();

        console.log("Success! Settle TX:", tx);
        
        const matchData = await program.account.matchPool.fetch(matchPda);
        console.log("Match Settle Status:", matchData.isSettled ? "Settled" : "Open"); 
        console.log("Winner:", matchData.winner === 1 ? "Home" : "Away");

    } catch (err) {
        console.error("Error settling match:", err);
    }
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
