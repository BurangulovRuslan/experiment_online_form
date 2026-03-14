import { Injectable } from '@angular/core';
import { DATA_SET_A, DATA_SET_B, Question, checkAnswer } from '../data/questions';
import * as XLSX from 'xlsx';

export type ConditionType = 'LLM' | 'SEARCH';
export type CounterbalanceGroup = 1 | 2;

export interface ParticipantProfile {
  participantId: string;
  age: string;
  gender: string;
  education: string;
  consentAccepted: boolean;
}

export interface EventLog {
  timestamp: number;
  readableTime: string;
  event: string;
  details: string;
}

export interface AnswerLog {
  participantId: string;
  stage: ConditionType;
  questionId: string;
  questionText: string;
  inputRaw: string;
  isCorrect: boolean;
  timestampShown: number;
  timestampSubmitted: number;
  responseTimeMs: number;
}

export interface NasaTlxLog {
  participantId: string;
  stage: ConditionType;
  order: number;
  timestamp: number;
  scales: Record<string, number>;
}

export interface StrategyLog {
  participantId: string;
  stage: ConditionType;
  order: number;
  confidence: number;
  strategy: string;
  timestamp: number;
}

interface ExperimentConfig {
  first: ConditionType;
  second: ConditionType;
  set1: Question[];
  set2: Question[];
  conditionLabel: string;
  orderDescription: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {
  participant: ParticipantProfile = {
    participantId: '',
    age: '',
    gender: '',
    education: '',
    consentAccepted: false
  };

  group: CounterbalanceGroup = 1;
  eventLog: EventLog[] = [];
  answersLog: AnswerLog[] = [];
  nasaTlxLog: NasaTlxLog[] = [];
  strategyLog: StrategyLog[] = [];

  private questionShownTime = 0;

  async startSession(participant: ParticipantProfile): Promise<void> {
    this.participant = {
      ...participant,
      participantId: participant.participantId.trim(),
      age: participant.age.trim()
    };
    this.group = Math.random() < 0.5 ? 1 : 2;
    this.eventLog = [];
    this.answersLog = [];
    this.nasaTlxLog = [];
    this.strategyLog = [];

    await this.logEvent('SESSION_START', {
      participantId: this.participant.participantId,
      age: this.participant.age,
      gender: this.participant.gender,
      education: this.participant.education,
      consentAccepted: this.participant.consentAccepted,
      counterbalanceGroup: this.group,
      conditionLabel: this.getConfig().conditionLabel,
      orderDescription: this.getConfig().orderDescription,
      systemTime: new Date().toISOString()
    });
  }

  async logEvent(name: string, details: unknown = {}): Promise<void> {
    this.eventLog.push({
      timestamp: Date.now(),
      readableTime: new Date().toISOString(),
      event: name,
      details: JSON.stringify(details)
    });
  }

  markQuestionShown(questionId: string): void {
    this.questionShownTime = Date.now();
    void this.logEvent('QUESTION_SHOWN', { questionId, timestamp: this.questionShownTime });
  }

  submitAnswer(stage: ConditionType, question: Question, input: string): boolean {
    const submittedTime = Date.now();
    const responseTime = submittedTime - this.questionShownTime;
    const isCorrect = checkAnswer(question, input);

    this.answersLog.push({
      participantId: this.participant.participantId,
      stage,
      questionId: question.id,
      questionText: question.text,
      inputRaw: input,
      isCorrect,
      timestampShown: this.questionShownTime,
      timestampSubmitted: submittedTime,
      responseTimeMs: responseTime
    });

    void this.logEvent('ANSWER_SUBMITTED', {
      stage,
      questionId: question.id,
      correct: isCorrect,
      responseTimeMs: responseTime
    });

    return isCorrect;
  }

  saveNasaTlx(stage: ConditionType, order: number, scales: Record<string, number>): void {
    const payload: NasaTlxLog = {
      participantId: this.participant.participantId,
      stage,
      order,
      timestamp: Date.now(),
      scales
    };

    this.nasaTlxLog.push(payload);
    void this.logEvent('NASA_TLX_SUBMITTED', payload);
  }

  saveStrategy(stage: ConditionType, order: number, confidence: number, strategy: string): void {
    const payload: StrategyLog = {
      participantId: this.participant.participantId,
      stage,
      order,
      confidence,
      strategy,
      timestamp: Date.now()
    };

    this.strategyLog.push(payload);
    void this.logEvent('STRATEGY_SUBMITTED', payload);
  }

  getConfig(): ExperimentConfig {
    const firstTenA = DATA_SET_A.slice(0, 10);
    const firstTenB = DATA_SET_B.slice(0, 10);

    const configs: Record<CounterbalanceGroup, ExperimentConfig> = {
      1: {
        first: 'LLM',
        second: 'SEARCH',
        set1: firstTenA,
        set2: firstTenB,
        conditionLabel: 'Condition 1',
        orderDescription: 'LLM → Search'
      },
      2: {
        first: 'SEARCH',
        second: 'LLM',
        set1: firstTenA,
        set2: firstTenB,
        conditionLabel: 'Condition 2',
        orderDescription: 'Search → LLM'
      }
    };

    return configs[this.group] ?? configs[1];
  }

  getConditionByOrder(order: number): ConditionType {
    const config = this.getConfig();
    return order === 1 ? config.first : config.second;
  }

  getQuestionsByOrder(order: number): Question[] {
    const config = this.getConfig();
    return order === 1 ? [...config.set1] : [...config.set2];
  }

  async finishExperiment(): Promise<void> {
    await this.logEvent('SESSION_END', {
      participantId: this.participant.participantId,
      finishedAt: new Date().toISOString()
    });
  }

  exportData(): void {
    void this.logEvent('EXPORT_INITIATED');

    const config = this.getConfig();
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const summaryData = [{
      ParticipantID: this.participant.participantId,
      Age: this.participant.age,
      Gender: this.participant.gender,
      Education: this.participant.education,
      ConsentAccepted: this.participant.consentAccepted ? 'TRUE' : 'FALSE',
      CounterbalanceGroup: this.group,
      ConditionLabel: config.conditionLabel,
      OrderDescription: config.orderDescription,
      FirstCondition: config.first,
      SecondCondition: config.second,
      QuestionsPlannedPerBlock: 10,
      TotalAnswers: this.answersLog.length,
      CorrectAnswers: this.answersLog.filter((a) => a.isCorrect).length,
      ExportTime: new Date().toISOString()
    }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Summary');

    const answersData = this.answersLog.map((a) => ({
      ParticipantID: a.participantId,
      Stage: a.stage,
      QuestionID: a.questionId,
      QuestionText: a.questionText,
      AnswerText: a.inputRaw,
      IsCorrect: a.isCorrect ? 'TRUE' : 'FALSE',
      ResponseTime_ms: a.responseTimeMs,
      TimestampShown: a.timestampShown,
      TimestampShown_ISO: new Date(a.timestampShown).toISOString(),
      TimestampSubmitted: a.timestampSubmitted,
      TimestampSubmitted_ISO: new Date(a.timestampSubmitted).toISOString()
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(answersData), 'Answers');

    const nasaData = this.nasaTlxLog.map((item) => ({
      ParticipantID: item.participantId,
      Stage: item.stage,
      Order: item.order,
      MentalDemand: item.scales['mental'] ?? '',
      PhysicalDemand: item.scales['physical'] ?? '',
      TemporalDemand: item.scales['temporal'] ?? '',
      Performance: item.scales['performance'] ?? '',
      Effort: item.scales['effort'] ?? '',
      Frustration: item.scales['frustration'] ?? '',
      Timestamp: item.timestamp,
      Timestamp_ISO: new Date(item.timestamp).toISOString()
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nasaData), 'NASA_TLX');

    const strategyData = this.strategyLog.map((item) => ({
      ParticipantID: item.participantId,
      Stage: item.stage,
      Order: item.order,
      Confidence: item.confidence,
      Strategy: item.strategy,
      Timestamp: item.timestamp,
      Timestamp_ISO: new Date(item.timestamp).toISOString()
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(strategyData), 'Strategies');

    const eventsData = this.eventLog.map((e) => ({
      Timestamp: e.timestamp,
      ReadableTime: e.readableTime,
      Event: e.event,
      Details: e.details
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eventsData), 'EventLog');

    const fileName = `participant_${this.participant.participantId || 'unknown'}_${Date.now()}.xlsx`;
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const objectUrl = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);

    void this.logEvent('EXPORT_COMPLETED', { fileName });
  }

  getStats(): { totalAnswers: number; correctAnswers: number; averageResponseTime: number } {
    return {
      totalAnswers: this.answersLog.length,
      correctAnswers: this.answersLog.filter((a) => a.isCorrect).length,
      averageResponseTime: this.answersLog.length > 0
        ? Math.round(this.answersLog.reduce((sum, a) => sum + a.responseTimeMs, 0) / this.answersLog.length)
        : 0
    };
  }
}
