import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExperimentService, ConditionType } from '../../services/experiment.service';

@Component({
  selector: 'app-stage-reminder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-shell">
      <div class="card">
        <div class="icon">📌</div>
        <div class="pill">Напоминание после этапа</div>
        <h1>{{ heading }}</h1>
        <p class="lead">{{ message }}</p>

        <div class="reminder-box" *ngIf="conditionType === 'LLM'">
          <h2>Что нужно зафиксировать сейчас</h2>
          <ul>
            <li>Пожалуйста, зафиксируйте лог общения с LLM в текстовом файле, экспортируйте его или сделайте скриншоты.</li>
            <li>Убедитесь, что материалы относятся только к текущему LLM-блоку.</li>
            <li>Сохраните их, чтобы затем отправить экспериментатору вместе с XLSX-файлом.</li>
          </ul>
        </div>

        <div class="reminder-box" *ngIf="conditionType === 'SEARCH'">
          <h2>Что нужно зафиксировать сейчас</h2>
          <ul>
            <li>Пожалуйста, сохраните историю поиска за время прохождения этого блока.</li>
            <li>Сделайте скриншоты истории поиска или другого журнала запросов, если он доступен.</li>
            <li>Убедитесь, что материалы относятся только к текущему Search-блоку.</li>
          </ul>
        </div>

        <div class="contacts-box">
          <h2>Контакты экспериментатора</h2>
          <div><strong>Telegram:</strong> @burangulovbiz</div>
          <div><strong>Электронная почта:</strong> burangulovbiz@gmail.com</div>
        </div>

        <button class="primary-button" (click)="continue()">Перейти к NASA-TLX</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-shell {
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
    }
    .card {
      width: min(780px, 100%);
      background: rgba(255,255,255,0.94);
      border-radius: 30px;
      padding: 34px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-shadow: 0 24px 56px rgba(15, 23, 42, 0.10);
      display: grid;
      gap: 18px;
    }
    .icon {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #e0e7ff;
      font-size: 34px;
    }
    .pill {
      width: fit-content;
      padding: 8px 12px;
      border-radius: 999px;
      background: #f5f3ff;
      color: #6d28d9;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    h1, h2 { margin: 0; }
    .lead { margin: 0; color: #475569; font-size: 18px; line-height: 1.7; }
    .reminder-box, .contacts-box {
      border-radius: 24px;
      padding: 22px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    ul { margin: 10px 0 0; padding-left: 22px; line-height: 1.72; color: #334155; }
    .contacts-box { display: grid; gap: 8px; }
    .primary-button {
      justify-self: start;
      border: none;
      border-radius: 16px;
      padding: 15px 22px;
      font: inherit;
      font-weight: 800;
      color: white;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
      box-shadow: 0 16px 30px rgba(79, 70, 229, 0.22);
      cursor: pointer;
    }
    @media (max-width: 640px) {
      .page-shell { padding: 16px 12px; }
      .card { padding: 24px; border-radius: 22px; }
      .lead { font-size: 16px; }
      .primary-button { width: 100%; justify-self: stretch; }
    }
  `]
})
export class StageReminderComponent implements OnInit {
  order = 1;
  conditionType: ConditionType = 'LLM';
  heading = '';
  message = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly expService: ExperimentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.order = Number(this.route.snapshot.queryParams['order']) || 1;
    this.conditionType = this.expService.getConditionByOrder(this.order);
    this.heading = this.conditionType === 'LLM'
      ? 'LLM-блок завершён'
      : 'Search-блок завершён';
    this.message = this.conditionType === 'LLM'
      ? 'Перед переходом дальше сохраните лог взаимодействия с языковой моделью и подготовьте его для отправки экспериментатору.'
      : 'Перед переходом дальше сохраните историю поисковых запросов и подготовьте её для отправки экспериментатору.';

    await this.expService.logEvent('STAGE_REMINDER_OPENED', {
      order: this.order,
      condition: this.conditionType
    });
  }

  async continue(): Promise<void> {
    await this.router.navigate(['/nasa-tlx'], { queryParams: { order: this.order } });
  }
}
