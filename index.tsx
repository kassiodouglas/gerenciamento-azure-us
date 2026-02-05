import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './src/app/app.component';
import { provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';
import { WORK_ITEM_REPOSITORY_TOKEN } from './src/app/domains/work-item/domain/repository-interfaces/work-item.repository.interface';
import { AzureWorkItemRepository } from './src/app/domains/work-item/infrastructure/repositories/azure-work-item.repository';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CacheInterceptor } from './src/services/cache.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    {
      provide: WORK_ITEM_REPOSITORY_TOKEN,
      useClass: AzureWorkItemRepository
    },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
  ]
}).catch(err => console.error(err));
