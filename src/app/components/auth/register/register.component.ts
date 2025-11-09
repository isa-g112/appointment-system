import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user: User = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client'
  };

  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  onSubmit(): void {
    // Validaciones
    if (!this.user.name || !this.user.email || !this.user.password || !this.user.phone) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.user.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Verificar si el email ya existe
    this.http.get<User[]>(`http://localhost:3000/users?email=${this.user.email}`).subscribe({
      next: (users) => {
        if (users.length > 0) {
          this.isLoading = false;
          this.errorMessage = 'El email ya está registrado';
          return;
        }

        // Crear el usuario
        const newUser = {
          ...this.user,
          role: 'client',
          createdAt: new Date().toISOString()
        };

        this.http.post<User>('http://localhost:3000/users', newUser).subscribe({
          next: (user) => {
            this.isLoading = false;
            this.successMessage = '¡Registro exitoso! Redirigiendo al login...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Error al registrarse. Por favor intenta de nuevo.';
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al verificar el email';
      }
    });
  }
}
