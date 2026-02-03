import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = inject(CacheService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Cachear requisições GET e POST (especificamente WIQL) para o Azure DevOps
    const isCacheable = (req.method === 'GET' || (req.method === 'POST' && req.url.includes('/wiql'))) && req.url.includes('dev.azure.com');
    
    if (!isCacheable) {
      return next.handle(req);
    }

    // Verificar se existe flag para forçar atualização (pular cache)
    const forceRefresh = req.headers.get('x-force-refresh') === 'true';
    
    if (!forceRefresh) {
      const cachedResponse = this.cache.get(req);
      if (cachedResponse) {
        return of(cachedResponse);
      }
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.put(req, event);
        }
      })
    );
  }
}
