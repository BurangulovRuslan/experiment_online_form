import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperimentService } from '../../services/experiment.service';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-shell">
      <div class="card">
        <div class="success-icon">✓</div>
        <h1>Эксперимент завершён</h1>
        <p class="subtitle">
          Сначала скачайте локальные результаты, затем отправьте экспериментатору весь пакет материалов.
        </p>

        <div class="stats-grid">
          <div class="stat-card">
            <strong>{{ stats.totalAnswers }}</strong>
            <span>ответов</span>
          </div>
          <div class="stat-card">
            <strong>{{ stats.correctAnswers }}</strong>
            <span>правильных</span>
          </div>
          <div class="stat-card">
            <strong>{{ stats.averageResponseTime }}</strong>
            <span>среднее время, мс</span>
          </div>
        </div>

        <div class="checklist-card">
          <h2>Что нужно отправить</h2>
          <ul>
            <li>XLSX-файл, выгруженный из этого приложения;</li>
            <li>лог / экспорт / скриншоты диалога с LLM за время LLM-блока;</li>
            <li>скриншоты истории поиска за время Search-блока.</li>
          </ul>
        </div>

        <div class="contacts-card">
          <h2>Контакты экспериментатора</h2>
          <div><strong>Telegram:</strong> @burangulovbiz</div>
          <div><strong>Электронная почта:</strong> burangulovbiz@gmail.com</div>
        </div>

        <button class="primary-button" (click)="downloadData()">Скачать результаты (XLSX)</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-shell {
      min-height: 100vh;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 28%),
        linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
    }
    .card {
      width: min(780px, 100%);
      background: rgba(255,255,255,0.95);
      border-radius: 30px;
      padding: 34px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-shadow: 0 24px 56px rgba(15, 23, 42, 0.10);
      text-align: center;
    }
    .success-icon {
      width: 88px;
      height: 88px;
      margin: 0 auto 18px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #dcfce7;
      color: #15803d;
      font-size: 40px;
      font-weight: 900;
    }
    h1, h2 { margin: 0; }
    .subtitle { margin: 12px auto 0; max-width: 620px; color: #475569; line-height: 1.7; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin: 28px 0;
    }
    .stat-card, .checklist-card, .contacts-card {
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      padding: 20px;
    }
    .stat-card strong {
      display: block;
      font-size: 32px;
      color: #2563eb;
      margin-bottom: 6px;
    }
    .checklist-card, .contacts-card { text-align: left; }
    .checklist-card { margin-bottom: 14px; }
    ul { margin: 12px 0 0; padding-left: 22px; line-height: 1.72; color: #334155; }
    .contacts-card { display: grid; gap: 8px; }
    .primary-button {
      margin-top: 22px;
      border: none;
      border-radius: 16px;
      padding: 16px 24px;
      font: inherit;
      font-size: 17px;
      font-weight: 800;
      color: white;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
      box-shadow: 0 16px 30px rgba(79, 70, 229, 0.22);
      cursor: pointer;
    }
    @media (max-width: 720px) {
      .stats-grid { grid-template-columns: 1fr; }
      .card { padding: 24px; border-radius: 22px; }
    }
  `]
})
export class ExportComponent implements OnInit {
  stats = { totalAnswers: 0, correctAnswers: 0, averageResponseTime: 0 };

  constructor(private readonly expService: ExperimentService) {}

  async ngOnInit(): Promise<void> {
    this.stats = this.expService.getStats();
    await this.expService.logEvent('EXPORT_SCREEN_OPENED', {
      participantId: this.expService.participant.participantId
    });
  }

  downloadData(): void {
    this.expService.exportData();
  }
}
