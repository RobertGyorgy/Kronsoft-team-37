import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Response Interfaces (aligned with backend DTOs) ────────────

export interface Report {
  id: number;
  userId: number;
  userName: string;
  categoryName: string;
  description: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  status: 'NEW' | 'IN_PROGRESS';
  createdAt: string;
}

export interface ReportCategory {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = '/api/reports';

  reports = signal<Report[]>([]);
  categories = signal<ReportCategory[]>([]);

  constructor() {
    this.loadReports();
    this.loadCategories();
  }

  /**
   * GET /api/report-categories
   * Returns all available report categories.
   */
  async loadCategories(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<ReportCategory[]>('/api/report-categories')
      );
      this.categories.set(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  /**
   * GET /api/reports?page=&size=&sort=createdAt,desc
   * Paginated reports, sorted by most recent first.
   */
  async loadReports(page = 0, size = 50): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}&sort=createdAt,desc`)
      );
      this.reports.set(res.content || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  }

  /**
   * GET /api/reports/user?page=&size=
   * Get reports submitted by the current user.
   */
  async loadUserReports(page = 0, size = 50): Promise<Report[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/user?page=${page}&size=${size}&sort=createdAt,desc`)
      );
      return res.content || [];
    } catch (err) {
      console.error('Failed to load user reports:', err);
      return [];
    }
  }

  /**
   * POST /api/reports (multipart/form-data via @ModelAttribute)
   * Submit a new city report with an optional photo.
   * Backend expects: CityReportRequest { categoryId, description, latitude, longitude, image?, status }
   * Uses @ModelAttribute — all fields are sent as individual form-data parts.
   */
  async addReport(reportData: { categoryId: number; description: string; latitude: number; longitude: number }, imageFile?: File): Promise<void> {
    try {
      const formData = new FormData();

      formData.append('categoryId', reportData.categoryId.toString());
      formData.append('description', reportData.description);
      formData.append('latitude', reportData.latitude.toString());
      formData.append('longitude', reportData.longitude.toString());
      formData.append('status', 'NEW');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const newReport = await firstValueFrom(
        this.http.post<Report>(this.apiUrl, formData)
      );
      this.reports.update(current => [newReport, ...current]);
    } catch (err) {
      console.error('Failed to add report:', err);
    }
  }

  /**
   * GET /api/reports/{reportId}
   * Get a single report by ID.
   */
  async getReport(reportId: number): Promise<Report | null> {
    try {
      return await firstValueFrom(
        this.http.get<Report>(`${this.apiUrl}/${reportId}`)
      );
    } catch (err) {
      console.error('Failed to get report:', err);
      return null;
    }
  }
}
