import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="settings-shell" [class.dark-mode-active]="darkMode">
      <div class="background-glow"></div>
      
      <!-- TOP NAV -->
      <header class="settings-nav">
        <button class="minimal-back-btn" routerLink="/dashboard">
          <span class="material-icons">arrow_back_ios_new</span>
        </button>
        <h1 class="page-title">Setări</h1>
        <div class="spacer"></div>
      </header>

      <div class="scroll-container">
        <!-- USER PROFILE CARD -->
        <section class="profile-hero">
          <div class="glass-profile-card">
            <div class="avatar-container">
              <img [src]="avatarUrl" alt="Avatar" class="avatar">
              <button class="edit-avatar-btn" (click)="triggerAvatarUpload()">
                <span class="material-icons">photo_camera</span>
              </button>
              <input type="file" id="avatarInput" style="display:none" accept="image/*" (change)="onAvatarSelected($event)">
            </div>
            <div class="user-meta">
              <h2>{{ userName }}</h2>
              <p>Profil Utilizator</p>
            </div>
          </div>
        </section>

        <!-- VEHICLE MANAGEMENT -->
        <section class="settings-group">
          <div class="group-label">VEHICULE</div>
          <div class="glass-card-group">
            <div class="vehicle-list">
              @for (vehicle of savedPlates; track vehicle.id) {
                <div class="vehicle-row">
                  <div class="plate-box">
                    <span class="ro-flag">RO</span>
                    <span class="plate-num">{{ vehicle.plateNumber }}</span>
                  </div>
                  <button class="icon-btn-danger" (click)="removePlate(vehicle)">
                    <span class="material-icons">delete_outline</span>
                  </button>
                </div>
              }
              
              <div class="add-vehicle-row" [class.active]="showAddPlate">
                @if (showAddPlate) {
                  <input type="text" [(ngModel)]="newPlate" (ngModelChange)="newPlate = $event.toUpperCase()" placeholder="BV 01 ABC" class="plate-input">
                  <button class="save-plate-btn" (click)="addPlate()">SALVEAZĂ</button>
                } @else {
                  <button class="add-trigger-btn" (click)="showAddPlate = true">
                    <span class="material-icons">add</span>
                    <span>Adaugă vehicul nou</span>
                  </button>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- APP PREFERENCES -->
        <section class="settings-group">
          <div class="group-label">PREFERINȚE</div>
          <div class="glass-card-group">
            <div class="setting-item">
              <div class="item-info">
                <span class="item-title">Mod Întunecat</span>
                <span class="item-sub">Mai bine pentru ecrane OLED</span>
              </div>
              <div class="toggle-wrapper">
                <input type="checkbox" id="darkMode" [(ngModel)]="darkMode" (change)="toggleTheme()" class="ios-toggle">
                <label for="darkMode"></label>
              </div>
            </div>
            <div class="divider"></div>
            <div class="setting-item">
              <div class="item-info">
                <span class="item-title">Limbă</span>
                <span class="item-sub">Română (Implicit)</span>
              </div>
            </div>
          </div>
        </section>

        <!-- SECURITY SECTION -->
        <section class="settings-group">
          <div class="group-label">SECURITATE</div>
          <div class="glass-card-group">
            <button class="setting-item clickable" (click)="resetPassword()">
              <div class="item-info">
                <span class="item-title">Resetează Parola</span>
                <span class="item-sub">Trimite un link pe email</span>
              </div>
              <span class="material-icons chevron">chevron_right</span>
            </button>
          </div>
        </section>

        <!-- DANGER ZONE -->
        <section class="settings-group">
          <div class="group-label">CONT</div>
          <div class="glass-card-group danger">
            <button class="danger-row" (click)="clearHistory()">
              <span class="material-icons">history</span>
              <span>Șterge Istoric Parcare</span>
            </button>
            <div class="divider"></div>
            <button class="danger-row logout" (click)="logout()">
              <span class="material-icons">logout</span>
              <span>Deconectare</span>
            </button>
          </div>
        </section>

        <div class="version-info">
          Brașov Smart City PWA • v1.5.0 (Final)
        </div>
      </div>

      <!-- TOAST NOTIFICATION -->
      @if (toastMessage) {
        <div class="toast-card">
          <span class="material-icons">info</span>
          <span>{{ toastMessage }}</span>
        </div>
      }
    </main>
  `,
  styles: [`
    .settings-shell { height: 100dvh; background: var(--bg-primary); font-family: 'Outfit', sans-serif; position: relative; overflow: hidden; color: var(--text-primary); transition: background 0.3s; }
    .background-glow { position: absolute; top: -10%; left: -10%; width: 50%; height: 50%; background: radial-gradient(circle, rgba(66, 133, 244, 0.08) 0%, transparent 70%); z-index: 1; pointer-events: none; }
    
    .settings-nav { height: 70px; display: flex; align-items: center; padding: 0 1.25rem; position: relative; z-index: 10; border-bottom: 1px solid var(--border-color); background: var(--glass-bg); backdrop-filter: blur(10px); }
    .minimal-back-btn { background: none; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-primary); cursor: pointer; transition: background 0.2s; }
    .minimal-back-btn:active { background: rgba(0,0,0,0.05); }
    .page-title { font-size: 1.25rem; font-weight: 800; margin: 0; flex: 1; text-align: center; margin-right: 40px; letter-spacing: -0.02em; }
    
    .scroll-container { height: calc(100dvh - 70px); overflow-y: auto; padding: 1.5rem 1.25rem 3rem; position: relative; z-index: 5; scrollbar-width: none; }
    .scroll-container::-webkit-scrollbar { display: none; }

    .profile-hero { margin-bottom: 2.5rem; }
    .glass-profile-card { background: var(--bg-card); border-radius: 32px; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; box-shadow: 0 20px 50px rgba(0,0,0,0.04); border: 1px solid var(--border-color); }
    .avatar-container { position: relative; }
    .avatar { width: 100px; height: 100px; border-radius: 32px; background: var(--bg-secondary); border: 4px solid var(--bg-card); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .edit-avatar-btn { position: absolute; bottom: -5px; right: -5px; width: 36px; height: 36px; border-radius: 12px; background: #1a1a1a; color: #fff; border: 2px solid var(--bg-card); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
    
    .user-meta { text-align: center; }
    .user-meta h2 { font-size: 1.5rem; font-weight: 900; margin: 0; }
    .user-meta p { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin: 0.25rem 0 0; }

    .settings-group { margin-bottom: 2rem; }
    .group-label { font-size: 0.75rem; font-weight: 900; color: var(--text-secondary); letter-spacing: 0.12em; margin: 0 0 0.75rem 1rem; }
    .glass-card-group { background: var(--bg-card); border-radius: 28px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.03); overflow: hidden; }
    
    .setting-item { padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: none; border: none; width: 100%; text-align: left; }
    .setting-item.clickable:active { background: rgba(0,0,0,0.02); }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-title { font-weight: 800; font-size: 1rem; color: var(--text-primary); }
    .item-sub { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-top: 0.15rem; }
    .divider { height: 1px; background: var(--border-color); margin: 0 1.5rem; }

    .vehicle-list { display: flex; flex-direction: column; }
    .vehicle-row { padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); }
    .plate-box { background: var(--bg-secondary); border: 1.5px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; padding: 4px; gap: 8px; }
    .ro-flag { background: #002B7F; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 2px 4px; border-radius: 2px; }
    .plate-num { font-weight: 900; font-size: 1.1rem; padding-right: 8px; color: var(--text-primary); }
    
    .add-vehicle-row { padding: 0.75rem 1.5rem; }
    .add-vehicle-row.active { display: flex; align-items: center; }
    .add-trigger-btn { background: none; border: none; display: flex; align-items: center; gap: 0.75rem; color: #4285F4; font-weight: 800; cursor: pointer; width: 100%; padding: 0.5rem 0; }
    .plate-input { flex: 1; border: 2px solid var(--border-color); border-radius: 12px; padding: 0.75rem 1rem; outline: none; font-weight: 900; font-size: 1rem; margin-right: 0.75rem; background: var(--bg-secondary); color: var(--text-primary); }
    .save-plate-btn { background: var(--text-primary); color: var(--bg-primary); border: none; border-radius: 12px; padding: 0.75rem 1.5rem; font-weight: 900; cursor: pointer; }

    .ios-toggle { display: none; }
    .ios-toggle + label { display: block; width: 50px; height: 28px; background: #e0e0e0; border-radius: 999px; position: relative; cursor: pointer; transition: background 0.3s; }
    .ios-toggle + label::after { content: ''; position: absolute; top: 2px; left: 2px; width: 24px; height: 24px; background: #fff; border-radius: 50%; transition: transform 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .ios-toggle:checked + label { background: #34a853; }
    .ios-toggle:checked + label::after { transform: translateX(22px); }

    .minimal-select-btn { background: var(--bg-secondary); border: none; padding: 0.6rem 1rem; border-radius: 12px; font-weight: 800; font-size: 0.85rem; color: var(--text-primary); cursor: pointer; }
    
    .danger-row { width: 100%; background: none; border: none; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; font-weight: 800; font-size: 1rem; color: #ea4335; cursor: pointer; text-align: left; }
    .danger-row.logout { color: var(--text-secondary); }
    .danger-row:active { background: rgba(0,0,0,0.02); }

    .toast-card { position: fixed; bottom: 10%; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: #fff; padding: 1rem 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 0.9rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 2000; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

    .version-info { text-align: center; color: var(--text-secondary); font-size: 0.75rem; font-weight: 700; margin-top: 1rem; }
    .chevron { color: var(--text-secondary); font-size: 1.2rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  userName = '';
  userEmail = '';
  avatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User';
  savedPlates: { id: number; plateNumber: string }[] = [];
  showAddPlate = false;
  newPlate = '';
  
  darkMode = false;
  toastMessage = '';

  constructor(private cdr: ChangeDetectorRef, private router: Router) {
    afterNextRender(() => {
      this.loadSettings();
      this.loadUserProfile();
      this.applyTheme();
      this.animateEntrance();
    });
  }

  ngOnInit() {}

  private loadSettings() {
    // Load Theme
    this.darkMode = localStorage.getItem('theme_dark') === 'true';
    this.cdr.detectChanges();
  }

  private animateEntrance() {
    gsap.from('.glass-profile-card', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.settings-group', { y: 50, opacity: 0, stagger: 0.1, duration: 0.8, delay: 0.2, ease: 'power3.out' });
  }

  async addPlate() {
    const plateNumber = this.newPlate.trim().toUpperCase();
    if (!plateNumber || this.savedPlates.some(v => v.plateNumber === plateNumber)) {
      return;
    }

    const profile = await this.userService.addVehicle(plateNumber);
    if (profile?.vehicles) {
      this.savedPlates = profile.vehicles.map(v => ({ id: v.id, plateNumber: v.plateNumber }));
      this.newPlate = '';
      this.showAddPlate = false;
      this.cdr.detectChanges();
    } else {
      this.showToast('Eroare la salvarea vehiculului.');
    }
  }

  async removePlate(vehicle: { id: number; plateNumber: string }) {
    const result = await this.userService.removeVehicle(vehicle.id);
    if (result?.vehicles) {
      this.savedPlates = result.vehicles.map(v => ({ id: v.id, plateNumber: v.plateNumber }));
    } else {
      this.savedPlates = this.savedPlates.filter(v => v.id !== vehicle.id);
    }
    this.cdr.detectChanges();
  }

  toggleTheme() {
    localStorage.setItem('theme_dark', this.darkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.darkMode);
  }

  private loadUserProfile() {
    const profile = this.userService.profile();
    if (profile) {
      this.userName = profile.fullName;
      this.userEmail = profile.email;
      this.avatarUrl = this.userService.getImageUrl(profile.profilePictureUrl);
      if (profile.vehicles) {
        this.savedPlates = profile.vehicles.map(v => ({ id: v.id, plateNumber: v.plateNumber }));
      }
      this.cdr.detectChanges();
    } else {
      // Fallback to session storage
      this.userName = this.authService.getUserName() || 'Utilizator';
      this.cdr.detectChanges();
    }
  }

  resetPassword() {
    if (!this.userEmail) {
      this.showToast('Nu s-a putut determina adresa de email.');
      return;
    }
    this.authService.forgotPassword(this.userEmail).subscribe({
      next: () => this.showToast('Link-ul de resetare a fost trimis pe email.'),
      error: () => this.showToast('Eroare la trimiterea link-ului de resetare.')
    });
  }

  triggerAvatarUpload() {
    const input = document.getElementById('avatarInput') as HTMLInputElement;
    if (input) input.click();
  }

  async onAvatarSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const updated = await this.userService.uploadProfilePicture(file);
      if (updated?.profilePictureUrl) {
        this.avatarUrl = this.userService.getImageUrl(updated.profilePictureUrl);
        this.cdr.detectChanges();
      }
      this.showToast('Fotografia de profil a fost actualizată.');
    } catch {
      this.showToast('Eroare la încărcarea fotografiei.');
    }
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  clearHistory() {
    if (confirm('Ștergi tot istoricul de parcare?')) {
      localStorage.removeItem('parking_history');
      this.showToast('Istoric șters.');
    }
  }

  logout() {
    if (confirm('Sigur vrei să te deconectezi?')) {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => this.router.navigate(['/login'])
      });
    }
  }
}
