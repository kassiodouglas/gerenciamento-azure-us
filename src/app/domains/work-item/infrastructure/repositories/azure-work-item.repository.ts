import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, catchError, switchMap, forkJoin } from 'rxjs';
import { IWorkItemRepository } from '../../domain/repository-interfaces/work-item.repository.interface';
import { WorkItem } from '../../domain/entities/work-item.entity';
import { WorkItemMapper } from '../mappers/work-item.mapper';
import { AzureConfigService } from '../../../../core/config/azure-config.service';

@Injectable({
  providedIn: 'root'
})
export class AzureWorkItemRepository implements IWorkItemRepository {
  private http = inject(HttpClient);
  private configService = inject(AzureConfigService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.configService.getAuthorizationHeader()
    });
  }

  getById(id: number, forceRefresh = false): Observable<WorkItem> {
    if (this.configService.isDemoMode()) {
      return of(this.getMockStories().find(s => s.id === id) || this.getMockStories()[0]);
    }

    const url = `${this.configService.getBaseUrl()}/workitems/${id}?$expand=all&api-version=7.0`;
    let headers = this.getHeaders();
    if (forceRefresh) {
      headers = headers.set('x-force-refresh', 'true');
    }

    return this.http.get(url, { headers }).pipe(
      map(response => WorkItemMapper.toDomain(response))
    );
  }

  getByIds(ids: number[]): Observable<WorkItem[]> {
    if (ids.length === 0) return of([]);
    if (this.configService.isDemoMode()) return of([]);

    const url = `${this.configService.getBaseUrl()}/workitems?ids=${ids.join(',')}&$expand=all&api-version=7.0`;
    return this.http.get<{ value: any[] }>(url, { headers: this.getHeaders() }).pipe(
      map(response => WorkItemMapper.toDomainList(response.value)),
      catchError(() => of([]))
    );
  }

  search(query: string): Observable<WorkItem[]> {
    const url = `${this.configService.getBaseUrl()}/wiql?api-version=7.0`;
    return this.http.post<{ workItems: { id: number }[] }>(url, { query }, { headers: this.getHeaders() }).pipe(
      switchMap(res => {
        const ids = res.workItems.map(wi => wi.id);
        return this.getByIds(ids);
      }),
      catchError(() => of([]))
    );
  }

  searchByDevEmail(email: string): Observable<WorkItem[]> {
    if (this.configService.isDemoMode()) {
      return of(this.getMockStories());
    }

    const query = `SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'User Story' AND [Custom.Dev] = '${email}' ORDER BY [System.ChangedDate] DESC`;
    return this.search(query);
  }

  private getMockStories(): WorkItem[] {
    return [
      new WorkItem(101, 1, 'Integrar API do Google Gemini', 'User Story', 'Ativo', 'Desc...', 'AC...'),
      new WorkItem(102, 1, 'Design da UI do Dashboard', 'User Story', 'Novo', 'Desc...'),
      new WorkItem(103, 1, 'Implementar Autenticação', 'User Story', 'Resolvido', 'Desc...')
    ];
  }
}
