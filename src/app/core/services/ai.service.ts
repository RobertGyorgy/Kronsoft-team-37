import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/ai/recommendation';

  async getRecommendation(category: string, answers: any) {
    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.apiUrl, { category, answers })
      );
      return response;
    } catch (error) {
      console.error('❌ AI Bridge Error:', error);
      throw error;
    }
  }
}
