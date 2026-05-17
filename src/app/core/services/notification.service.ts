import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Response Interface (from OpenAPI spec) ─────────────────────

export type NotificationType =
  | 'REPORT_STATUS_CHANGE'
  | 'PARKING_EXPIRING'
  | 'EVENT_ANNOUNCEMENT'
  | 'SYSTEM_ALERT'
  | 'RECOMMENDATION_NEW';

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/notifications';

  notifications = signal<NotificationResponse[]>([]);
  unreadCount = signal<number>(0);

  /**
   * GET /api/notifications?page=&size=
   * Paginated list of notifications for the current user.
   */
  async loadNotifications(page = 0, size = 20): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}`)
      );
      this.notifications.set(res.content || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Returns the number of unread notifications.
   */
  async loadUnreadCount(): Promise<void> {
    try {
      const count = await firstValueFrom(
        this.http.get<number>(`${this.baseUrl}/unread-count`)
      );
      this.unreadCount.set(count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }

  /**
   * PATCH /api/notifications/{notificationId}/read
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch<void>(`${this.baseUrl}/${notificationId}/read`, {})
      );
      // Update local state
      this.notifications.update(list =>
        list.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      this.unreadCount.update(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  /**
   * POST /api/notifications/read-all
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/read-all`, {})
      );
      this.notifications.update(list => list.map(n => ({ ...n, read: true })));
      this.unreadCount.set(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }
}
