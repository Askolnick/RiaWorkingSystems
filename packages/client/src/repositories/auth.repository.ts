import { BaseRepository } from './base.repository';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class AuthRepository extends BaseRepository<AuthUser> {
  protected endpoint = '/auth';

  /**
   * Register a new user account
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.request<RegisterResponse>('POST', '/register', data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sign in with email and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.request<LoginResponse>('POST', '/login', data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await this.request<AuthUser>('GET', '/me');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const response = await this.request<AuthUser>('PUT', '/profile', data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await this.request('PUT', '/change-password', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.request('POST', '/reset-password', { email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: { token: string; password: string }): Promise<void> {
    try {
      await this.request('POST', '/reset-password/confirm', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sign out user
   */
  async logout(): Promise<void> {
    try {
      await this.request('POST', '/logout');
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Create singleton instance
export const authRepository = new AuthRepository();