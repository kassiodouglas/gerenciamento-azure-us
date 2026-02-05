import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateWorkItemUseCase } from '../../../domains/work-item/application/use-cases/create-work-item.use-case';
import { WorkItem } from '../../../domains/work-item/domain/entities/work-item.entity';
import { ModalComponent } from '../../../../components/modal.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal title="Nova Tarefa (Task)" maxWidth="max-w-xl" (close)="close.emit()">
      <div header-icon class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>

      <div class="space-y-4">
        @if (parentStory()) {
          <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-900/20 dark:border-blue-900/30 flex items-start gap-3">
             <div class="mt-0.5 text-blue-500">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
               </svg>
             </div>
             <div>
               <p class="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 mb-0.5">Vínculo Automático</p>
               <p class="text-sm text-gray-700 dark:text-gray-300">
                 Será criada como filha de <span class="font-mono font-medium">#{{ parentStory()?.id }}</span>
               </p>
               <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-sm">{{ parentStory()?.title }}</p>
             </div>
          </div>
        }

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
          <input type="text" 
                 [(ngModel)]="title" 
                 placeholder="O que precisa ser feito?" 
                 class="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                 [disabled]="isSaving()"
                 autofocus>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
          <textarea 
            [(ngModel)]="description" 
            rows="4" 
            placeholder="Detalhes adicionais..." 
            class="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all resize-none"
            [disabled]="isSaving()"></textarea>
        </div>

        @if (errorMessage()) {
          <div class="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 animate-pulse">
            {{ errorMessage() }}
          </div>
        }
      </div>

      <div footer class="flex justify-end gap-3">
        <button (click)="close.emit()" 
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                [disabled]="isSaving()">
          Cancelar
        </button>
        <button (click)="save()" 
                [disabled]="!title || isSaving()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          @if (isSaving()) {
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando...
          } @else {
            Criar Task
          }
        </button>
      </div>
    </app-modal>
  `
})
export class TaskFormComponent {
  parentStory = input<WorkItem | null>(null);
  initialData = input<{ title: string, description: string } | null>(null);
  close = output<void>();
  saved = output<WorkItem>();

  private createWorkItemUseCase = inject(CreateWorkItemUseCase);

  title = '';
  description = '';
  isSaving = signal(false);
  errorMessage = signal('');

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.title = data.title;
        this.description = data.description;
      }
    });
  }

  save() {
    if (!this.title) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    const parentId = this.parentStory()?.id;

    this.createWorkItemUseCase.execute('Task', this.title, this.description, parentId).subscribe({
      next: (newItem) => {
        this.isSaving.set(false);
        this.saved.emit(newItem);
        this.close.emit();
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.isSaving.set(false);
        this.errorMessage.set('Erro ao criar tarefa. Tente novamente.');
      }
    });
  }
}
