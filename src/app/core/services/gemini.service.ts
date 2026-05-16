import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  // Folosim API-ul Groq (ultra-rapid)
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private apiKey: string | null = null;

  private async loadConfig() {
    if (this.apiKey) return;
    try {
      const res = await fetch('/config.json');
      const config = await res.json();
      this.apiKey = config.GROQ_API_KEY;
    } catch (e) {
      console.error('❌ Eșec la încărcarea config.json:', e);
    }
  }

  async getRecommendation(category: string, answers: any) {
    await this.loadConfig();
    if (!this.apiKey) throw new Error('API Key missing. Check config.json');

    const prompt = `
      Ești un ghid local expert din Brașov. Recomandă EXACT 3 locuri REALE din Brașov pentru categoria "${category}" pe baza: ${Object.values(answers).join(', ')}.
      Răspunde DOAR JSON valid, fără text înainte sau după:
      {
        "recommendations": [
          { "name": "Nume Locație", "description": "Descriere.", "tip": "Sfat." }
        ]
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) throw new Error('Groq API error');

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return content;
    } catch (error) {
      console.error('❌ Groq Error:', error);
      throw error;
    }
  }
}
