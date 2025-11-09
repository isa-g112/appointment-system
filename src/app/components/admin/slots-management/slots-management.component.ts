import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { AvailableSlot } from '../../../models/appointment.model';

@Component({
  selector: 'app-slots-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './slots-management.component.html',
  styleUrl: './slots-management.component.css'
})
export class SlotsManagementComponent implements OnInit {
  slots: AvailableSlot[] = [];
  isLoading = true;
  showAddForm = false;

  newSlot: AvailableSlot = {
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: true
  };

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
    this.loadSlots();
  }

  loadSlots(): void {
    this.appointmentService.getAvailableSlots().subscribe({
      next: (slots) => {
        this.slots = slots.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.startTime.localeCompare(b.startTime);
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        this.isLoading = false;
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newSlot = {
      date: '',
      startTime: '',
      endTime: '',
      isAvailable: true
    };
  }

  addSlot(): void {
    if (!this.newSlot.date || !this.newSlot.startTime || !this.newSlot.endTime) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.appointmentService.createSlot(this.newSlot).subscribe({
      next: () => {
        this.loadSlots();
        this.toggleAddForm();
      },
      error: (error) => console.error('Error creating slot:', error)
    });
  }

  toggleSlotAvailability(slot: AvailableSlot): void {
    this.appointmentService.updateSlot(slot.id!, { isAvailable: !slot.isAvailable }).subscribe({
      next: () => {
        this.loadSlots();
      },
      error: (error) => console.error('Error updating slot:', error)
    });
  }

  deleteSlot(slot: AvailableSlot): void {
    if (confirm('¿Estás seguro de eliminar este horario?')) {
      this.appointmentService.deleteSlot(slot.id!).subscribe({
        next: () => {
          this.loadSlots();
        },
        error: (error) => console.error('Error deleting slot:', error)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
