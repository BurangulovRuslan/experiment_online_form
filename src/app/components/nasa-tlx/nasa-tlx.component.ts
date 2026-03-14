import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExperimentService, ConditionType } from '../../services/experiment.service';

interface NasaTlxScale {
  id: string;
  question: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  value: number;
}

@Component({
  selector: 'app-nasa-tlx',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <div class="card">
        <div class="pill">NASA-TLX</div>
        <h1>Оценка субъективной нагрузки</h1>
        <p class="subtitle">{{ conditionTitle }}</p>
        <p class="intro">
          Ниже приведены шесть шкал NASA-TLX. Для каждой шкалы выберите значение от 0 до 100,
          ориентируясь на свои ощущения после только что завершённого блока.
        </p>

        <div class="scale-list">
          <section class="scale-item" *ngFor="let scale of scales">
            <div class="scale-head">
              <div>
                <h2>{{ scale.question }}</h2>
                <p>{{ scale.description }}</p>
              </div>
              <div class="value-chip">{{ scale.value }}</div>
            </div>
            <div class="scale-labels">
              <span>{{ scale.lowLabel }}</span>
              <span>{{ scale.highLabel }}</span>
            </div>
            <input type="range" min="0" max="100" step="5" [(ngModel)]="scale.value" />
          </section>
        </div>

        <div class="footer-note">
          После отправки NASA-TLX откроется отдельная страница, где нужно будет описать стратегии поиска информации.
        </div>

        <button class="primary-button" (click)="submit()">Продолжить</button>
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
      background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
    }
    .card {
      width: min(960px, 100%);
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
      background: #e0e7ff;
      color: #4338ca;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 18px;
    }
    h1 { margin: 0 0 8px; }
    .subtitle { margin: 0 0 8px; color: #334155; font-size: 18px; font-weight: 700; }
    .intro, .footer-note { margin: 0; color: #475569; line-height: 1.7; }
    .scale-list { display: grid; gap: 16px; margin: 24px 0; }
    .scale-item {
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      padding: 22px;
    }
    .scale-head {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: flex-start;
    }
    h2 { margin: 0 0 6px; font-size: 20px; }
    .scale-head p { margin: 0; color: #64748b; line-height: 1.6; }
    .value-chip {
      min-width: 58px;
      text-align: center;
      padding: 10px 12px;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      font-weight: 800;
      color: #0f172a;
    }
    .scale-labels {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      margin: 16px 0 10px;
      color: #64748b;
      font-size: 14px;
    }
    input[type="range"] { width: 100%; }
    .footer-note {
      padding: 16px 18px;
      border-radius: 18px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }
    .primary-button {
      margin-top: 22px;
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
      .card { padding: 22px; border-radius: 22px; }
      .scale-head { flex-direction: column; }
      .value-chip { min-width: 0; }
    }
  `]
})
export class NasaTlxComponent implements OnInit {
  order = 1;
  conditionType: ConditionType = 'LLM';
  conditionTitle = '';

  scales: NasaTlxScale[] = [
    {
      id: 'mental',
      question: 'Умственная нагрузка',
      description: 'Насколько интенсивной была мыслительная работа, анализ и удержание информации?',
      lowLabel: 'Очень низкая',
      highLabel: 'Очень высокая',
      value: 50
    },
    {
      id: 'physical',
      question: 'Физическая нагрузка',
      description: 'Насколько выраженным было физическое напряжение, включая усталость от позы, рук и глаз?',
      lowLabel: 'Очень низкая',
      highLabel: 'Очень высокая',
      value: 10
    },
    {
      id: 'temporal',
      question: 'Временная нагрузка',
      description: 'Насколько вы ощущали дефицит времени, спешку или давление по темпу выполнения?',
      lowLabel: 'Совсем не ощущал(а)',
      highLabel: 'Очень сильно ощущал(а)',
      value: 50
    },
    {
      id: 'performance',
      question: 'Оценка успешности выполнения',
      description: 'Насколько, по вашему ощущению, выполнение было неуспешным?',
      lowLabel: 'Очень успешно',
      highLabel: 'Очень неуспешно',
      value: 50
    },
    {
      id: 'effort',
      question: 'Усилие',
      description: 'Сколько усилий вам пришлось приложить, чтобы добиться результата?',
      lowLabel: 'Очень мало',
      highLabel: 'Очень много',
      value: 50
    },
    {
      id: 'frustration',
      question: 'Фрустрация / стресс',
      description: 'Насколько вы чувствовали напряжение, раздражение, стресс или неудовлетворённость?',
      lowLabel: 'Очень низкие',
      highLabel: 'Очень высокие',
      value: 50
    }
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

    await this.expService.logEvent('NASA_TLX_STARTED', {
      order: this.order,
      condition: this.conditionType
    });
  }

  async submit(): Promise<void> {
    const scales = this.scales.reduce<Record<string, number>>((acc, scale) => {
      acc[scale.id] = scale.value;
      return acc;
    }, {});

    this.expService.saveNasaTlx(this.conditionType, this.order, scales);
    await this.router.navigate(['/strategy'], { queryParams: { order: this.order } });
  }
}
