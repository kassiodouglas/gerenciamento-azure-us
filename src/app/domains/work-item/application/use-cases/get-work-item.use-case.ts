import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkItem } from '../../domain/entities/work-item.entity';
import { WORK_ITEM_REPOSITORY_TOKEN } from '../../domain/repository-interfaces/work-item.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GetWorkItemUseCase {
  private repository = inject(WORK_ITEM_REPOSITORY_TOKEN);

  execute(id: number, forceRefresh = false): Observable<WorkItem> {
    return this.repository.getById(id, forceRefresh);
  }
}
