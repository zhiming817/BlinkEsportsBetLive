import React, { useState, useEffect } from 'react';
import { matchApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Matches = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Lol'];
  const leagues = [
    { id: 'All', name: 'All Leagues' },
    { id: 297, name: 'LPL' },
    { id: 293, name: 'LCK' },
    { id: 4198, name: 'LEC' },
    { id: 4197, name: 'LCS' }
  ];
  const statuses = [
    { id: 'All', name: 'All Status' },
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'running', name: 'Running' },
    { id: 'finished', name: 'Finished' }
  ];

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLeague !== 'All') params.league_id = selectedLeague;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      
      const response = await matchApi.getMarketMatches(params);
      if (response.success) {
        setMarkets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch markets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [selectedLeague, selectedStatus]);

  const filteredMarkets = selectedCategory === 'All' 
    ? markets 
    : markets.filter(m => m.category === selectedCategory);

  const groupMarketsByDate = (marketsList) => {
    const groups = {};
    if (!marketsList || !Array.isArray(marketsList)) return groups;

    marketsList.forEach(market => {
      try {
        if (!market.time) {
          const fallback = 'Other';
          if (!groups[fallback]) groups[fallback] = [];
          groups[fallback].push(market);
          return;
        }

        // 处理 "2026-04-27 05:00:00 UTC" -> "2026-04-27T05:00:00Z"
        const cleanTime = market.time.replace(' UTC', 'Z').replace(' ', 'T');
        const date = new Date(cleanTime);
        
        if (isNaN(date.getTime())) {
          const dateKey = 'Other';
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(market);
          return;
        }

        const dateKey = date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit'
        });
        
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const displayKey = isToday ? `${dateKey} Today` : dateKey;

        if (!groups[displayKey]) groups[displayKey] = [];
        groups[displayKey].push(market);
      } catch (err) {
        console.error('Group error:', err);
        const fallback = 'Other';
        if (!groups[fallback]) groups[fallback] = [];
        groups[fallback].push(market);
      }
    });
    return groups;
  };

  const formatLocalTimeOnly = (timeString) => {
    try {
      if (!timeString) return '--:--';
      
      // 处理 "2026-04-27 05:00:00 UTC" 这种格式
      let cleanTime = timeString;
      if (typeof timeString === 'string') {
        cleanTime = timeString.replace(' UTC', 'Z').replace(' ', 'T');
      }

      const date = new Date(cleanTime);
      
      if (isNaN(date.getTime())) {
        // 如果解析失败，尝试提取时间部分 (HH:mm)
        const match = timeString.match(/(\d{2}:\d{2})/);
        return match ? match[1] : timeString;
      }

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (e) {
      return '--:--';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status.toLowerCase()) {
      case 'not_started':
      case 'upcoming':
        return { label: 'Upcoming', class: 'text-gray-400' };
      case 'running':
        return { label: 'Live', class: 'text-cyan-400' };
      case 'finished':
        return { label: 'Finished', class: 'text-green-400' };
      default:
        return { label: status.toUpperCase(), class: 'text-gray-400' };
    }
  };

  const groupedMarkets = groupMarketsByDate(filteredMarkets);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-white">Market</h1>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${
                selectedCategory === cat 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                  : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedLeague === league.id 
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' 
                  : 'bg-gray-900/30 border-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedStatus === s.id 
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' 
                  : 'bg-gray-900/30 border-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Market List */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading markets...</p>
          </div>
        ) : Object.keys(groupedMarkets).length > 0 ? (
          Object.keys(groupedMarkets).map((dateGroup) => (
            <div key={dateGroup}>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-gray-800"></div>
                <span className="text-gray-400 text-sm font-bold tracking-wider">{dateGroup}</span>
                <div className="h-px flex-1 bg-gray-800"></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {groupedMarkets[dateGroup].map((market) => (
                  <div 
                    key={market.id} 
                    onClick={() => navigate(`/match/${market.id}`)}
                    className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/30 cursor-pointer transition-all group"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      {/* Time & Status */}
                      <div className="w-full md:w-32 flex md:flex-col items-center md:items-start justify-between md:justify-center border-b md:border-b-0 md:border-r border-gray-800 pb-2 md:pb-0 md:pr-4">
                        <span className="text-white font-bold text-lg">{formatLocalTimeOnly(market.time)}</span>
                        <div className="flex flex-col items-end md:items-start">
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${getStatusDisplay(market.status).class}`}>
                            {getStatusDisplay(market.status).label}
                          </span>
                          <span className="text-gray-600 text-[10px] mt-0.5 truncate w-full max-w-[100px]">{market.league}</span>
                        </div>
                      </div>

                      {/* Teams */}
                      <div className="flex-1 flex flex-col gap-3 w-full">
                        <div className="flex items-center gap-3">
                          <img src={market.image} className="w-6 h-6 object-contain" alt="" />
                          <span className="text-white font-medium">{market.match_name.split(' vs ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <img src={market.away_image} className="w-6 h-6 object-contain" alt="" />
                          <span className="text-white font-medium">{market.match_name.split(' vs ')[1]}</span>
                        </div>
                      </div>

                      {/* Odds & Action */}
                      <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-800">
                        <div className="flex flex-row md:flex-col gap-4 md:gap-2 flex-1 md:flex-none">
                          <div className="bg-gray-800/50 px-4 py-1.5 rounded-lg border border-gray-700 min-w-[60px] text-center">
                            <span className="text-cyan-400 font-bold text-sm">{market.odds.home}</span>
                          </div>
                          <div className="bg-gray-800/50 px-4 py-1.5 rounded-lg border border-gray-700 min-w-[60px] text-center">
                            <span className="text-cyan-400 font-bold text-sm">{market.odds.away}</span>
                          </div>
                        </div>
                        <div className="bg-gray-800 group-hover:bg-cyan-500/20 p-2 rounded-full transition-colors">
                          <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-900/20 rounded-2xl border border-dashed border-gray-800">
            <p className="text-gray-500">No matches found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
