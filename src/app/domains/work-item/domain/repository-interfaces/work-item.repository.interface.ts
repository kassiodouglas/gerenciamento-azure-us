import { Observable } from 'rxjs';
import { WorkItem } from '../entities/work-item.entity';
import { InjectionToken } from '@angular/core';

export interface IWorkItemRepository {
  getById(id: number, forceRefresh?: boolean): Observable<WorkItem>;
  getByIds(ids: number[]): Observable<WorkItem[]>;
  search(query: string): Observable<WorkItem[]>;
  searchByDevEmail(email: string): Observable<WorkItem[]>;
}

export const WORK_ITEM_REPOSITORY_TOKEN = new InjectionToken<IWorkItemRepository>('IWorkItemRepository');
