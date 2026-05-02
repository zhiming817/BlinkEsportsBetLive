import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { matchApi } from '../utils/api';

const PredictionCard = ({ item }) => {
  const isSettled = item.status === 'SETTLED';
  const isWon = item.result === 'WON';
  const isActive = item.status === 'ACTIVE';

  return (
    <div className="bg-[#1A1B2E] border border-[#2D2E45] rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[#8E8E93] text-xs font-bold uppercase tracking-wider">{item.status}</span>
        {isSettled && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isWon ? 'bg-[#1C3A2F] text-[#4ADE80]' : 'bg-[#3A1C1C] text-[#F87171]'
          }`}>
            <span>{item.result}</span>
            {isWon ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>

      <h3 className="text-white text-lg font-bold mb-1">{item.match}</h3>
      <p className="text-[#8E8E93] text-sm mb-3">{item.league}</p>
      
      <div className="h-px bg-[#2D2E45] w-full mb-3 opacity-50" />

      {isActive && (
        <div className="mb-3">
           <div className="w-full h-1 bg-[#2D2E45] rounded-full overflow-hidden mb-1">
              <div className="h-full bg-[#00F5FF] w-[30%]" />
           </div>
           <p className="text-[#8E8E93] text-[10px]">Match in Progress - {new Date(item.matchTime).toLocaleString()}</p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#8E8E93]">Prediction:</span>
          <span className="text-white font-medium">{item.prediction}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#8E8E93]">Wager:</span>
          <span className="text-white font-medium">{item.wager}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#8E8E93]">Potential Win:</span>
          <span className={`font-bold ${isWon ? 'text-[#4ADE80]' : item.result === 'LOST' ? 'text-[#F87171]' : 'text-white'}`}>
            {item.potential}
          </span>
        </div>
      </div>
    </div>
  );
};

const MyBets = () => {
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState('Active');
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBets = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const response = await matchApi.getUserBets(publicKey.toString(), activeTab);
      if (response.success) {
        setBets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user bets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBets();
    } else {
      setBets([]);
    }
  }, [activeTab, connected, publicKey]);

  const adaptedData = bets.map(bet => ({
    id: bet.id,
    status: bet.status === 'Pending' ? 'ACTIVE' : 'SETTLED',
    result: bet.status === 'Win' ? 'WON' : (bet.status === 'Lose' ? 'LOST' : ''),
    match: bet.match_name,
    league: bet.league,
    prediction: bet.side_name,
    wager: `${bet.amount} SOL`,
    payout: '--',
    potential: `${(bet.amount * 1.95).toFixed(2)} SOL`, // 暂时硬编码演示，实际应使用 odds
    matchTime: bet.start_at
  }));

  return (
    <div className="min-h-screen bg-[#0B0C1E] pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">My Predictions</h1>
          <div className="w-8 h-8 rounded-full bg-[#1A1B2E] flex items-center justify-center border border-[#2D2E45]">
            <svg className="w-5 h-5 text-[#8E8E93]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="flex p-1 bg-[#1A1B2E] border border-[#2D2E45] rounded-full mb-8">
          <button
            className={`flex-1 py-3 px-6 rounded-full text-sm font-bold transition-all ${
              activeTab === 'Active' 
                ? 'bg-[#2D2E45] text-[#00F5FF]' 
                : 'text-[#8E8E93] hover:text-white'
            }`}
            onClick={() => setActiveTab('Active')}
          >
            Active
          </button>
          <button
            className={`flex-1 py-3 px-6 rounded-full text-sm font-bold transition-all ${
              activeTab === 'History' 
                ? 'bg-[#2D2E45] text-[#00F5FF]' 
                : 'text-[#8E8E93] hover:text-white'
            }`}
            onClick={() => setActiveTab('History')}
          >
            History
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F5FF]"></div>
            </div>
          ) : !connected ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1A1B2E] rounded-2xl border border-dashed border-[#2D2E45]">
              <p className="text-white text-lg mb-6">Please connect your wallet to view predictions</p>
              <WalletMultiButton className="!bg-[#00F5FF] !text-[#0B0C1E] !font-bold !rounded-full !h-12 !px-8 hover:!opacity-90 transition-all" />
            </div>
          ) : adaptedData.length > 0 ? (
            adaptedData.map((item) => (
              <PredictionCard key={item.id} item={item} />
            ))
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1A1B2E] mb-4">
                <svg className="w-10 h-10 text-[#2D2E45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-[#8E8E93] text-lg font-medium">No predictions found in {activeTab}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBets;