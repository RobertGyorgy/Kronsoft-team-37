import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  // Folosim API-ul Groq (ultra-rapid)
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private apiKey: string | null = null;
  private decisionTree: any = null;

  constructor() {
    this.loadDecisionTree();
  }

  isLocalCategory(category: string): boolean {
    const categoryMap: { [key: string]: string } = {
      'Natură': 'natura',
      'Artă și istorie': 'arta',
      'Restaurante': 'restaurante',
      'Cafenele': 'cafenele',
      'Plimbări urbane': 'plimbari',
      'Experiențe inedite': 'experiente'
    };
    const catId = categoryMap[category] || category.toLowerCase();
    return this.decisionTree ? !!this.decisionTree[catId] : catId === 'natura';
  }

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

  private async loadDecisionTree() {
    if (this.decisionTree) return;
    try {
      const res = await fetch('/decision_tree.json');
      this.decisionTree = await res.json();
      console.log('🌳 Decision Tree loaded successfully:', this.decisionTree);
    } catch (e) {
      console.error('❌ Eșec la încărcarea decision_tree.json:', e);
    }
  }

  async getRecommendation(category: string, answers: any) {
    // 1. Încercăm mai întâi să încărcăm Arborele de Decizie local
    await this.loadDecisionTree();

    const categoryMap: { [key: string]: string } = {
      'Natură': 'natura',
      'Artă și istorie': 'arta',
      'Restaurante': 'restaurante',
      'Cafenele': 'cafenele',
      'Plimbări urbane': 'plimbari',
      'Experiențe inedite': 'experiente'
    };

    const catId = categoryMap[category] || category.toLowerCase();

    // 2. Dacă avem categoria definită în arborele de decizie, facem un lookup direct
    if (this.decisionTree && this.decisionTree[catId]) {
      console.log(`🎯 Performăm lookup direct în Arborele de Decizie pentru categoria: ${catId}`);
      const catTree = this.decisionTree[catId];
      const combinationParts: string[] = [];

      for (const q of catTree.questions) {
        const answerLabel = answers[q.text];
        if (!answerLabel) {
          console.warn(`Answer for question "${q.text}" not found in`, answers);
          continue;
        }

        const clean = (s: string) => s.replace(/[\s\u2013\u2014-]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
        const cleanAnswer = clean(answerLabel);

        const option = q.options.find((o: any) => clean(o.label) === cleanAnswer);
        if (option) {
          combinationParts.push(option.id);
        } else {
          // Fallback pe incluziune
          const subOption = q.options.find((o: any) => cleanAnswer.includes(clean(o.label)) || clean(o.label).includes(cleanAnswer));
          if (subOption) {
            combinationParts.push(subOption.id);
          } else {
            console.warn(`Option ID not found for label "${answerLabel}" in question`, q);
          }
        }
      }

      const combinationKey = combinationParts.join('-');
      console.log(`🔑 Cheie combinație generată: "${combinationKey}"`);

      const result = catTree.results[combinationKey];
      if (result) {
        const placesList = result.recommendations.map((placeId: string) => {
          const place = catTree.places[placeId];
          if (place) {
            return {
              name: place.name,
              description: place.description || place.shortDescription,
              tip: place.tip,
              coordinates: place.coordinates
            };
          }
          return null;
        }).filter((p: any) => p !== null);

        console.log('✅ Rezultate extrase direct din JSON:', placesList);
        return { recommendations: placesList };
      } else {
        console.warn(`⚠️ Combinația "${combinationKey}" nu a fost găsită în tabela de rezultate. Fallback pe AI.`);
      }
    }

    // 3. Fallback pe AI (Groq) dacă nu avem categoria în JSON sau combinația nu există
    await this.loadConfig();
    if (!this.apiKey) throw new Error('API Key missing. Check config.json');

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
    3. Sfatul (tip) să fie unul practical și specific acelei locații.
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
          temperature: 0.8,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) throw new Error('Groq API error');

      const data = await response.json();
      const rawContent = data.choices[0].message.content;
      console.log('🤖 AI Raw Output:', rawContent); 
      
      const parsed = JSON.parse(rawContent);
      const list = parsed.recommendations || parsed.recomandari || Object.values(parsed).find(v => Array.isArray(v)) || [];
      
      const enrichedList = list.map((item: any) => {
        let coords = item.coordinates || null;
        if (!coords && this.decisionTree) {
          const normName = item.name.toLowerCase().trim();
          for (const catKey of Object.keys(this.decisionTree)) {
            const cat = this.decisionTree[catKey];
            if (cat.places) {
              const matchedKey = Object.keys(cat.places).find(pk => {
                const p = cat.places[pk];
                return p.name.toLowerCase().trim().includes(normName) || normName.includes(p.name.toLowerCase().trim());
              });
              if (matchedKey) {
                coords = cat.places[matchedKey].coordinates;
                break;
              }
            }
          }
        }
        if (!coords) {
          coords = { lat: 45.6483, lng: 25.5891 };
        }
        return {
          ...item,
          coordinates: coords
        };
      });

      return { recommendations: enrichedList.slice(0, 3) };
    } catch (error) {
      console.error('❌ Groq Error:', error);
      throw error;
    }
  }
}

