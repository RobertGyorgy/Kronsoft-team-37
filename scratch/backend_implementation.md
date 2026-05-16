# Ghid Implementare Backend - SmartCity AI

Acest document conține logica necesară pentru a muta comunicarea cu Google Gemini de pe Frontend pe Backend (Node.js/Express).

## 1. Variabile de Mediu (.env pe Server)
Adaugă cheia ta API în fișierul `.env` al serverului:

```env
GEMINI_API_KEY=AIzaSyAP8MiE0auHj-f64DtrQ2UqjLrIWrEpx-8
```

## 2. Implementare Controller (Node.js)

```javascript
/**
 * Endpoint: POST /api/ai/recommend
 * Body: { category: string, answers: object }
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

async function handleAIRecommendation(req, res) {
    try {
        const { category, answers } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Cheia API nu este configurată pe server.' });
        }

        // Construim promptul (Identic cu cel testat în Frontend)
        const prompt = `
            Ești un ghid local expert din Brașov. Recomandă EXACT 3 locuri reale din Brașov pentru categoria "${category}" pe baza:
            ${Object.entries(answers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}

            Răspunde EXCLUSIV cu un obiect JSON valid, fără alte explicații.
            {
                "recommendations": [
                    { "name": "Nume", "description": "Descriere.", "tip": "Sfat." }
                ]
            }
        `;

        // Apel către Google
        const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7 }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json(error);
        }

        const data = await response.json();
        let content = data.candidates[0].content.parts[0].text;
        
        // Curățare JSON
        content = content.replace(/```json|```/g, '').trim();
        const recommendations = JSON.parse(content);

        return res.json(recommendations);

    } catch (error) {
        console.error('AI Error:', error);
        return res.status(500).json({ error: 'Eroare la procesarea AI' });
    }
}
```

## 3. Modificare Frontend (Angular)
După ce backend-ul este gata, modifică `src/app/core/services/gemini.service.ts`:

```typescript
// Schimbă URL-ul către serverul tău local/producție
private apiUrl = 'http://localhost:3000/api/ai/recommend';

async getRecommendation(category: string, answers: any) {
    const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, answers })
    });
    return await response.json();
}
```
