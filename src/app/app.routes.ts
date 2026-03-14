import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { TaskComponent } from './components/task/task.component';
import { StageReminderComponent } from './components/stage-reminder/stage-reminder.component';
import { NasaTlxComponent } from './components/nasa-tlx/nasa-tlx.component';
import { StrategyComponent } from './components/strategy/strategy.component';
import { ExportComponent } from './components/export/export.component';

export const routes: Routes = [
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent },
  { path: 'task', component: TaskComponent },
  { path: 'stage-reminder', component: StageReminderComponent },
  { path: 'nasa-tlx', component: NasaTlxComponent },
  { path: 'strategy', component: StrategyComponent },
  { path: 'export', component: ExportComponent },
  { path: '**', redirectTo: '/admin' }
];
