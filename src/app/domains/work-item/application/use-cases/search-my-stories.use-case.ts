import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkItem } from '../../domain/entities/work-item.entity';
import { WORK_ITEM_REPOSITORY_TOKEN } from '../../domain/repository-interfaces/work-item.repository.interface';
import { AzureConfigService } from '../../../../core/config/azure-config.service';

@Injectable({
  providedIn: 'root'
})
export class SearchMyStoriesUseCase {
  private repository = inject(WORK_ITEM_REPOSITORY_TOKEN);
  private configService = inject(AzureConfigService);

  execute(): Observable<WorkItem[]> {
    const email = this.configService.config().devEmail;
    return this.repository.searchByDevEmail(email);
  }
}
