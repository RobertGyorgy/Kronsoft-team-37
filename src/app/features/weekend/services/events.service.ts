import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Response Interfaces (from OpenAPI spec) ────────────────────

export interface EventItem {
  id: number;
  title: string;
  when: string;
  location: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);

  events = signal<EventItem[]>([]);

  constructor() {
    this.loadEvents();
  }

  /**
   * GET /api/events/current-week?page=&size=
   * Default view — events happening this week.
   */
  async loadEvents(page = 0, size = 50) {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`/api/events/current-week?page=${page}&size=${size}`)
      );
      this.events.set(res.content || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }

  /**
   * GET /api/events/next-week?page=&size=
   * Events happening next week.
   */
  async loadNextWeekEvents(page = 0, size = 50): Promise<EventItem[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`/api/events/next-week?page=${page}&size=${size}`)
      );
      return res.content || [];
    } catch (err) {
      console.error('Failed to load next week events:', err);
      return [];
    }
  }

  /**
   * GET /api/events?q=<query>
   * Server-side event search by name.
   * Note: This endpoint is specified in client-endpoint-calls.txt.
   * If the backend doesn't support `q` yet, this will return all events.
   */
  async searchEvents(query: string, page = 0, size = 50): Promise<EventItem[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`/api/events?q=${encodeURIComponent(query)}&page=${page}&size=${size}`)
      );
      return res.content || [];
    } catch (err) {
      console.error('Failed to search events:', err);
      return [];
    }
  }
}
