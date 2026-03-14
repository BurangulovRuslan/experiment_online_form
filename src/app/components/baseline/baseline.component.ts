import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-baseline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="card">
        <h1>Baseline отключён</h1>
        <p>Эта online-only версия не использует EEG и baseline-этапы.</p>
        <button (click)="goToStart()">Вернуться к началу</button>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: #f1f5f9; }
    .card { background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 28px; text-align: center; }
    button { border: none; border-radius: 10px; background: #2563eb; color: white; padding: 12px 18px; cursor: pointer; }
  `]
})
export class BaselineComponent {
  constructor(private readonly router: Router) {}

  async goToStart(): Promise<void> {
    await this.router.navigate(['/admin']);
  }
}
