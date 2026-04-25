export const API_BASE_URL = 'http://192.168.3.196:3000';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();
  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
}

/**
 * 接口数据结构定义
 */
export interface Team {
  id: number;
  name: string;
  image_url: string;
  acronym: string;
  slug?: string;
  location?: string;
}

export interface MatchPool {
  id: number;
  match_id: number;
  pda_address: string;
  total_pool_a: string; // 后端返回的是字符串
  total_pool_b: string; // 后端返回的是字符串
  is_settled: number;
}

export interface MatchDetail {
  id: number;
  team_a: Team;
  team_b: Team;
  start_at: string;
  status: string;
  number_of_games: number;
  winner_id: number | null;
  solana_match_id: string | null;
  solana_match_pda: string | null;
  solana_tx_signature: string | null;
  is_featured: boolean;
  embed_url: string | null;
  match_pools: MatchPool | null;
  updated_at: string;
}

export interface MarketMatchItem {
  id: number;
  match_name: string;
  league: string;
  image: string;
  away_image: string;
  time: string;
  status: string;
  category: string;
  odds: {
    home: string;
    away: string;
  };
}

export interface UserBetItem {
  id: number;
  match_id: number;
  match_name: string;
  league: string;
  start_at: string;
  amount: string;
  side: number;
  side_name: string;
  status: string;
  claim_status: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * API 请求封装
 */
export const matchApi = {
  /**
   * 获取推荐赛事列表
   */
  getFeaturedMatches: () => {
    return fetchApi<ApiResponse<MatchDetail[]>>('/api/matches/featured');
  },

  /**
   * 获取赛事详情
   */
  getMatchDetail: (matchId: string | number) => {
    return fetchApi<ApiResponse<MatchDetail>>(`/api/matches/${matchId}`);
  },

  /**
   * 获取市场页面赛事列表
   */
  getMarketMatches: () => {
    return fetchApi<ApiResponse<MarketMatchItem[]>>('/api/matches/market');
  },

  /**
   * 获取用户投注记录
   */
  getUserBets: (walletAddress: string, status?: 'Active' | 'History') => {
    const statusQuery = status ? `&status=${status}` : '';
    return fetchApi<ApiResponse<UserBetItem[]>>(`/api/user/bets?wallet_address=${walletAddress}${statusQuery}`);
  }
};

