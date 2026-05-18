import { Injectable, signal, NgZone } from '@angular/core';

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export type GeolocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  public currentLocation = signal<Location | null>(null);
  public error = signal<string | null>(null);
  public isTracking = signal<boolean>(false);

  private watchId: number | null = null;

  constructor(private zone: NgZone) {}

  public async getPermissionState(): Promise<GeolocationPermissionState> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return 'unsupported';
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      return 'denied';
    }
    if (!navigator.permissions?.query) {
      return 'prompt';
    }
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state as GeolocationPermissionState;
    } catch {
      return 'prompt';
    }
  }

  /**
   * Request the device location. Call synchronously from a click/tap handler so the
   * browser can show the permission prompt (required by Chrome and others).
   */
  public acquireLocation(
    onSuccess: (loc: Location) => void,
    onError: (err: GeolocationPositionError | { message: string; code: number }) => void
  ): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      onError({ message: 'Geolocation is not supported by your browser.', code: 0 });
      return;
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      onError({
        message: 'Location requires a secure connection. Use https:// or http://localhost.',
        code: 0
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = this.locationFromPosition(position);
        this.zone.run(() => {
          this.currentLocation.set(loc);
          this.error.set(null);
          onSuccess(loc);
        });
      },
      (err) => {
        this.zone.run(() => {
          this.error.set(err.message);
          console.warn('Geolocation error:', err);
          onError(err);
        });
      }
    );
  }

  public startTracking() {
    if (this.watchId !== null) return;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.error.set('Geolocation is not supported by your browser');
      return;
    }

    this.isTracking.set(true);
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.applyPosition(pos),
      (err) => this.applyError(err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }

  public stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking.set(false);
    }
  }

  /** Use when permission is already granted (e.g. on page load). For user taps, use acquireLocation. */
  public getCurrentPosition(force = false): Promise<Location | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.zone.run(() => this.error.set('Geolocation is not supported by your browser'));
      return Promise.resolve(null);
    }

    if (!force) {
      const current = this.currentLocation();
      if (current) return Promise.resolve(current);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = this.locationFromPosition(position);
          this.zone.run(() => {
            this.currentLocation.set(loc);
            this.error.set(null);
            resolve(loc);
          });
        },
        (err) => {
          console.warn('Geolocation error:', err);
          this.zone.run(() => {
            this.error.set(err.message);
            resolve(null);
          });
        }
      );
    });
  }

  private applyPosition(pos: GeolocationPosition) {
    this.zone.run(() => {
      this.currentLocation.set(this.locationFromPosition(pos));
      this.error.set(null);
    });
  }

  private applyError(err: GeolocationPositionError) {
    this.zone.run(() => {
      this.error.set(err.message);
      console.warn('Geolocation error:', err);
    });
  }

  private locationFromPosition(position: GeolocationPosition): Location {
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading ?? undefined,
      speed: position.coords.speed ?? undefined
    };
  }
}
