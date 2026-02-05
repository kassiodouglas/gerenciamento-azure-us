import { Injectable, inject, signal, computed } from '@angular/core';

export interface AzureConfig {
  organization: string;
  project: string;
  pat: string;
  devEmail: string;
  isDemoMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AzureConfigService {
  private readonly STORAGE_KEY = 'azure_config';
  
  private configSignal = signal<AzureConfig>(this.loadConfig());
  
  config = this.configSignal.asReadonly();
  
  isDemoMode = computed(() => this.configSignal().isDemoMode);

  private loadConfig(): AzureConfig {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : { 
      organization: '', 
      project: '', 
      pat: '', 
      devEmail: '', 
      isDemoMode: false 
    };
  }

  saveConfig(newConfig: AzureConfig) {
    console.log('Saving config:', newConfig);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newConfig));
    this.configSignal.set({...newConfig});
  }

  getAuthorizationHeader(): string {
    const conf = this.configSignal();
    return 'Basic ' + btoa(':' + conf.pat);
  }

  getBaseUrl(): string {
    const conf = this.configSignal();
    const url = `https://dev.azure.com/${conf.organization}/${conf.project}/_apis/wit`;
    console.log('Base URL requested:', url);
    return url;
  }
}
