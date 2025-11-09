import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AppointmentService } from '../../../services/appointment.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  totalAppointments = 0;
  totalClients = 0;
  todayAppointments = 0;
  pendingAppointments = 0;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadStats();
  }

  loadStats(): void {
    // Cargar estadísticas
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.totalAppointments = appointments.length;
        this.pendingAppointments = appointments.filter(a => a.status === 'pending').length;

        const today = new Date().toISOString().split('T')[0];
        this.todayAppointments = appointments.filter(a => a.date === today).length;

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      }
    });

    this.userService.getClients().subscribe({
      next: (clients) => {
        this.totalClients = clients.length;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
