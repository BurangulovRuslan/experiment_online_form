import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExperimentService, ParticipantProfile } from '../../services/experiment.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <div class="content-wrap">
        <header class="hero-card">
          <div class="eyebrow">Online-only protocol</div>
          <h1>Исследование поиска информации</h1>
          <p class="hero-copy">
            Вам предстоят два коротких блока: работа с языковой моделью и обычный браузерный поиск без AI-функций.
            В каждом блоке будет 10 вопросов в виде изображений.
          </p>
        </header>

        <section class="panel">
          <div class="panel-head compact-head">
            <div>
              <h2>Шаг 1. Заполните данные участника</h2>
              <p>После заполнения полей и подтверждения согласия кнопка запуска станет активной.</p>
            </div>
            <span class="chip">Порядок блоков назначается автоматически</span>
          </div>

          <div class="form-grid">
            <label>
              <span>ID участника</span>
              <input
                [(ngModel)]="participant.participantId"
                placeholder="Введите имя, никнейм или любой идентификатор"
                autocomplete="off"
              />
            </label>

            <label>
              <span>Возраст</span>
              <input
                [(ngModel)]="participant.age"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                placeholder="Сколько полных лет"
                autocomplete="off"
              />
            </label>

            <label>
              <span>Пол</span>
              <select [(ngModel)]="participant.gender">
                <option value="" disabled>Выберите вариант</option>
                <option value="Мужской">Мужской</option>
                <option value="Женский">Женский</option>
              </select>
            </label>

            <label>
              <span>Образование</span>
              <select [(ngModel)]="participant.education">
                <option value="" disabled>Выберите уровень образования</option>
                <option *ngFor="let option of educationOptions" [value]="option">{{ option }}</option>
              </select>
            </label>
          </div>

          <label class="consent-box">
            <input type="checkbox" [(ngModel)]="participant.consentAccepted" />
            <span>
              Я подтверждаю добровольное участие и обязуюсь соблюдать правила блоков LLM и Search.
            </span>
          </label>
        </section>

        <section class="panel instructions-panel">
          <h2>Шаг 2. Что важно помнить</h2>

          <div class="steps-list">
            <article class="step-card">
              <div class="step-number">1</div>
              <div>
                <h3>Два этапа</h3>
                <p>Сначала или блок с LLM, или блок с обычным поиском. Порядок определяется случайно.</p>
              </div>
            </article>

            <article class="step-card">
              <div class="step-number">2</div>
              <div>
                <h3>Во время Search</h3>
                <p>Используйте только обычную поисковую выдачу. Не применяйте AI-ответы, чат-панели и встроенных ассистентов браузера.</p>
              </div>
            </article>

            <article class="step-card">
              <div class="step-number">3</div>
              <div>
                <h3>После каждого блока</h3>
                <p>Сохраните материалы блока и затем отправьте их экспериментатору: лог диалога с LLM или историю поиска, а также итоговый Excel-файл.</p>
              </div>
            </article>
          </div>

          <div class="highlight-box">
            <h3>Куда отправить материалы</h3>
            <p><strong>Telegram:</strong> @burangulovbiz<br><strong>Электронная почта:</strong> burangulovbiz@gmail.com</p>
            <p class="supporting-text">Рекомендуется проходить эксперимент в отдельном браузерном профиле или отдельной сессии.</p>
          </div>
        </section>

        <div class="actions-block">
          <div class="status-line" [class.ready]="canStart()">
            {{ canStart() ? 'Все обязательные поля заполнены. Можно начинать.' : 'Заполните все поля и отметьте согласие на участие.' }}
          </div>
          <button class="primary-button" type="button" (click)="start()" [disabled]="!canStart()">Начать эксперимент</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-shell {
      min-height: 100vh;
      padding: 36px 18px 52px;
      background:
        radial-gradient(circle at top left, rgba(79, 70, 229, 0.14), transparent 30%),
        radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 24%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    }
    .content-wrap { max-width: 960px; margin: 0 auto; }
    .hero-card, .panel {
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(148, 163, 184, 0.16);
      border-radius: 24px;
      box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
      padding: 28px;
      margin-bottom: 18px;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 999px;
      background: #e0e7ff;
      color: #4338ca;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    h1 { margin: 0 0 12px; font-size: clamp(30px, 4vw, 42px); line-height: 1.08; }
    h2 { margin: 0 0 8px; font-size: 24px; }
    h3 { margin: 0 0 8px; font-size: 18px; }
    .hero-copy, .panel-head p, .step-card p, .highlight-box p {
      margin: 0;
      color: #475569;
      line-height: 1.62;
      font-size: 17px;
    }
    .compact-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
    }
    .chip {
      background: #ecfeff;
      color: #0f766e;
      padding: 9px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-top: 8px;
    }
    label { display: flex; flex-direction: column; gap: 8px; font-weight: 600; color: #0f172a; }
    input, select {
      width: 100%;
      border: 1.5px solid #cbd5e1;
      border-radius: 14px;
      padding: 14px 15px;
      background: #ffffff;
      font: inherit;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.14);
    }
    .consent-box {
      margin-top: 18px;
      flex-direction: row;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
      border-radius: 18px;
      background: #f8fafc;
      font-weight: 500;
      line-height: 1.6;
    }
    .consent-box input { width: 18px; height: 18px; margin-top: 2px; }
    .instructions-panel { display: grid; gap: 18px; }
    .steps-list { display: grid; gap: 12px; }
    .step-card {
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 14px;
      align-items: start;
      padding: 18px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    }
    .step-number {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #eef2ff;
      color: #4338ca;
      font-weight: 800;
      font-size: 18px;
    }
    .highlight-box {
      padding: 20px;
      border-radius: 20px;
      border: 1px solid #dbeafe;
      background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
    }
    .supporting-text { margin-top: 8px; font-size: 15px; }
    .actions-block {
      display: grid;
      gap: 14px;
      justify-items: center;
      margin-top: 26px;
    }
    .status-line {
      width: min(680px, 100%);
      padding: 14px 16px;
      border-radius: 16px;
      background: #fff7ed;
      color: #9a3412;
      text-align: center;
      font-weight: 600;
      border: 1px solid #fed7aa;
    }
    .status-line.ready {
      background: #ecfdf5;
      color: #166534;
      border-color: #bbf7d0;
    }
    .primary-button {
      min-width: 280px;
      border: none;
      border-radius: 16px;
      padding: 16px 24px;
      font: inherit;
      font-size: 18px;
      font-weight: 800;
      color: white;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
      box-shadow: 0 16px 30px rgba(79, 70, 229, 0.28);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .primary-button:hover:not(:disabled) { transform: translateY(-1px); }
    .primary-button:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
    @media (max-width: 820px) {
      .form-grid { grid-template-columns: 1fr; }
      .compact-head { flex-direction: column; }
      .chip { white-space: normal; }
    }
    @media (max-width: 640px) {
      .page-shell { padding: 18px 12px 36px; }
      .hero-card, .panel { padding: 22px; border-radius: 20px; }
      .hero-copy, .panel-head p, .step-card p, .highlight-box p { font-size: 16px; }
      .step-card { grid-template-columns: 40px 1fr; padding: 16px; }
      .step-number { width: 40px; height: 40px; font-size: 16px; }
      .primary-button { width: 100%; min-width: 0; }
    }
  `]
})
export class AdminComponent {
  participant: ParticipantProfile = {
    participantId: '',
    age: '',
    gender: '',
    education: '',
    consentAccepted: false
  };

  readonly educationOptions = [
    'Среднее общее',
    'Среднее профессиональное',
    'Неоконченное высшее',
    'Высшее',
    'Магистратура / специалитет',
    'Кандидат наук'
  ];

  constructor(
    private readonly expService: ExperimentService,
    private readonly router: Router
  ) {}

  private normalizedText(value: unknown): string {
    return String(value ?? '').trim();
  }

  canStart(): boolean {
    return this.normalizedText(this.participant.participantId).length > 0
      && this.normalizedText(this.participant.age).length > 0
      && this.normalizedText(this.participant.gender).length > 0
      && this.normalizedText(this.participant.education).length > 0
      && this.participant.consentAccepted;
  }

  async start(): Promise<void> {
    if (!this.canStart()) {
      alert('Пожалуйста, заполните все поля и подтвердите согласие на участие.');
      return;
    }

    await this.expService.startSession({
      ...this.participant,
      participantId: this.normalizedText(this.participant.participantId),
      age: this.normalizedText(this.participant.age)
    });
    await this.expService.logEvent('INSTRUCTIONS_CONFIRMED', {
      participantId: this.normalizedText(this.participant.participantId),
      assignedCondition: this.expService.getConfig().conditionLabel
    });

    await this.router.navigate(['/task'], { queryParams: { order: 1 } });
  }
}
