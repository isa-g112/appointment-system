import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { HistoryComponent } from './components/history/history.component';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel.component';
import { AppointmentListComponent } from './components/admin/appointment-list/appointment-list.component';
import { SlotsManagementComponent } from './components/admin/slots-management/slots-management.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    canActivate: [authGuard]
  },
  {
    path: 'appointment-form',
    component: AppointmentFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'history',
    component: HistoryComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/appointments',
    component: AppointmentListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/slots',
    component: SlotsManagementComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
