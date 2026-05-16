import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  // Folosim modelul 8B - cel mai rapid model disponibil de la Google
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent';

  async getRecommendation(category: string, answers: any) {
    const cacheKey = `gemini_cache_${category}_${JSON.stringify(answers)}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const apiKey = environment.geminiApiKey;
    const url = `${this.apiUrl}?key=${apiKey}`;

    const prompt = `Recomandă scurt 3 locuri în Brașov pt "${category}" (${Object.values(answers).join(', ')}). Răspunde DOAR JSON: {"recommendations":[{"name":"..","description":"..","tip":".."}]}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, message: errorData?.error?.message || response.statusText };
      }

      const data = await response.json();
      let content = data.candidates[0].content.parts[0].text;
      content = content.replace(/```json|```/g, '').trim();
      
      const parsed = JSON.parse(content);
      localStorage.setItem(cacheKey, JSON.stringify(parsed));
      return parsed;
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
