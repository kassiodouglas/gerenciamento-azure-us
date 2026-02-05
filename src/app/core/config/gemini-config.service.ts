import { Injectable, signal } from '@angular/core';

export interface GeminiConfig {
  apiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiConfigService {
  private readonly STORAGE_KEY = 'gemini_config';
  
  private configSignal = signal<GeminiConfig>(this.loadConfig());
  
  config = this.configSignal.asReadonly();

  private loadConfig(): GeminiConfig {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : { 
      apiKey: ''
    };
  }

  saveConfig(newConfig: GeminiConfig) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newConfig));
    this.configSignal.set({...newConfig});
  }
}
