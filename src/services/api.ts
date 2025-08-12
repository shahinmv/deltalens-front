import axios from 'axios';

// const API_BASE_URL = 'https://deltalens-back-production.up.railway.app';
const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          
          error.config.headers.Authorization = `Bearer ${access}`;
          return api.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'non_member' | 'member' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register/', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login/', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/api/auth/profile/', data);
    return response.data;
  },
};

export const adminAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/admin/users/');
    return response.data;
  },

  updateUserRole: async (userId: number, role: string): Promise<User> => {
    const response = await api.patch(`/api/admin/users/${userId}/role/`, { role });
    return response.data.user;
  },
};

// Dashboard API functions
export const dashboardAPI = {
  getMarketStats: async () => {
    const response = await api.get('/api/market-stats/');
    return response.data;
  },

  getNewsSentiment: async () => {
    const response = await api.get('/api/news-sentiment/');
    return response.data;
  },

  getNews: async (page: number, pageSize: number) => {
    const response = await api.get(`/api/news/?page=${page}&page_size=${pageSize}`);
    return response.data;
  },

  getTradingSignals: async () => {
    const response = await api.get('/api/iterative-trading-signals/');
    return response.data;
  },

  getSignalPerformance: async () => {
    const response = await api.get('/api/signal-performance/');
    return response.data;
  },

  streamLLMResponse: async (
    userMessage: string, 
    onToken: (token: string) => void, 
    sessionId?: string,
    onSessionId?: (sessionId: string) => void
  ) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/api/llm-stream/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify({ 
        message: userMessage,
        session_id: sessionId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = "";
    
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep the last incomplete line in buffer
        
        // Process each complete line
        for (const line of lines) {
          if (line.startsWith('SESSION_ID:')) {
            const sessionId = line.replace('SESSION_ID:', '');
            console.log('API: Parsed session ID:', sessionId);
            if (onSessionId) {
              onSessionId(sessionId);
            }
          } else if (line.trim()) {
            onToken(line + '\n');
          }
        }
      }
    }
    
    // Send any remaining buffer content
    if (buffer.trim()) {
      if (buffer.startsWith('SESSION_ID:')) {
        const sessionId = buffer.replace('SESSION_ID:', '');
        if (onSessionId) {
          onSessionId(sessionId);
        }
      } else {
        onToken(buffer);
      }
    }
  },
};

// Conversation API functions
export interface ConversationSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationMessage {
  id: string;
  content: string;
  is_user: boolean;
  reasoning?: string;
  tool_calls?: any;
  tool_responses?: any;
  created_at: string;
}

export interface ConversationDetail {
  session: {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  };
  messages: ConversationMessage[];
}

export const conversationAPI = {
  getSessions: async (): Promise<{ sessions: ConversationSession[] }> => {
    const response = await api.get('/api/conversations/');
    return response.data;
  },

  createSession: async (): Promise<ConversationSession> => {
    const response = await api.post('/api/conversations/');
    return response.data;
  },

  getSessionDetail: async (sessionId: string): Promise<ConversationDetail> => {
    const response = await api.get(`/api/conversations/${sessionId}/`);
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/api/conversations/${sessionId}/`);
  },
};