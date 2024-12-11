import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './pages/login/login.component';
import { AppComponent } from "./app.component"

export const routes: Routes = [
    {
        path: '',
        component: LoginComponent
    }
  ];
