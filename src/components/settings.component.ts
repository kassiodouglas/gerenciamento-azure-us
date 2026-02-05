import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AzureService } from '../services/azure.service';
import { GeminiConfigService } from '../app/core/config/gemini-config.service';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal title="Configurar Conexão" 
               maxWidth="max-w-md" 
               headerClass="bg-slate-800 text-white dark:bg-black"
               titleClass="text-xl font-bold"
               bodyClass="p-0"
               (close)="close.emit()">
      
      <svg header-icon xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543 .826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>

      <div class="px-6 pt-2 pb-0">
        <p class="text-slate-400 text-sm">Conecte-se ao Azure DevOps ou use o Modo Demo.</p>
      </div>
      
      <form [formGroup]="form" (ngSubmit)="save()" class="p-6 space-y-4">
        
        <div class="flex items-center gap-2 mb-4">
           <input type="checkbox" id="demo" formControlName="isDemoMode" class="w-4 h-4 text-blue-600 rounded">
           <label for="demo" class="text-sm font-medium text-gray-700 dark:text-slate-300">Usar Modo Demo (Dados Fictícios)</label>
        </div>

        @if (!form.value.isDemoMode) {
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Organização</label>
            <input type="text" formControlName="organization" placeholder="minha-org" class="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Projeto</label>
            <input type="text" formControlName="project" placeholder="meu-projeto" class="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Token de Acesso Pessoal (PAT)</label>
            <input type="password" formControlName="pat" placeholder="Azure DevOps PAT" class="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
            <p class="text-xs text-gray-500 mt-1 dark:text-slate-400">Requer permissão 'Work Items (Read)'.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Email/Nome do Desenvolvedor (Custom.Dev)</label>
            <input type="text" formControlName="devEmail" placeholder="Nome para filtro (ex: Cassio)" class="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
            <p class="text-xs text-gray-500 mt-1 dark:text-slate-400">Usado para filtrar as User Stories na lista.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Email do Usuário (Atribuição)</label>
            <input type="text" formControlName="userEmail" placeholder="usuario@empresa.com" class="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
            <p class="text-xs text-gray-500 mt-1 dark:text-slate-400">Se preenchido, será usado para atribuir novas Tasks a você.</p>
          </div>
        }

        <div class="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
          <h4 class="text-sm font-bold text-gray-900 dark:text-slate-100 mb-2">Gemini AI</h4>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Gemini API Key</label>
            <input type="password" formControlName="geminiApiKey" placeholder="Sua Gemini API Key" class="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
          </div>
        </div>

        <div footer class="flex justify-end">
          <button type="button" (click)="close.emit()" class="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">
            Cancelar
          </button>
          <button type="submit" [disabled]="form.invalid && !form.value.isDemoMode" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            Salvar e Conectar
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class SettingsComponent {
  azure = inject(AzureService);
  geminiConfig = inject(GeminiConfigService);
  fb = inject(FormBuilder);
  close = output<void>();

  form = this.fb.group({
    organization: ['', Validators.required],
    project: ['', Validators.required],
    pat: ['', Validators.required],
    devEmail: ['', Validators.required],
    userEmail: [''], // Opcional, usado para System.AssignedTo
    isDemoMode: [false],
    geminiApiKey: ['']
  });

  constructor() {
    const conf = this.azure.config();
    const gemini = this.geminiConfig.config();
    this.form.patchValue({
      ...conf,
      geminiApiKey: gemini.apiKey
    });
    
    // Disable validators if demo mode is on
    this.form.controls.isDemoMode.valueChanges.subscribe(val => {
      if (val) {
        this.form.controls.organization.disable();
        this.form.controls.project.disable();
        this.form.controls.pat.disable();
        this.form.controls.devEmail.disable();
        this.form.controls.userEmail.disable();
      } else {
        this.form.controls.organization.enable();
        this.form.controls.project.enable();
        this.form.controls.pat.enable();
        this.form.controls.devEmail.enable();
        this.form.controls.userEmail.enable();
      }
    });
    
    // Trigger initial state
    if (conf.isDemoMode) {
      this.form.controls.organization.disable();
      this.form.controls.project.disable();
      this.form.controls.pat.disable();
      this.form.controls.devEmail.disable();
      this.form.controls.userEmail.disable();
    }
  }

  save() {
    this.geminiConfig.saveConfig({
      apiKey: this.form.value.geminiApiKey || ''
    });

    if (this.form.value.isDemoMode) {
      this.azure.saveConfig({
        isDemoMode: true,
        organization: '',
        project: '',
        pat: '',
        devEmail: '',
        userEmail: ''
      });
    } else if (this.form.valid) {
      this.azure.saveConfig({
        isDemoMode: false,
        organization: this.form.value.organization!,
        project: this.form.value.project!,
        pat: this.form.value.pat!,
        devEmail: this.form.value.devEmail!,
        userEmail: this.form.value.userEmail || ''
      });
    }
    this.close.emit();
  }
}
