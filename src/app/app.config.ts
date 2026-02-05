import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { WORK_ITEM_REPOSITORY_TOKEN } from './domains/work-item/domain/repository-interfaces/work-item.repository.interface';
import { AzureWorkItemRepository } from './domains/work-item/infrastructure/repositories/azure-work-item.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: WORK_ITEM_REPOSITORY_TOKEN,
      useClass: AzureWorkItemRepository
    }
  ]
};
