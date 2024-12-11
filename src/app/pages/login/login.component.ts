import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterOutlet } from '@angular/router';

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
  
    constructor(private authService: AuthService) {
      this.email = "";
      this.password = "";
    }
  
    signIn() {
      this.authService.signIn(this.email, this.password)
        .then(result => {
          console.log('Login Successful', result);
        })
        .catch(error => {
          console.error('Login Failed', error);
        });
    }
  }