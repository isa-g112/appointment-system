export interface Appointment {
  id?: number;
  userId: number;
  userName?: string;
  date: string;
  startTime: string;
  endTime: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt?: string;
}

export interface AvailableSlot {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Service {
  id?: number;
  name: string;
  duration: number;
  description: string;
}
