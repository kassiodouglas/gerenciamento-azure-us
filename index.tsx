
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CacheInterceptor } from './src/services/cache.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
