import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExperimentService, ConditionType } from '../../services/experiment.service';
import { Question } from '../../data/questions';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell" *ngIf="showInstruction; else taskTemplate">
      <div class="content-card instruction-card">
        <div class="badge">{{ conditionType === 'LLM' ? 'LLM block' : 'Search block' }}</div>
        <h1>{{ conditionTitle }}</h1>

        <p class="lead" *ngIf="conditionType === 'LLM'">
          В этом блоке используйте только языковую модель для поиска ответов на 10 вопросов.
          Рекомендуемая ссылка:
          <a href="https://chat.deepseek.com/" target="_blank" rel="noopener noreferrer">DeepSeek Chat</a>.
        </p>
        <p class="lead" *ngIf="conditionType === 'SEARCH'">
          В этом блоке используйте только обычный браузерный поиск без AI-функций.
          Не применяйте чат-ответы, AI overview, встроенных ассистентов и сторонние LLM.
        </p>

        <div class="steps-stack">
          <article class="step-row">
            <div class="step-number">1</div>
            <p>На экране будет 10 вопросов. Каждый вопрос показывается как изображение.</p>
          </article>
          <article class="step-row">
            <div class="step-number">2</div>
            <p>Найдите ответ во внешней вкладке и вручную введите его в поле под изображением.</p>
          </article>
          <article class="step-row">
            <div class="step-number">3</div>
            <p>После завершения блока появится напоминание, затем NASA-TLX и отдельная страница с описанием стратегии.</p>
          </article>
        </div>

        <div class="focus-box">
          <strong>{{ conditionType === 'LLM' ? 'Важно: сохраните лог общения с LLM после блока.' : 'Важно: сохраните историю поиска после блока.' }}</strong>
        </div>

        <button class="primary-button" type="button" (click)="startTask()">Начать блок</button>
      </div>
    </div>

    <ng-template #taskTemplate>
      <div class="page-shell">
        <div class="task-layout" *ngIf="currentQuestion; else completedTemplate">
          <header class="task-topbar">
            <div>
              <div class="meta-label">Текущее условие</div>
              <div class="meta-value">{{ conditionType === 'LLM' ? 'LLM' : 'Search' }}</div>
            </div>
            <div>
              <div class="meta-label">Прогресс</div>
              <div class="meta-value">{{ currentIndex + 1 }} / {{ questions.length }}</div>
            </div>
          </header>

          <section class="content-card question-card">
            <div class="image-frame">
              <img
                [src]="'images/' + currentQuestion.img"
                [alt]="'Question ' + currentQuestion.id"
                class="question-image"
                (contextmenu)="$event.preventDefault()"
              />
            </div>

            <div class="answer-card">
              <label class="answer-label">
                <span>Введите ответ</span>
                <input
                  type="text"
                  [(ngModel)]="currentAnswer"
                  (keyup.enter)="nextQuestion()"
                  placeholder="Введите ответ и нажмите «Далее»"
                  autocomplete="off"
                />
              </label>

              <div class="answer-actions">
                <button class="secondary-button" type="button" (click)="clearAnswer()" [disabled]="!currentAnswer.trim()">Очистить</button>
                <button class="primary-button" type="button" (click)="nextQuestion()" [disabled]="!currentAnswer.trim()">
                  {{ isLastQuestion ? 'Завершить блок' : 'Далее' }}
                </button>
              </div>
            </div>
          </section>
        </div>

        <ng-template #completedTemplate>
          <div class="content-card done-card">
            <div class="done-icon">✓</div>
            <h2>Блок завершён</h2>
            <p>Вы ответили на все вопросы этого этапа. Нажмите кнопку ниже, чтобы перейти к напоминанию и следующей части процедуры.</p>
            <button class="primary-button" type="button" (click)="finishTask()">Продолжить</button>
          </div>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    .page-shell {
      min-height: 100vh;
      padding: 24px;
      background:
        radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 26%),
        radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.14), transparent 32%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .task-layout { width: min(1120px, 100%); }
    .content-card {
      width: min(1120px, 100%);
      background: rgba(255,255,255,0.95);
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 28px;
      box-shadow: 0 24px 54px rgba(15, 23, 42, 0.09);
      padding: 30px;
    }
    .instruction-card { display: grid; gap: 20px; max-width: 860px; }
    .badge {
      display: inline-flex;
      width: fit-content;
      padding: 8px 12px;
      border-radius: 999px;
      background: #e0e7ff;
      color: #4338ca;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    h1, h2 { margin: 0; }
    .lead { margin: 0; color: #334155; font-size: 18px; line-height: 1.7; }
    .lead a { color: #4338ca; font-weight: 700; text-decoration: none; }
    .lead a:hover { text-decoration: underline; }
    .steps-stack { display: grid; gap: 12px; }
    .step-row {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: 14px;
      align-items: start;
      margin: 0;
      padding: 16px 18px;
      border-radius: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .step-row p { margin: 0; color: #334155; line-height: 1.65; font-size: 17px; }
    .step-number {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: #eef2ff;
      color: #4338ca;
      font-weight: 800;
      font-size: 18px;
    }
    .focus-box {
      padding: 18px 20px;
      border-radius: 18px;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      color: #1e3a8a;
      line-height: 1.6;
    }
    .task-topbar {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .task-topbar > div {
      background: rgba(255,255,255,0.82);
      border-radius: 22px;
      padding: 18px 20px;
      border: 1px solid rgba(148, 163, 184, 0.16);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
    }
    .meta-label { color: #64748b; font-size: 14px; margin-bottom: 6px; }
    .meta-value { font-size: 22px; font-weight: 800; color: #0f172a; }
    .question-card { display: grid; gap: 24px; }
    .image-frame {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      min-height: 320px;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .question-image {
      max-width: 100%;
      max-height: 62vh;
      width: auto;
      border-radius: 18px;
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
      user-select: none;
      pointer-events: none;
    }
    .answer-card {
      border-radius: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 22px;
    }
    .answer-label {
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #0f172a;
      font-weight: 700;
    }
    input {
      width: 100%;
      border: 1.5px solid #cbd5e1;
      border-radius: 16px;
      padding: 15px 16px;
      font: inherit;
      background: #ffffff;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.14);
    }
    .answer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 18px;
    }
    .primary-button, .secondary-button {
      border: none;
      border-radius: 16px;
      padding: 14px 22px;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .primary-button {
      color: white;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
      box-shadow: 0 16px 30px rgba(79, 70, 229, 0.22);
    }
    .secondary-button {
      background: #e2e8f0;
      color: #1e293b;
    }
    .primary-button:hover:not(:disabled), .secondary-button:hover:not(:disabled) { transform: translateY(-1px); }
    .primary-button:disabled, .secondary-button:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
    .done-card {
      text-align: center;
      display: grid;
      gap: 14px;
      justify-items: center;
      max-width: 760px;
    }
    .done-icon {
      width: 84px;
      height: 84px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #dcfce7;
      color: #15803d;
      font-size: 36px;
      font-weight: 900;
    }
    .done-card p { margin: 0; max-width: 620px; color: #475569; line-height: 1.65; }
    @media (max-width: 820px) {
      .task-topbar { grid-template-columns: 1fr; }
      .answer-actions { flex-direction: column-reverse; }
      .primary-button, .secondary-button { width: 100%; }
    }
    @media (max-width: 640px) {
      .page-shell { padding: 16px 12px; }
      .content-card { padding: 22px; border-radius: 22px; }
      .lead, .step-row p { font-size: 16px; }
      .image-frame { padding: 14px; min-height: 240px; }
      .step-row { grid-template-columns: 38px 1fr; padding: 14px; }
      .step-number { width: 38px; height: 38px; font-size: 16px; }
    }
  `]
})
export class TaskComponent implements OnInit {
  order = 1;
  conditionType: ConditionType = 'LLM';
  conditionTitle = '';
  questions: Question[] = [];
  currentIndex = 0;
  currentAnswer = '';
  showInstruction = true;
  private finishTriggered = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly expService: ExperimentService
  ) {}

  ngOnInit(): void {
    this.order = Number(this.route.snapshot.queryParams['order']) || 1;
    this.conditionType = this.expService.getConditionByOrder(this.order);
    this.questions = this.expService.getQuestionsByOrder(this.order);

    this.conditionTitle = this.conditionType === 'LLM'
      ? `Блок ${this.order}: работа с LLM`
      : `Блок ${this.order}: обычный браузерный поиск`;
  }

  get currentQuestion(): Question | undefined {
    return this.questions[this.currentIndex];
  }

  get isLastQuestion(): boolean {
    return this.currentIndex === this.questions.length - 1;
  }

  async startTask(): Promise<void> {
    this.showInstruction = false;
    await this.expService.logEvent('TASK_BLOCK_STARTED', {
      order: this.order,
      condition: this.conditionType,
      questionsCount: this.questions.length
    });

    if (this.currentQuestion) {
      this.expService.markQuestionShown(this.currentQuestion.id);
    }
  }

  clearAnswer(): void {
    this.currentAnswer = '';
  }

  nextQuestion(): void {
    if (!this.currentQuestion || !this.currentAnswer.trim()) {
      return;
    }

    this.expService.submitAnswer(this.conditionType, this.currentQuestion, this.currentAnswer.trim());
    this.currentAnswer = '';
    this.currentIndex += 1;

    if (this.currentQuestion) {
      this.expService.markQuestionShown(this.currentQuestion.id);
      return;
    }

    void this.expService.logEvent('TASK_QUESTIONS_COMPLETED', {
      order: this.order,
      condition: this.conditionType,
      answered: this.currentIndex
    });
  }

  async finishTask(): Promise<void> {
    if (this.finishTriggered) {
      return;
    }

    this.finishTriggered = true;
    await this.expService.logEvent('TASK_BLOCK_FINISHED', {
      order: this.order,
      condition: this.conditionType,
      answered: this.currentIndex,
      planned: this.questions.length
    });

    await this.router.navigate(['/stage-reminder'], { queryParams: { order: this.order } });
  }
}
