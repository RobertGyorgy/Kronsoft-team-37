import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Response Interfaces (aligned with backend DTOs) ─────────────

export interface VehicleRequest {
  plateNumber: string;
}

export interface VehicleResponse {
  id: number;
  plateNumber: string;
}

export interface UserProfileResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  lastLogin: string;
  profilePictureUrl: string;
  vehicles: VehicleResponse[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private profileLoadPromise: Promise<UserProfileResponse | null> | null = null;

  /** Reactive user profile signal — consumed by Dashboard, Settings, etc. */
  profile = signal<UserProfileResponse | null>(null);

  /**
   * GET /api/user/profile
   * Fetches the profile once per authenticated session (cached in {@link profile}).
   */
  loadProfile(): Promise<UserProfileResponse | null> {
    const cached = this.profile();
    if (cached) {
      return Promise.resolve(cached);
    }

    if (this.profileLoadPromise) {
      return this.profileLoadPromise;
    }

    this.profileLoadPromise = this.fetchProfile().finally(() => {
      this.profileLoadPromise = null;
    });
    return this.profileLoadPromise;
  }

  clearProfile(): void {
    this.profile.set(null);
    this.profileLoadPromise = null;
  }

  private async fetchProfile(): Promise<UserProfileResponse | null> {
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
   * POST /api/user/profile-picture
   * Uploads a profile picture as multipart/form-data.
   * Backend expects: @RequestPart("image") MultipartFile image
   * Returns: updated UserProfileResponse with new profilePictureUrl
   */
  async uploadProfilePicture(file: File): Promise<UserProfileResponse | null> {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const updated = await firstValueFrom(
        this.http.post<UserProfileResponse>('/api/user/profile-picture', formData)
      );
      this.profile.set(updated);
      return updated;
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      return null;
    }
  }

  /**
   * Resolves the full URL for downloading a backend image.
   * Backend endpoint: GET /api/images?path={profilePictureUrl}
   * Requires access-token (handled by auth interceptor).
   */
  getImageUrl(path: string | null | undefined): string {
    if (!path) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=User';
    return `/api/images?path=${encodeURIComponent(path)}`;
  }

  /**
   * Reloads profile from GET /api/user/profile (bypasses session cache).
   */
  async refreshProfile(): Promise<UserProfileResponse | null> {
    try {
      const data = await firstValueFrom(this.http.get<UserProfileResponse>('/api/user/profile'));
      this.profile.set(data);
      return data;
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
      return null;
    }
  }

  /**
   * PUT /api/user/vehicles
   * Adds a vehicle, then reloads profile from GET /api/user/profile.
   */
  async addVehicle(plateNumber: string): Promise<UserProfileResponse | null> {
    const body: VehicleRequest = { plateNumber };
    try {
      await firstValueFrom(this.http.put<void>('/api/user/vehicles', body));
      return this.refreshProfile();
    } catch (err) {
      console.error('Failed to add vehicle:', err);
      return null;
    }
  }

  /**
   * DELETE /api/user/vehicles/{vehicleId}
   * Removes a vehicle from the user's profile.
   */
  async removeVehicle(vehicleId: number): Promise<UserProfileResponse | null> {
    try {
      const updated = await firstValueFrom(
        this.http.delete<UserProfileResponse>(`/api/user/vehicles/${vehicleId}`)
      );
      this.profile.set(updated);
      return updated;
    } catch (err) {
      console.error('Failed to remove vehicle:', err);
      return null;
    }
  }
}
