import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { AvailableSlot } from '../../models/appointment.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  availableSlots: AvailableSlot[] = [];
  selectedDate: string = '';
  filteredSlots: AvailableSlot[] = [];
  uniqueDates: string[] = [];
  isLoading = true;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAvailableSlots();
  }

  loadAvailableSlots(): void {
    this.appointmentService.getAvailableSlots().subscribe({
      next: (slots) => {
        this.availableSlots = slots.filter(slot => slot.isAvailable);
        this.extractUniqueDates();
        if (this.uniqueDates.length > 0) {
          this.selectedDate = this.uniqueDates[0];
          this.filterSlotsByDate();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        this.isLoading = false;
      }
    });
  }

  extractUniqueDates(): void {
    const dates = this.availableSlots.map(slot => slot.date);
    this.uniqueDates = [...new Set(dates)].sort();
  }

  filterSlotsByDate(): void {
    this.filteredSlots = this.availableSlots.filter(
      slot => slot.date === this.selectedDate
    );
  }

  onDateSelect(date: string): void {
    this.selectedDate = date;
    this.filterSlotsByDate();
  }

  bookAppointment(slot: AvailableSlot): void {
    this.router.navigate(['/appointment-form'], {
      queryParams: {
        slotId: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
