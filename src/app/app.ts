import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  constructor() {
    if (typeof localStorage !== 'undefined') {
      const isDark = localStorage.getItem('theme_dark') === 'true';
      document.body.classList.toggle('dark-theme', isDark);
    }
  }
}
