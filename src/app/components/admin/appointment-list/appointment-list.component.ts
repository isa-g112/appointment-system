import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  isLoading = true;
  filterStatus: string = 'all';
  searchTerm: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments.sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(apt => {
      const matchesStatus = this.filterStatus === 'all' || apt.status === this.filterStatus;
      const matchesSearch = !this.searchTerm ||
        apt.userName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        apt.service.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  updateStatus(appointment: Appointment, newStatus: string): void {
    if (confirm(`¿Cambiar estado a "${this.getStatusText(newStatus)}"?`)) {
      this.appointmentService.updateAppointment(appointment.id!, { status: newStatus as any }).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => console.error('Error updating status:', error)
      });
    }
  }

  deleteAppointment(appointment: Appointment): void {
    if (confirm('¿Estás seguro de eliminar esta cita? Esta acción no se puede deshacer.')) {
      this.appointmentService.deleteAppointment(appointment.id!).subscribe({
        next: () => {
          // Liberar el slot
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
        error: (error) => console.error('Error deleting appointment:', error)
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
    this.router.navigate(['/admin']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
