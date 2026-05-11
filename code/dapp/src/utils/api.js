/**
 * API 配置与基础请求工具
 */

// 与 mobile 端保持一致的后端地址，或者根据环境判断
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * 基础 Fetch 封装
 */
export async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
}

/**
 * 赛事相关接口封装
 */
export const matchApi = {
  /**
   * 获取推荐赛事列表
   */
  getFeaturedMatches: () => {
    return fetchApi('/api/matches/featured');
  },

  /**
   * 获取赛事详情
   */
  getMatchDetail: (matchId) => {
    return fetchApi(`/api/matches/${matchId}`);
  },

  /**
   * 获取市场页面赛事列表
   */
  getMarketMatches: (params) => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.league_id) searchParams.append('league_id', params.league_id.toString());
      if (params.status) searchParams.append('status', params.status);
      const queryString = searchParams.toString();
      if (queryString) {
        query = `?${queryString}`;
      }
    }
    return fetchApi(`/api/matches/market${query}`);
  },

  /**
   * 获取用户投注记录
   */
  getUserBets: (walletAddress, status) => {
    const statusQuery = status ? `&status=${status}` : '';
    return fetchApi(`/api/user/bets?wallet_address=${walletAddress}${statusQuery}`);
  }
};
