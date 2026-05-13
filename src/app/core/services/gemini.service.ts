import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);
  
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  async getRecommendation(answers: any, apiKey: string) {
    const brasovContext = `
      Baza de date de referință (exemple de succes):
      - Pietrele lui Solomon (Natură/Aventură) - Poză: https://zilesinopti.ro/wp-content/uploads/2026/04/pietrele-lui-solomon.jpg
      - CH9 Specialty Coffee (Gastronomie/Relax) - Poză: https://zilesinopti.ro/wp-content/uploads/2024/05/ch9-coffee.jpg
      - Turnul Alb (Istorie/Panoramă) - Poză: https://zilesinopti.ro/wp-content/uploads/2026/04/1-header-2.webp
      - Lacul Noua (Familie/Relax) - Poză: https://zilesinopti.ro/wp-content/uploads/2026/04/1-header-2.webp
      - Aftăr Stube (Social/Craft Beer) - Poză: https://zilesinopti.ro/wp-content/uploads/2026/04/1-Artis-Poza-01-Principala-event.webp
      - Tipografia (Cultură/Urban) - Poză: https://zilesinopti.ro/wp-content/uploads/2026/04/Brasov@Acasa.jpg
    `;

    const prompt = `
      Ești asistentul "Smart Advisor" - un expert în date Open Source despre orașul Brașov.
      
      OBIECTIV: Oferă o recomandare de activitate REALĂ și PRECISĂ pentru acest weekend.
      
      DATE UTILIZATOR:
      - VIBE: ${answers.vibe}
      - COMPANIE: ${answers.company}
      - BUGET: ${answers.budget}
      - TIMP: ${answers.duration}

      INSTRUCȚIUNI CRITICE (OPEN SOURCE DATA):
      1. Folosește-ți cunoștințele tale vaste despre Brașov (restaurante, trasee, muzee, parcuri).
      2. Recomandarea trebuie să fie o locație care EXISTĂ în realitate.
      3. Dacă locația nu este în lista de exemple de mai sus, caută în baza ta de date internă o imagine reală (URL valid) sau folosește unul dintre link-urile de poze de mai sus care se potrivește ca stil.

      RĂSPUNDE EXCLUSIV ÎN JSON CU ACEASTĂ STRUCTURĂ:
      {
        "title": "Numele Activității",
        "location": "Adresa exactă sau zona",
        "image": "URL-ul pozei reale",
        "details": "Descriere detaliată și motivul alegerii (max 3 fraze)",
        "reason": "De ce este perfect pentru vibe-ul ${answers.vibe}?",
        "emoji": "Emoji relevant"
      }
    `;

    const body = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Ești un expert în date Open Source despre Brașov. Oferi doar locații reale și precise. Răspunzi DOAR în JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });

    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.apiUrl, body, { headers })
      );
      
      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Groq API Error:', error);
      throw error;
    }
  }
}
