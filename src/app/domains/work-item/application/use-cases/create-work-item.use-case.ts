import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IWorkItemRepository, WORK_ITEM_REPOSITORY_TOKEN } from '../../domain/repository-interfaces/work-item.repository.interface';
import { WorkItem } from '../../domain/entities/work-item.entity';
import { AzureConfigService } from '../../../../core/config/azure-config.service';

@Injectable({
  providedIn: 'root'
})
export class CreateWorkItemUseCase {
  private repository = inject(WORK_ITEM_REPOSITORY_TOKEN);
  private configService = inject(AzureConfigService);

  execute(type: string, title: string, description?: string, parentId?: number): Observable<WorkItem> {
    const fields: { [key: string]: any } = {
      'System.Title': title,
    };

    if (description) {
      fields['System.Description'] = description;
    }

    // Auto-assign to current user if configured
    // Prefer 'userEmail' for assignment, fallback to 'devEmail' if it looks like an email
    const config = this.configService.config();
    const emailToAssign = config.userEmail || (config.devEmail && config.devEmail.includes('@') ? config.devEmail : null);

    if (emailToAssign) {
      fields['System.AssignedTo'] = emailToAssign;
    }

    return this.repository.create(type, fields, parentId);
  }
}
