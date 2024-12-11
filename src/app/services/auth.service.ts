import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { signInWithPopup, GoogleAuthProvider, User } from '@angular/fire/auth';


@Injectable({
    providedIn: 'root'  // This makes the service globally available    
})

export class AuthService {
    constructor(private auth: Auth) {}
  
    // Sign up new users
    signUp(email: string, password: string): Promise<UserCredential> {
      return createUserWithEmailAndPassword(this.auth, email, password);
    }
  
    // Sign in existing users

    signIn(email: string, password: string): Promise<UserCredential> {
      return signInWithEmailAndPassword(this.auth, email, password);
    }

    async signInWithGoogle(): Promise<User | null> {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(this.auth, provider);
        console.log('Google Login Successful:', result.user);
        return result.user;
      } catch (error) {
        console.error('Google Login Failed:', error);
        return null;
      }
    }
  
    // Sign out the current user
    signOut(): Promise<void> {
      return signOut(this.auth);
    }
  
    // Get the currently logged-in user (if any)
    get currentUser() {
      return this.auth.currentUser;
    }
  }