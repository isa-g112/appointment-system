import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment, Service } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.css'
})
export class AppointmentFormComponent implements OnInit {
  appointment: Partial<Appointment> = {
    service: '',
    notes: '',
    status: 'pending'
  };

  services: Service[] = [];
  slotId: number = 0;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadSlotData();
  }

  loadServices(): void {
    this.appointmentService.getServices().subscribe({
      next: (services) => {
        this.services = services;
        if (services.length > 0) {
          this.appointment.service = services[0].name;
        }
      },
      error: (error) => console.error('Error loading services:', error)
    });
  }

  loadSlotData(): void {
    this.route.queryParams.subscribe(params => {
      this.slotId = +params['slotId'];
      this.appointment.date = params['date'];
      this.appointment.startTime = params['startTime'];
      this.appointment.endTime = params['endTime'];
    });
  }

  onSubmit(): void {
    if (!this.appointment.service) {
      this.errorMessage = 'Por favor selecciona un servicio';
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.errorMessage = 'Debes iniciar sesión';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const newAppointment: Appointment = {
      userId: currentUser.id!,
      userName: currentUser.name,
      date: this.appointment.date!,
      startTime: this.appointment.startTime!,
      endTime: this.appointment.endTime!,
      service: this.appointment.service,
      status: 'pending',
      notes: this.appointment.notes || '',
      createdAt: new Date().toISOString()
    };

    this.appointmentService.createAppointment(newAppointment).subscribe({
      next: (appointment) => {
        // Actualizar el slot como no disponible
        this.appointmentService.updateSlot(this.slotId, { isAvailable: false }).subscribe();

        this.isLoading = false;
        this.successMessage = '¡Cita agendada exitosamente!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al agendar la cita. Por favor intenta de nuevo.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/calendar']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
