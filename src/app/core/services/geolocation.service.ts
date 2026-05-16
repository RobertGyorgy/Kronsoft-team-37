import { Injectable, signal, NgZone } from '@angular/core';

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  public currentLocation = signal<Location | null>(null);
  public error = signal<string | null>(null);
  public isTracking = signal<boolean>(false);

  private watchId: number | null = null;

  constructor(private zone: NgZone) {}

  public startTracking() {
    if (this.watchId !== null) return;

    if (!navigator.geolocation) {
      this.error.set('Geolocation is not supported by your browser');
      return;
    }

    this.isTracking.set(true);
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.zone.run(() => {
          this.currentLocation.set({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading ?? undefined,
            speed: pos.coords.speed ?? undefined
          });
          this.error.set(null);
        });
      },
      (err) => {
        this.zone.run(() => {
          this.error.set(err.message);
          console.warn('Geolocation error:', err);
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  public stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking.set(false);
    }
  }

  public async getCurrentPosition(): Promise<Location | null> {
    // If we're already tracking, return the latest location immediately
    const current = this.currentLocation();
    if (current) return current;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          this.zone.run(() => this.currentLocation.set(loc));
          resolve(loc);
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }
}
