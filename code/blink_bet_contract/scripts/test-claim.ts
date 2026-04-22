import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlinkBetContract } from "../target/types/blink_bet_contract";
import fs from "fs";

/**
 * 步骤 5: 测试领奖 (Claim Prize)
 * 只有在比赛结算且用户押对的情况下才能成功。
 * 命令: npx ts-node scripts/test-claim.ts
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

    const matchId = "match_1776848001"; 

    // PDA 计算
    const [matchPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("match"), Buffer.from(matchId)],
        program.programId
    );

    const [userBetPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from("bet"), 
            Buffer.from(matchId), 
            wallet.publicKey.toBuffer()
        ],
        program.programId
    );

    const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
    );

    // 获取配置以确定手续费接收者
    const configData = await program.account.globalConfig.fetch(configPda);

    console.log(`\n--- Testing Claim Prize ---`);
    console.log(`Match ID: ${matchId}`);
    console.log(`User: ${wallet.publicKey.toBase58()}`);

    try {
        const tx = await program.methods
            .claimPrize(matchId)
            .accounts({
                matchPool: matchPda,
                userBet: userBetPda,
                config: configPda,
                user: wallet.publicKey,
                feeRecipient: configData.admin, // 手续费转给创建者
                systemProgram: anchor.web3.SystemProgram.programId,
            } as any)
            .rpc();

        console.log("Success! Claim TX:", tx);
        console.log("Prize has been transferred to your wallet.");
        
    } catch (err) {
        console.error("Error claiming prize:", err);
    }
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
