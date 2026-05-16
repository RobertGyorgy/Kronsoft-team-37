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
      Ești un ghid local expert din Brașov, România. Recomandă EXACT 3 locuri REALE, specifice și populare (sau nestate ascunse) din Brașov pentru categoria "${category}".
      Criterii utilizator: ${Object.values(answers).join(', ')}.
      ID Unic Solicitare: ${Date.now()} (Oferă variante diferite față de dățile trecute).
      
      IMPORTANT: Oferă locații REALE care pot fi găsite pe Google Maps.
      Răspunde DOAR JSON valid:
      {
        "recommendations": [
          { "name": "Nume Locație Reală", "description": "De ce e special acest loc?", "tip": "Un sfat util pentru vizitator." }
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
          response_format: { type: 'json_object' },
          temperature: 0.9,
          max_tokens: 1000
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
