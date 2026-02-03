import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly CACHE_KEY_PREFIX = 'azure_api_cache_';
  private readonly DEFAULT_MAX_AGE = 1800000; // 30 minutos em milisegundos

  constructor() {
    this.cleanExpired();
  }

  private createKey(req: HttpRequest<any>): string {
    const url = req.urlWithParams;
    const body = req.body ? JSON.stringify(req.body) : '';
    // btoa pode falhar com caracteres especiais, usamos uma alternativa simples se necessário, 
    // mas para queries WIQL geralmente btoa resolve.
    try {
      const bodySuffix = body ? '_' + btoa(body) : '';
      return this.CACHE_KEY_PREFIX + url + bodySuffix;
    } catch (e) {
      // Fallback simples caso o body tenha caracteres não suportados pelo btoa
      return this.CACHE_KEY_PREFIX + url + '_' + body.length;
    }
  }

  put(req: HttpRequest<any>, response: HttpResponse<any>, maxAge: number = this.DEFAULT_MAX_AGE): void {
    const key = this.createKey(req);
    const entry = {
      body: response.body,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      expiry: Date.now() + maxAge
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn('Cache storage full, clearing old entries', e);
      this.clear(); // Se o storage estiver cheio, limpa tudo para dar lugar aos novos
    }
  }

  get(req: HttpRequest<any>): HttpResponse<any> | undefined {
    const key = this.createKey(req);
    const cachedStr = localStorage.getItem(key);

    if (!cachedStr) {
      return undefined;
    }

    try {
      const cached = JSON.parse(cachedStr);
      const isExpired = cached.expiry < Date.now();

      if (isExpired) {
        localStorage.removeItem(key);
        return undefined;
      }

      return new HttpResponse({
        body: cached.body,
        status: cached.status,
        statusText: cached.statusText,
        url: cached.url
      });
    } catch (e) {
      localStorage.removeItem(key);
      return undefined;
    }
  }

  delete(urlPattern: string): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_KEY_PREFIX) && key.includes(urlPattern)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private cleanExpired(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key)!);
          if (cached.expiry < now) {
            keysToRemove.push(key);
          }
        } catch (e) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}
