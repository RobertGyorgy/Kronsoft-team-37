import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface EventItem {
  id: number;
  name: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  category: 'Cultural' | 'Sport' | 'Muzică' | 'Târg';
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="events-shell">
      <header class="top-nav-purple">
        <button class="back-btn-purple" (click)="goBack()">
          <span class="material-icons">arrow_back</span> Înapoi
        </button>
        <h1 class="page-title">Evenimente Brașov</h1>
      </header>

      <div class="events-list-container">
        @for (event of sortedEvents(); track event.id) {
          <div class="event-list-item">
            <!-- DATE BADGE -->
            <div class="date-badge">
              <span class="day">{{ event.date.getDate() }}</span>
              <span class="month">{{ getMonthName(event.date) }}</span>
            </div>

            <!-- INFO -->
            <div class="event-content">
              <div class="category-row">
                <span class="category-tag" [ngClass]="event.category.toLowerCase()">
                  {{ event.category }}
                </span>
                <span class="time-wrap"><span class="material-icons">schedule</span> {{ event.time }}</span>
              </div>
              <h3 class="event-name">{{ event.name }}</h3>
              <div class="location-wrap">
                <span class="material-icons">place</span> {{ event.location }}
              </div>
              <p class="event-desc">{{ event.description }}</p>
            </div>
            
            <button class="calendar-add-btn">
              <span class="material-icons">calendar_today</span>
            </button>
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .events-shell { height: 100vh; width: 100%; overflow: hidden; background: #fdfbff; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; }
    
    .top-nav-purple { padding: calc(var(--safe-top) + 1.2rem) 1.5rem 1.25rem; background: #a55eea; display: flex; align-items: center; justify-content: space-between; color: #fff; }
    .back-btn-purple { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 0.5rem 1rem; border-radius: 50px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .page-title { font-size: 1.2rem; font-weight: 900; margin: 0; }

    .events-list-container { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

    .event-list-item {
      background: #fff;
      border-radius: 24px;
      padding: 1.25rem;
      display: flex;
      gap: 1.25rem;
      align-items: center;
      box-shadow: 0 10px 25px rgba(165, 94, 234, 0.08);
      border: 1px solid rgba(165, 94, 234, 0.05);
      position: relative;
    }

    .date-badge {
      min-width: 65px;
      height: 75px;
      background: #f8f1ff;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid #e9d5ff;
    }
    .date-badge .day { font-size: 1.6rem; font-weight: 950; color: #a55eea; line-height: 1; }
    .date-badge .month { font-size: 0.75rem; font-weight: 900; color: #a55eea; text-transform: uppercase; letter-spacing: 0.05em; }

    .event-content { flex: 1; }
    .category-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
    .category-tag { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; padding: 0.25rem 0.6rem; border-radius: 50px; letter-spacing: 0.05em; }
    .category-tag.cultural { background: #e0f2fe; color: #0369a1; }
    .category-tag.sport { background: #dcfce7; color: #15803d; }
    .category-tag.muzică { background: #fef3c7; color: #b45309; }
    .category-tag.târg { background: #ffedd5; color: #c2410c; }
    
    .time-wrap { font-size: 0.8rem; font-weight: 700; color: #888; display: flex; align-items: center; gap: 0.25rem; }
    .time-wrap .material-icons { font-size: 1rem; }

    .event-name { font-size: 1.15rem; font-weight: 900; color: #1a1a1a; margin: 0 0 0.25rem; line-height: 1.2; letter-spacing: -0.01em; }
    .location-wrap { font-size: 0.85rem; font-weight: 700; color: #a55eea; display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.6rem; }
    .location-wrap .material-icons { font-size: 1rem; }
    
    .event-desc { font-size: 0.9rem; color: #666; line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .calendar-add-btn { background: #f8f1ff; border: none; color: #a55eea; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .calendar-add-btn:active { transform: scale(0.9); background: #a55eea; color: #fff; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent {
  events: EventItem[] = [
    { id: 1, name: "Concert Simfonic Extraordinar", date: new Date(2026, 5, 15), time: "19:00", location: "Filarmonica Brașov", description: "O seară magică dedicată compozitorilor clasici, sub bagheta maestrului Cristian Mandeal.", category: "Cultural" },
    { id: 2, name: "Maratonul Internațional Brașov", date: new Date(2026, 5, 20), time: "08:30", location: "Piața Sfatului", description: "Cea mai mare cursă de alergare din inima munților. Participă sau vino să susții alergătorii!", category: "Sport" },
    { id: 3, name: "Jazz in the Park", date: new Date(2026, 6, 5), time: "18:00", location: "Parcul Nicolae Titulescu", description: "Atmosferă relaxată și ritmuri de jazz contemporan sub umbra arborilor bătrâni din centru.", category: "Muzică" },
    { id: 4, name: "Târgul Meșteșugarilor Locali", date: new Date(2026, 5, 12), time: "10:00", location: "Aleea de sub Tâmpa", description: "Descoperă obiecte lucrate manual de cei mai iscusiți artizani din zona Transilvaniei.", category: "Târg" },
    { id: 5, name: "Festivalul de Teatru Contemporan", date: new Date(2026, 6, 10), time: "19:30", location: "Centrul Cultural Reduta", description: "O selecție de piese de teatru moderne premiate la nivel național și internațional.", category: "Cultural" },
    { id: 6, name: "Rock sub Tâmpa", date: new Date(2026, 5, 25), time: "20:00", location: "Teatrul de Vară", description: "Concert live cu cele mai apreciate trupe de rock alternativ din România.", category: "Muzică" }
  ];

  sortedEvents = computed(() => [...this.events].sort((a, b) => a.date.getTime() - b.date.getTime()));

  getMonthName(date: Date): string {
    return date.toLocaleString('ro-RO', { month: 'short' }).replace('.', '');
  }

  goBack() { window.history.back(); }
}
