import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { matchApi } from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const json = await matchApi.getFeaturedMatches();
      if (json.success) {
        setMatches(json.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const featuredMatch = matches.length > 0 ? matches[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Featured Match & Live Stream */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-gray-900/50 rounded-2xl border border-gray-800">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : featuredMatch ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl">
              {/* Live Status Header */}
              <div className="bg-black/40 px-6 py-3 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-white font-bold text-sm tracking-widest uppercase">LIVE</span>
                </div>
                <div className="text-gray-400 text-sm font-medium">
                  {featuredMatch.team_a.acronym} VS {featuredMatch.team_b.acronym}
                </div>
              </div>

              {/* Viewport for Stream */}
              <div className="aspect-video bg-black relative">
                {featuredMatch.embed_url ? (
                  <iframe 
                    src={featuredMatch.embed_url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                    <p>Live stream unavailable</p>
                  </div>
                )}
              </div>

              {/* Match Details */}
              <div 
                className="p-6 flex items-center justify-between bg-black/20 cursor-pointer hover:bg-black/30 transition-colors"
                onClick={() => navigate(`/match/${featuredMatch.id}`)}
              >
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <img src={featuredMatch.team_a.image_url} alt={featuredMatch.team_a.name} className="w-16 h-16 rounded-full border-2 border-orange-500/20 p-1 mb-2" />
                    <p className="text-white font-bold">{featuredMatch.team_a.acronym}</p>
                  </div>
                  <div className="text-2xl font-black text-gray-500 italic px-4">VS</div>
                  <div className="text-center">
                    <img src={featuredMatch.team_b.image_url} alt={featuredMatch.team_b.name} className="w-16 h-16 rounded-full border-2 border-orange-500/20 p-1 mb-2" />
                    <p className="text-white font-bold">{featuredMatch.team_b.acronym}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm italic">Match Status</p>
                  <p className="text-orange-500 font-black uppercase text-xl">{featuredMatch.status}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
              <p className="text-gray-500">No scheduled matches found.</p>
            </div>
          )}

          {/* Other Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.slice(1).map(match => (
              <div 
                key={match.id} 
                onClick={() => navigate(`/match/${match.id}`)}
                className="bg-gray-800/30 border border-gray-700/50 p-4 rounded-xl hover:border-orange-500/30 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(match.start_at).toLocaleDateString()}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 font-bold uppercase">{match.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <p className="text-white font-bold text-sm">{match.team_a.acronym}</p>
                  </div>
                  <div className="px-4 text-xs font-bold text-gray-600">VS</div>
                  <div className="flex-1 text-center">
                    <p className="text-white font-bold text-sm">{match.team_b.acronym}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: User Stats & Betting Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-black text-white mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-3"></span>
              YOUR DASHBOARD
            </h2>
            
            {!publicKey ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">Connect wallet to view your betting history</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Winnings</p>
                  <p className="text-2xl font-black text-orange-500">0.00 SOL</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/20 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Open Bets</p>
                    <p className="text-xl font-bold text-white">0</p>
                  </div>
                  <div className="bg-gray-800/20 p-4 rounded-xl border border-gray-700">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Win Rate</p>
                    <p className="text-xl font-bold text-white">0%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6">
            <h3 className="text-orange-500 font-black text-sm uppercase mb-4">Trending Now</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-xs font-bold text-white">#1</div>
                <p className="text-gray-300 text-sm font-medium">Champions League Finale</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-xs font-bold text-white">#2</div>
                <p className="text-gray-300 text-sm font-medium">Solana Summer Cup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
