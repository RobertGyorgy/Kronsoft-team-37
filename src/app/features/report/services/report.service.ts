import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Report {
  id: number;
  userName: string;
  categoryName: string;
  description: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  status: 'NEW' | 'IN_PROGRESS';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = '/api/reports';

  reports = signal<Report[]>([]);
  categories = signal<{id: number, name: string}[]>([]);

  constructor() {
    this.loadReports();
    this.loadCategories();
  }

  async loadCategories() {
    try {
      const data = await firstValueFrom(this.http.get<any[]>('/api/report-categories'));
      this.categories.set(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async loadReports() {
    try {
      // Default to page 0, size 50 for now
      const res = await firstValueFrom(this.http.get<any>(`${this.apiUrl}?page=0&size=50`));
      this.reports.set(res.content || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  }

  async addReport(reportData: any, imageFile?: File) {
    try {
      const formData = new FormData();
      
      // The Java backend expects a 'report' part or individual fields as multipart
      // Based on schema 'CityReportRequest' properties:
      const requestBlob = new Blob([JSON.stringify({
        categoryId: reportData.categoryId,
        description: reportData.description,
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        status: 'NEW'
      })], { type: 'application/json' });

      // If the backend uses @RequestPart("report")
      // formData.append('report', requestBlob);
      
      // If the backend uses individual fields:
      formData.append('categoryId', reportData.categoryId.toString());
      formData.append('description', reportData.description);
      formData.append('latitude', reportData.latitude.toString());
      formData.append('longitude', reportData.longitude.toString());
      formData.append('status', 'NEW');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const newReport = await firstValueFrom(this.http.post<Report>(this.apiUrl, formData));
      this.reports.update(current => [newReport, ...current]);
    } catch (err) {
      console.error('Failed to add report:', err);
    }
  }
}
