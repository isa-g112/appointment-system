import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${credentials.email}`).pipe(
      map(users => {
        if (users.length === 0) {
          throw new Error('Usuario no encontrado');
        }

        const user = users[0];
        if (user.password !== credentials.password) {
          throw new Error('Contraseña incorrecta');
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(error => {
        return throwError(() => new Error(error.message || 'Error en el login'));
      })
    );
  }

  register(user: User): Observable<User> {
    // Verificar si el email ya existe
    return this.http.get<User[]>(`${this.apiUrl}?email=${user.email}`).pipe(
      map(users => {
        if (users.length > 0) {
          throw new Error('El email ya está registrado');
        }
        return true;
      }),
      map(() => {
        // Crear nuevo usuario
        const newUser = {
          ...user,
          role: user.role || 'client',
          createdAt: new Date().toISOString()
        };
        return newUser;
      }),
      map(newUser => {
        this.http.post<User>(this.apiUrl, newUser).subscribe();
        return newUser;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }
}
