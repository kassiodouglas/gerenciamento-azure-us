import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IWorkItemRepository, WORK_ITEM_REPOSITORY_TOKEN } from '../../domain/repository-interfaces/work-item.repository.interface';
import { WorkItem } from '../../domain/entities/work-item.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateWorkItemUseCase {
  private repository = inject(WORK_ITEM_REPOSITORY_TOKEN);

  execute(id: number, operations: { op: string, path: string, value: any }[]): Observable<WorkItem> {
    return this.repository.update(id, operations);
  }
}
