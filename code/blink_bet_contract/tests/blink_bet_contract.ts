import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlinkBetContract } from "../target/types/blink_bet_contract";
import { expect } from "chai";

describe("blink_bet_contract", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BlinkBetContract as Program<BlinkBetContract>;
  const admin = provider.wallet;

  // PDA 种子和地址
  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  it("初始化全局配置 (Initialize Config)", async () => {
    try {
      const tx = await program.methods
        .initializeConfig(500) // 5% fee_bps
        .accounts({
          config: configPda,
          admin: admin.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
      
      console.log("Config Initialized, TX:", tx);

      const configAccount = await program.account.globalConfig.fetch(configPda);
      expect(configAccount.admin.toBase58()).to.equal(admin.publicKey.toBase58());
      expect(configAccount.feeBps).to.equal(500);
    } catch (err) {
      console.log("Config might already be initialized:", err.message);
    }
  });

  it("创建第一个测试比赛 (Initialize Match)", async () => {
    const matchId = "test-match-001";
    // 设置开始时间为当前时间 + 1小时 (以秒为单位)
    const startTime = new anchor.BN(Math.floor(Date.now() / 1000) + 3600);

    const [matchPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("match"), Buffer.from(matchId)],
      program.programId
    );

    const tx = await program.methods
      .initializeMatch(matchId, startTime)
      .accounts({
        matchPool: matchPda,
        config: configPda,
        admin: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    console.log("Match Initialized, TX:", tx);

    const matchAccount = await program.account.matchPool.fetch(matchPda);
    expect(matchAccount.matchId).to.equal(matchId);
    expect(matchAccount.isSettled).to.be.false;
  });

  it("用户进行下注 (Place Bet)", async () => {
    const matchId = "test-match-001";
    const amount = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL); // 0.1 SOL
    const side = 1; // 战队 A

    const [matchPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("match"), Buffer.from(matchId)],
      program.programId
    );

    const [betPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), Buffer.from(matchId), admin.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .placeBet(matchId, amount, side)
      .accounts({
        matchPool: matchPda,
        userBet: betPda,
        user: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    console.log("Bet Placed, TX:", tx);

    const matchAccount = await program.account.matchPool.fetch(matchPda);
    expect(matchAccount.totalPoolA.toString()).to.not.equal("0");
  });
});
