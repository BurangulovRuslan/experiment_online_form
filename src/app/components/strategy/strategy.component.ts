import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExperimentService, ConditionType } from '../../services/experiment.service';

@Component({
  selector: 'app-strategy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <div class="card">
        <div class="pill">Рефлексия после блока</div>
        <h1>Подробно опишите, какие стратегии вы использовали для поиска информации</h1>
        <p class="subtitle">{{ conditionTitle }}</p>
        <p class="intro">
          Опишите, как именно вы искали ответы: какие запросы формулировали, как проверяли источники,
          как выбирали релевантную информацию и как принимали решение о финальном ответе.
        </p>

        <section class="section">
          <h2>Насколько вы уверены в найденных ответах?</h2>
          <label class="radio-card" *ngFor="let option of confidenceOptions">
            <input type="radio" name="confidence" [value]="option.value" [(ngModel)]="confidence" />
            <div>
              <strong>{{ option.label }}</strong>
              <span>{{ option.hint }}</span>
            </div>
          </label>
        </section>

        <section class="section">
          <h2>Описание стратегии</h2>
          <textarea
            [(ngModel)]="strategy"
            rows="8"
            placeholder="Например: сначала выделял ключевые слова, затем уточнял запросы, сравнивал несколько источников, перепроверял факты, выбирал наиболее точный ответ..."
          ></textarea>
        </section>

        <button class="primary-button" (click)="submit()" [disabled]="!isComplete()">Продолжить</button>
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
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    }
    .card {
      width: min(920px, 100%);
      background: rgba(255,255,255,0.95);
      border-radius: 30px;
      padding: 30px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-shadow: 0 22px 54px rgba(15, 23, 42, 0.09);
    }
    .pill {
      display: inline-flex;
      padding: 8px 12px;
      border-radius: 999px;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 18px;
    }
    h1, h2 { margin: 0; }
    .subtitle { margin: 8px 0 8px; color: #334155; font-size: 18px; font-weight: 700; }
    .intro { margin: 0; color: #475569; line-height: 1.72; }
    .section { margin-top: 24px; }
    .section h2 { margin-bottom: 14px; font-size: 22px; }
    .radio-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 18px;
      border-radius: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      margin-bottom: 10px;
      cursor: pointer;
    }
    .radio-card input { margin-top: 4px; }
    .radio-card div { display: grid; gap: 4px; }
    .radio-card span { color: #64748b; line-height: 1.5; }
    textarea {
      width: 100%;
      resize: vertical;
      min-height: 220px;
      border: 1.5px solid #cbd5e1;
      border-radius: 20px;
      padding: 18px;
      font: inherit;
      background: #ffffff;
      line-height: 1.65;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    textarea:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.14);
    }
    .primary-button {
      margin-top: 24px;
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
    .primary-button:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
    @media (max-width: 640px) {
      .page-shell { padding: 16px 12px; }
      .card { padding: 22px; border-radius: 22px; }
    }
  `]
})
export class StrategyComponent implements OnInit {
  order = 1;
  conditionType: ConditionType = 'LLM';
  conditionTitle = '';
  confidence = 0;
  strategy = '';

  readonly confidenceOptions = [
    { value: 1, label: 'Совсем не уверен(а)', hint: 'Ответы кажутся случайными или плохо подтверждёнными.' },
    { value: 2, label: 'Скорее не уверен(а)', hint: 'Есть заметные сомнения в корректности значительной части ответов.' },
    { value: 3, label: 'Умеренно уверен(а)', hint: 'Часть ответов выглядит надёжной, но по части остаются сомнения.' },
    { value: 4, label: 'Скорее уверен(а)', hint: 'Большинство ответов кажутся корректными и подтверждёнными.' },
    { value: 5, label: 'Очень уверен(а)', hint: 'Почти все ответы кажутся точными и хорошо проверенными.' }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly expService: ExperimentService
  ) {}

  async ngOnInit(): Promise<void> {
    this.order = Number(this.route.snapshot.queryParams['order']) || 1;
    this.conditionType = this.expService.getConditionByOrder(this.order);
    this.conditionTitle = this.conditionType === 'LLM' ? 'После LLM-блока' : 'После Search-блока';

    await this.expService.logEvent('STRATEGY_PAGE_OPENED', {
      order: this.order,
      condition: this.conditionType
    });
  }

  isComplete(): boolean {
    return this.confidence > 0 && this.strategy.trim().length > 0;
  }

  async submit(): Promise<void> {
    if (!this.isComplete()) {
      return;
    }

    this.expService.saveStrategy(this.conditionType, this.order, this.confidence, this.strategy.trim());

    if (this.order === 1) {
      await this.router.navigate(['/task'], { queryParams: { order: 2 } });
      return;
    }

    await this.expService.finishExperiment();
    await this.router.navigate(['/export']);
  }
}
