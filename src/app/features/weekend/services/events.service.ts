import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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
  private apiUrl = '/api/events/current-week';

  events = signal<EventItem[]>([]);

  constructor() {
    this.loadEvents();
  }

  async loadEvents() {
    try {
      const res = await firstValueFrom(this.http.get<any>(`${this.apiUrl}?page=0&size=50`));
      this.events.set(res.content || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }
}
