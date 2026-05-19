import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** Scraped events from PWA bridge (port 8081). */
const SCRAPED_EVENTS_API = '/api/events';
/** User-managed events from Spring backend (port 8083). */
const APP_EVENTS_API = '/api/app-events';

export interface EventItem {
  id: number | string;
  title: string;
  when: string;
  location: string;
  imageUrl: string;
  category?: string;
  link?: string;
  isPromoted?: boolean;
  plan?: string;
  promotedBy?: string;
  /** `scraped` = bridge feed; `app` = Spring EventController */
  source?: 'scraped' | 'app';
}

export interface PromoteEventForm {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  link?: string;
  imageUrl?: string;
  plan: string;
  promotedBy?: string;
}

interface PagedEventsResponse {
  content?: unknown[];
}

interface ApiEventResponse {
  id: number;
  title: string;
  when?: string;
  location: string;
  imageUrl?: string;
}

interface ApiEventDetailsResponse {
  id: number;
  title: string;
  location: string;
  startTime?: string;
  endTime?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);

  events = signal<EventItem[]>([]);

  /**
   * Loads scraped events first, then fetches app events from the backend and appends them below.
   */
  async loadEvents(page = 0, size = 50): Promise<void> {
    const scraped = await this.fetchScrapedEvents(page, size);
    this.events.set([...scraped]);

    const appEvents = await this.fetchAppEvents(page, size);
    this.events.set(this.mergeEvents(scraped, appEvents));
  }

  private async fetchScrapedEvents(page: number, size: number): Promise<EventItem[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<PagedEventsResponse>(`${SCRAPED_EVENTS_API}/current-week?page=${page}&size=${size}`)
      );
      return (res.content ?? []).map((item) => this.mapScrapedEvent(item));
    } catch (err) {
      console.error('Failed to load scraped events:', err);
      return [];
    }
  }

  private async fetchAppEvents(page: number, size: number): Promise<EventItem[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<PagedEventsResponse>(`${APP_EVENTS_API}/current-week?page=${page}&size=${size}`)
      );
      return (res.content ?? []).map((item) => this.mapAppEvent(item));
    } catch (err) {
      console.error('Failed to load app events:', err);
      return [];
    }
  }

  /**
   * GET /api/app-events/next-week (proxied to EventController).
   */
  async loadNextWeekEvents(page = 0, size = 50): Promise<EventItem[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<PagedEventsResponse>(`${APP_EVENTS_API}/next-week?page=${page}&size=${size}`)
      );
      return (res.content ?? []).map((item) => this.mapAppEvent(item));
    } catch (err) {
      console.error('Failed to load next week app events:', err);
      return [];
    }
  }

  /**
   * POST /api/app-events (proxied to EventController multipart create).
   */
  async promoteEvent(form: PromoteEventForm): Promise<ApiEventDetailsResponse> {
    const startTime = new Date(`${form.date}T${form.time}`);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const descriptionParts = [form.description.trim()];
    if (form.category) {
      descriptionParts.push(`Categorie: ${form.category}`);
    }
    if (form.link?.trim()) {
      descriptionParts.push(`Link bilete: ${form.link.trim()}`);
    }
    if (form.plan) {
      descriptionParts.push(`Plan promovare: ${form.plan}`);
    }
    if (form.promotedBy) {
      descriptionParts.push(`Promovat de: ${form.promotedBy}`);
    }

    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('description', descriptionParts.join('\n'));
    body.append('location', form.location.trim());
    body.append('startTime', this.formatLocalDateTime(startTime));
    body.append('endTime', this.formatLocalDateTime(endTime));
    body.append('status', 'PLANNED');

    const imageFile = await this.imageUrlToFile(form.imageUrl);
    if (imageFile) {
      body.append('image', imageFile);
    }

    const created = await firstValueFrom(
      this.http.post<ApiEventDetailsResponse>(APP_EVENTS_API, body)
    );

    await this.loadEvents();
    return created;
  }

  private formatLocalDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private async imageUrlToFile(url?: string): Promise<File | null> {
    if (!url?.trim()) {
      return null;
    }
    try {
      const response = await fetch(url.trim());
      if (!response.ok) {
        return null;
      }
      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      return new File([blob], `event-cover.${extension}`, { type: blob.type || 'image/jpeg' });
    } catch {
      return null;
    }
  }

  /** Ensures `when` is always a value Angular DatePipe can parse. */
  private normalizeWhen(when: string | undefined): string {
    if (!when?.trim()) {
      return new Date().toISOString();
    }
    const parsed = Date.parse(when);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
    return new Date().toISOString();
  }

  private mapScrapedEvent(raw: unknown): EventItem {
    const item = raw as Partial<EventItem>;
    return {
      id: item.id ?? `scraped-${Math.random()}`,
      title: item.title ?? 'Eveniment',
      when: this.normalizeWhen(item.when),
      location: item.location ?? 'Brașov',
      imageUrl: item.imageUrl ?? '',
      category: item.category,
      link: item.link,
      isPromoted: item.isPromoted,
      plan: item.plan,
      promotedBy: item.promotedBy,
      source: 'scraped',
    };
  }

  private mapAppEvent(raw: unknown): EventItem {
    const item = raw as ApiEventResponse;
    const imageUrl = item.imageUrl
      ? (item.imageUrl.startsWith('http') ? item.imageUrl : `/api/images?path=${encodeURIComponent(item.imageUrl)}`)
      : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';

    return {
      id: `app-${item.id}`,
      title: item.title,
      when: this.normalizeWhen(item.when),
      location: item.location,
      imageUrl,
      category: 'EVENIMENT',
      isPromoted: true,
      plan: 'BASIC',
      source: 'app',
    };
  }

  /** Scraped list first (sorted), then backend events (sorted) — no interleaving. */
  private mergeEvents(scraped: EventItem[], appEvents: EventItem[]): EventItem[] {
    const byDate = (a: EventItem, b: EventItem) => Date.parse(a.when) - Date.parse(b.when);
    const sortedScraped = [...scraped].sort(byDate);
    const sortedApp = [...appEvents].sort(byDate);
    return [...sortedScraped, ...sortedApp];
  }
}
