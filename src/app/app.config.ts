import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideHttpClient, withFetch } from '@angular/common/http';

const firebaseConfig = {
  apiKey: "AIzaSyB1RtDbB4nXR9f96X6Ulk0otkymse0VFfU",
  authDomain: "meteorologicaltracker.firebaseapp.com",
  databaseURL: "https://meteorologicaltracker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "meteorologicaltracker",
  storageBucket: "meteorologicaltracker.firebasestorage.app",
  messagingSenderId: "831647757905",
  appId: "1:831647757905:web:e8266adff81c6a5b8c6a70",
  measurementId: "G-ZSX118VQP1"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase())
  ]
};
