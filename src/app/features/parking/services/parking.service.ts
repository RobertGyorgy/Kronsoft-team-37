import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Request/Response Interfaces (from OpenAPI spec) ────────────

export interface ParkingPaymentRequest {
  plateNumber: string;
  zoneCode: string;
  durationHours: number;
  latitude?: number;
  longitude?: number;
}

export interface ParkingPaymentResponse {
  id: number;
  plateNumber: string;
  zoneCode: string;
  durationHours: number;
  totalPrice: number;
  isPaid: boolean;
  paymentDate: string;
  status: string;
}

export interface ParkingZoneResponse {
  zone: string;
  tariffPerHour: number;
  tariffPerDay: number;
}

@Injectable({ providedIn: 'root' })
export class ParkingService {
  private readonly http = inject(HttpClient);

  myPayments = signal<ParkingPaymentResponse[]>([]);
  zones = signal<ParkingZoneResponse[]>([]);

  /**
   * POST /api/parking/payments
   * Submit a parking payment.
   */
  async createPayment(request: ParkingPaymentRequest): Promise<ParkingPaymentResponse> {
    const response = await firstValueFrom(
      this.http.post<ParkingPaymentResponse>('/api/parking/payments', request)
    );
    // Refresh the payments list after successful payment
    await this.loadMyPayments();
    return response;
  }

  /**
   * GET /api/parking/payments/my
   * Get the current user's payment history.
   */
  async loadMyPayments(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<ParkingPaymentResponse[]>('/api/parking/payments/my')
      );
      this.myPayments.set(data);
    } catch (err) {
      console.error('Failed to load parking payments:', err);
    }
  }

  /**
   * GET /api/parking/zones?page=0&size=50
   * Get all parking zones with tariffs.
   */
  async loadZones(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>('/api/parking/zones?page=0&size=50')
      );
      this.zones.set(res.content || []);
    } catch (err) {
      console.error('Failed to load parking zones:', err);
    }
  }
}
