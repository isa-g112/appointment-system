import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  allAppointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];
  isLoading = true;
  activeTab: 'upcoming' | 'past' = 'upcoming';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.id) {
      this.appointmentService.getUserAppointments(currentUser.id).subscribe({
        next: (appointments) => {
          this.allAppointments = appointments;
          this.categorizeAppointments();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.isLoading = false;
        }
      });
    }
  }

  categorizeAppointments(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingAppointments = this.allAppointments
      .filter(apt => new Date(apt.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.pastAppointments = this.allAppointments
      .filter(apt => new Date(apt.date) < today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  cancelAppointment(appointment: Appointment): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.appointmentService.updateAppointment(appointment.id!, { status: 'cancelled' }).subscribe({
        next: () => {
          // Liberar el slot si existe
          this.appointmentService.getAvailableSlots().subscribe(slots => {
            const slot = slots.find(s =>
              s.date === appointment.date &&
              s.startTime === appointment.startTime &&
              s.endTime === appointment.endTime
            );
            if (slot) {
              this.appointmentService.updateSlot(slot.id!, { isAvailable: true }).subscribe();
            }
          });
          this.loadAppointments();
        },
        error: (error) => console.error('Error cancelling appointment:', error)
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada',
      'completed': 'Completada'
    };
    return texts[status] || status;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
