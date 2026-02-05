import { Component, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { WorkItem } from '../../../../domains/work-item/domain/entities/work-item.entity';
import { AzureService } from '../../../../../services/azure.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="h-full w-full bg-slate-100 dark:bg-slate-900 p-4 overflow-x-auto">
      <div class="flex gap-4 h-full" cdkDropListGroup>
        <!-- To Do Column -->
        <div class="bg-slate-200 dark:bg-slate-800 rounded-lg shadow p-4 w-72 flex-shrink-0 flex flex-col">
          <h3 class="font-bold text-lg mb-4 text-slate-700 dark:text-slate-200">Para Fazer</h3>
          <div cdkDropList [cdkDropListData]="todo()" (cdkDropListDropped)="drop($event, 'New')" class="flex-1 space-y-3 min-h-[100px]">
            @for (story of todo(); track story.id) {
              <div cdkDrag class="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-600 cursor-move active:shadow-lg">
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">#{{ story.id }}</span>
                <p class="font-semibold text-sm mt-1 text-slate-800 dark:text-slate-100">{{ story.title }}</p>
              </div>
            }
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="bg-slate-200 dark:bg-slate-800 rounded-lg shadow p-4 w-72 flex-shrink-0 flex flex-col">
          <h3 class="font-bold text-lg mb-4 text-slate-700 dark:text-slate-200">Em Desenvolvimento</h3>
          <div cdkDropList [cdkDropListData]="inProgress()" (cdkDropListDropped)="drop($event, 'Active')" class="flex-1 space-y-3 min-h-[100px]">
            @for (story of inProgress(); track story.id) {
              <div cdkDrag class="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-600 cursor-move active:shadow-lg">
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">#{{ story.id }}</span>
                <p class="font-semibold text-sm mt-1 text-slate-800 dark:text-slate-100">{{ story.title }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Testing Column -->
        <div class="bg-slate-200 dark:bg-slate-800 rounded-lg shadow p-4 w-72 flex-shrink-0 flex flex-col">
          <h3 class="font-bold text-lg mb-4 text-slate-700 dark:text-slate-200">Testes</h3>
          <div cdkDropList [cdkDropListData]="testing()" (cdkDropListDropped)="drop($event, 'Testing')" class="flex-1 space-y-3 min-h-[100px]">
            @for (story of testing(); track story.id) {
              <div cdkDrag class="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-600 cursor-move active:shadow-lg">
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">#{{ story.id }}</span>
                <p class="font-semibold text-sm mt-1 text-slate-800 dark:text-slate-100">{{ story.title }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Review Column -->
        <div class="bg-slate-200 dark:bg-slate-800 rounded-lg shadow p-4 w-72 flex-shrink-0 flex flex-col">
          <h3 class="font-bold text-lg mb-4 text-slate-700 dark:text-slate-200">Revisão</h3>
          <div cdkDropList [cdkDropListData]="review()" (cdkDropListDropped)="drop($event, 'Review')" class="flex-1 space-y-3 min-h-[100px]">
            @for (story of review(); track story.id) {
              <div cdkDrag class="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-600 cursor-move active:shadow-lg">
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">#{{ story.id }}</span>
                <p class="font-semibold text-sm mt-1 text-slate-800 dark:text-slate-100">{{ story.title }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Done Column -->
        <div class="bg-slate-200 dark:bg-slate-800 rounded-lg shadow p-4 w-72 flex-shrink-0 flex flex-col">
          <h3 class="font-bold text-lg mb-4 text-slate-700 dark:text-slate-200">Fechado</h3>
          <div cdkDropList [cdkDropListData]="done()" (cdkDropListDropped)="drop($event, 'Closed')" class="flex-1 space-y-3 min-h-[100px]">
            @for (story of done(); track story.id) {
              <div cdkDrag class="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-600 opacity-70 cursor-move active:shadow-lg">
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400">#{{ story.id }}</span>
                <p class="font-semibold text-sm mt-1 text-slate-800 dark:text-slate-100">{{ story.title }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class KanbanBoardComponent {
  stories = input.required<WorkItem[]>();
  private azure = inject(AzureService);

  private filterByState(states: string[]) {
    return computed(() => 
      this.stories().filter(s => states.includes(s.state.toLowerCase()))
    );
  }

  todo = this.filterByState(['new', 'to do', 'para fazer', 'novo']);
  inProgress = this.filterByState(['active', 'in progress', 'em desenvolvimento']);
  testing = this.filterByState(['testing', 'testes', 'resolved', 'resolvido']);
  review = this.filterByState(['review', 'revisão']);
  done = this.filterByState(['closed', 'fechado']);

  drop(event: CdkDragDrop<WorkItem[]>, newState: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      
      // Chamada para atualizar no Azure
      const ops = [{ op: 'replace', path: '/fields/System.State', value: newState }];
      this.azure.updateWorkItem(item.id, ops).subscribe({
        next: () => {
          // Atualiza localmente para refletir a mudança
          item.state = newState;
        },
        error: () => {
          console.error('Erro ao mover item');
        }
      });

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
