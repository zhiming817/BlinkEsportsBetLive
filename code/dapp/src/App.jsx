import React, { useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clusterApiUrl } from '@solana/web3.js';
import Home from './components/Home.jsx';
import Matches from './components/Matches.jsx';
import MatchDetail from './components/MatchDetail.jsx';
import MyBets from './components/MyBets.jsx';
import PageLayout from './layout/PageLayout.jsx';
import { NETWORK_CONFIG } from './config.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient();

function App() {
  // 使用配置文件中的网络设置
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => NETWORK_CONFIG.RPC_URL || clusterApiUrl(network), [network]);

  // 配置支持的钱包
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <HashRouter>
              <PageLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/match/:id" element={<MatchDetail />} />
                  <Route path="/my-bets" element={<MyBets />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PageLayout>
            </HashRouter>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}

export default App;