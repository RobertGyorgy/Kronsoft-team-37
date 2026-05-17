import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Response Interface (from OpenAPI spec) ─────────────────────

export interface UserProfileResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  lastLogin: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  /** Reactive user profile signal — consumed by Dashboard, Settings, etc. */
  profile = signal<UserProfileResponse | null>(null);

  /**
   * GET /api/user/profile
   * Fetches the currently authenticated user's profile.
   */
  async loadProfile(): Promise<UserProfileResponse | null> {
    try {
      const data = await firstValueFrom(this.http.get<UserProfileResponse>('/api/user/profile'));
      this.profile.set(data);
      return data;
    } catch (err) {
      console.error('Failed to load user profile:', err);
      return null;
    }
  }

  /**
   * POST /api/users/profile-picture
   * Uploads a profile picture as multipart/form-data.
   * Note: This endpoint is from the backend txt spec but not yet in api-docs.json.
   *       Schema may change once backend confirms.
   */
  async uploadProfilePicture(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    return firstValueFrom(this.http.post<any>('/api/users/profile-picture', formData));
  }
}
