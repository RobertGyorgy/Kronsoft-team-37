import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransitService {
  private http = inject(HttpClient);
  
  public smartStops = signal<any[]>([]);
  public isLoaded = signal(false);

  async loadData() {
    if (this.isLoaded()) return;
    try {
      const timestamp = new Date().getTime();
      const data = await firstValueFrom(this.http.get<any[]>(`/api/v1/transit/data?v=${timestamp}`));
      this.smartStops.set(data);
      this.isLoaded.set(true);
    } catch (err) {
      console.error('Failed to load transit data:', err);
    }
  }

  public normalizeText(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ă|â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .trim();
  }


  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}
