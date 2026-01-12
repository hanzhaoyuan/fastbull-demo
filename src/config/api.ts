/**
 * API 配置
 * 根据环境自动选择 API 地址
 */

// 从环境变量获取 API 基础地址
// 开发环境: http://43.138.248.158:8080/api
// 生产环境: /api (相对路径，前后端同域名)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

console.log('当前环境:', import.meta.env.MODE);
console.log('API 基础地址:', API_BASE_URL);

/**
 * API 配置对象
 */
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 秒超时

  // API 端点
  endpoints: {
    // 代码文件相关
    codeFiles: {
      list: '/code-files',
      create: '/code-files',
      update: (id: string) => `/code-files/${id}`,
      delete: (id: string) => `/code-files/${id}`,
      get: (id: string) => `/code-files/${id}`,
      rename: (id: string) => `/code-files/${id}/rename`,
      copy: (id: string) => `/code-files/${id}/copy`,
    },

    // 策略相关
    strategies: {
      list: '/strategies',
      create: '/strategies',
      update: (id: string) => `/strategies/${id}`,
      delete: (id: string) => `/strategies/${id}`,
      backtest: (id: string) => `/strategies/${id}/backtest`,
      optimize: (id: string) => `/strategies/${id}/optimize`,
    },

    // 指标相关
    indicators: {
      list: '/indicators',
      create: '/indicators',
      update: (id: string) => `/indicators/${id}`,
      delete: (id: string) => `/indicators/${id}`,
    },

    // 用户相关
    user: {
      login: '/auth/login',
      logout: '/auth/logout',
      profile: '/user/profile',
    },
  },
};

/**
 * 构建完整的 API URL
 */
export function buildApiUrl(endpoint: string): string {
  // 如果端点已经是完整 URL，直接返回
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // 移除端点开头的斜杠（如果有）
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // 移除 baseURL 结尾的斜杠（如果有）
  const cleanBaseURL = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${cleanBaseURL}/${cleanEndpoint}`;
}

/**
 * 通用的 fetch 包装器
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 请求失败:', error);
    throw error;
  }
}

export default apiConfig;
