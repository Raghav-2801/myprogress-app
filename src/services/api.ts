import { API_BASE_URL } from '../App';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('progress_tracker_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<{ access_token: string; token_type: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async guestLogin() {
    return this.request<{ access_token: string; token_type: string; user: any }>('/auth/guest', {
      method: 'POST',
    });
  }

  // Topics
  async getTopics(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request<any[]>(`/topics${query}`);
  }

  async createTopic(topicData: any) {
    return this.request<any>('/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  }

  async updateTopic(id: number, topicData: any) {
    return this.request<any>(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topicData),
    });
  }

  async deleteTopic(id: number) {
    return this.request<void>(`/topics/${id}`, {
      method: 'DELETE',
    });
  }

  // Questions
  async getQuestions(params?: { topic_id?: number; difficulty?: string; search?: string; page?: number; page_size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.topic_id) queryParams.append('topic_id', params.topic_id.toString());
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<any>(`/questions${query}`);
  }

  async getQuestion(id: number) {
    return this.request<any>(`/questions/${id}`);
  }

  async createQuestion(questionData: any) {
    return this.request<any>('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(id: number, questionData: any) {
    return this.request<any>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(id: number) {
    return this.request<void>(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleQuestionComplete(id: number) {
    return this.request<any>(`/questions/${id}/toggle-complete`, {
      method: 'PATCH',
    });
  }

  // Progress
  async getProgressStats() {
    return this.request<any>('/progress/stats');
  }

  async getLeetCodeProgress() {
    return this.request<any>('/progress/leetcode');
  }

  // GitHub Sync
  async syncGitHub() {
    return this.request<any>('/github-sync/leetcode', {
      method: 'POST',
    });
  }

  async previewGitHub() {
    return this.request<any>('/github-sync/leetcode/preview');
  }
}

export const api = new ApiService();
