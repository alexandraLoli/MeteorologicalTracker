import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB1RtDbB4nXR9f96X6Ulk0otkymse0VFfU",
  authDomain: "meteorologicaltracker.firebaseapp.com",
  projectId: "meteorologicaltracker",
  storageBucket: "meteorologicaltracker.firebasestorage.app",
  messagingSenderId: "831647757905",
  appId: "1:831647757905:web:e8266adff81c6a5b8c6a70",
  measurementId: "G-ZSX118VQP1"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};
