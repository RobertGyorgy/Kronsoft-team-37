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

    // Construim un context clar din răspunsurile sondajului
    const userProfile = Object.entries(answers)
      .map(([q, a]) => `- ${q}: ${a}`)
      .join('\n');

    const systemMsg = `Ești un ghid turistic expert din Brașov, România. 
    Misiunea ta este să oferi recomandări de înaltă calitate, REALE și VERIFICABILE.
    Trebuie să răspunzi EXCLUSIV în format JSON.`;

    const userMsg = `Pe baza profilului meu:
    ${userProfile}
    
    ID Unic Solicitare: ${Date.now()} (Oferă variante diferite față de dățile trecute).

    Recomandă-mi EXACT 3 locații REALE din Brașov pentru categoria "${category}".
    
    Reguli stricte:
    1. Doar locații care există în realitate (restaurante, parcuri, muzee etc.) și pot fi găsite pe Google Maps.
    2. Descrierea să fie atractivă și utilă (aprox. 25 cuvinte).
    3. Sfatul (tip) să fie unul practic și specific acelei locații.
    4. Formatul JSON trebuie să fie:
    {
      "recommendations": [
        { "name": "Nume Locație Reală", "description": "Descriere", "tip": "Sfat practic" }
      ]
    }`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: userMsg }
          ],
          temperature: 0.8, // Puțin mai mare pentru varietate, dar controlat
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) throw new Error('Groq API error');

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      console.log('🤖 AI Raw Output:', rawContent); 
      
      const parsed = JSON.parse(rawContent);
      
      // Robustete: Căutăm lista de recomandări indiferent de numele cheii
      const list = parsed.recommendations || parsed.recomandari || Object.values(parsed).find(v => Array.isArray(v)) || [];
      
      // Ne asigurăm că avem exact 3
      return { recommendations: list.slice(0, 3) };
    } catch (error) {
      console.error('❌ Groq Error:', error);
      throw error;
    }
  }
}
