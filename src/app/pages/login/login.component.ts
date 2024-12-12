import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [FormsModule]
})
export class LoginComponent {
    email: string;
    password: string;
  
    constructor(private authService: AuthService, private router: Router) {
      this.email = "";
      this.password = "";
    }
  
    signIn() {
      this.authService.signIn(this.email, this.password)
        .then(result => {
          console.log('Login Successful', result);
          this.router.navigate(['/map']); // Redirecționează la pagina hărții
        })
        .catch(error => {
          console.error('Login Failed', error);
        });
    }

    signInWithGoogle() {
      this.authService.signInWithGoogle()
        .then(user => {
          if (user) {
            console.log('Google Login Successful:', user);
            this.router.navigate(['/map']); // Redirecționează la pagina hărții
          } else {
            console.error('Google Login Failed or canceled.');
          }
        })
        .catch(error => {
          console.error('Error during Google Login:', error);
        });
    }
    

  }