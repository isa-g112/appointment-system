import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appointment, AvailableSlot, Service } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`);
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`);
  }

  getUserAppointments(userId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments?userId=${userId}`);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, {
      ...appointment,
      createdAt: new Date().toISOString()
    });
  }

  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/appointments/${id}`, appointment);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${id}`);
  }

  // Available Slots
  getAvailableSlots(): Observable<AvailableSlot[]> {
    return this.http.get<AvailableSlot[]>(`${this.apiUrl}/availableSlots`);
  }

  getSlotsByDate(date: string): Observable<AvailableSlot[]> {
    return this.http.get<AvailableSlot[]>(`${this.apiUrl}/availableSlots?date=${date}&isAvailable=true`);
  }

  createSlot(slot: AvailableSlot): Observable<AvailableSlot> {
    return this.http.post<AvailableSlot>(`${this.apiUrl}/availableSlots`, slot);
  }

  updateSlot(id: number, slot: Partial<AvailableSlot>): Observable<AvailableSlot> {
    return this.http.patch<AvailableSlot>(`${this.apiUrl}/availableSlots/${id}`, slot);
  }

  deleteSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/availableSlots/${id}`);
  }

  // Services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`);
  }
}
