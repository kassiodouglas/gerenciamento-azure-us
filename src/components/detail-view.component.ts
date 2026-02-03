import { Component, input, signal, inject, computed, effect, Injector, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkItem, GeneratedTask } from '../types';
import { marked } from 'marked';
import { GeminiService } from '../services/gemini.service';
import { AzureService } from '../services/azure.service';

@Component({
  selector: 'app-detail-view',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-start dark:border-slate-700">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              {{ workItem().fields['System.WorkItemType'] }} {{ workItem().id }}
            </span>
            <span [class]="'px-2 py-1 text-xs font-semibold rounded ' + getStateColor(workItem().fields['System.State'])">
              {{ workItem().fields['System.State'] }}
            </span>
            @if (totalHours() > 0 || totalEstimated() > 0) {
              <div class="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <span>{{ totalHours() }}h</span>
                <span class="opacity-50">/</span>
                <span>{{ totalEstimated() }}h</span>
                <span class="ml-1 opacity-75">Total</span>
              </div>
            }
          </div>
          <h1 class="text-2xl font-bold text-gray-900 leading-tight dark:text-slate-100">{{ workItem().fields['System.Title'] }}</h1>
          
          <div class="flex items-center gap-3 mt-4">
            <button (click)="generateBranchName()" class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Gerar Branch
            </button>
            
            <button (click)="generateSummary()" [disabled]="isGeneratingSummary()" class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
              @if (isGeneratingSummary()) {
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              Resumo IA
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="refreshDetails()" [disabled]="isRefreshingDetails()" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 dark:hover:bg-slate-700" title="Forçar Atualização">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" [class.animate-spin]="isRefreshingDetails()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button (click)="refineStory()" [disabled]="isRefining()" class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30">
            @if (isRefining()) {
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" /></svg>
            }
            AI Improve
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        <!-- Left Column: User Story Details -->
        <div class="flex-1 overflow-y-auto p-6 space-y-8 border-r border-gray-100 dark:border-slate-700">
          <section>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <button (click)="toggleUSContent()" class="p-1 hover:bg-gray-100 rounded dark:hover:bg-slate-700 transition-colors" [title]="isUSContentVisible() ? 'Hide US' : 'Show US'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200" [class.rotate-180]="!isUSContentVisible()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <h3 class="text-lg font-bold text-gray-900 dark:text-slate-100">User Story</h3>
              </div>
            </div>
            
            <div class="space-y-6" [class.hidden]="!isUSContentVisible()">
              <div>
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 dark:text-slate-400">Description</h4>
                <div class="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700" 
                     [innerHTML]="renderMarkdown(workItem().fields['System.Description'] || 'No description provided.')">
                </div>
              </div>

              @if (workItem().fields['Microsoft.VSTS.Common.AcceptanceCriteria']) {
                <div>
                  <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 dark:text-slate-400">Acceptance Criteria</h4>
                  <div class="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700"
                       [innerHTML]="renderMarkdown(workItem().fields['Microsoft.VSTS.Common.AcceptanceCriteria'])">
                  </div>
                </div>
              }
            </div>
          </section>
        </div>

        <!-- Right Column: Tasks -->
        <div class="w-full md:w-96 bg-slate-50/50 overflow-y-auto p-6 space-y-8 dark:bg-slate-900/20">
          
          <!-- Real Tasks -->
          <section>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <button (click)="toggleRealTasks()" class="p-1 hover:bg-gray-100 rounded dark:hover:bg-slate-700 transition-colors" [title]="isRealTasksVisible() ? 'Esconder Tasks' : 'Mostrar Tasks'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200" [class.rotate-180]="!isRealTasksVisible()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <h3 class="text-lg font-bold text-gray-900 dark:text-slate-100">Tasks</h3>
              </div>
              <span class="px-2 py-0.5 text-xs font-bold bg-gray-200 text-gray-600 rounded-full dark:bg-slate-700 dark:text-slate-400">
                {{ realTasks().length }}
              </span>
            </div>

            <div [class.hidden]="!isRealTasksVisible()" class="space-y-3">
              @if (realTasks().length > 0) {
              <div class="space-y-3">
                @for (task of realTasks(); track task.id) {
                  <div (click)="openTaskModal(task)" class="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors cursor-pointer group dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-500">
                    <div class="flex justify-between items-start mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-mono text-gray-500 dark:text-slate-500">#{{ task.id }}</span>
                        @if (task.fields['Microsoft.VSTS.Scheduling.CompletedWork']) {
                          <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{{ task.fields['Microsoft.VSTS.Scheduling.CompletedWork'] }}h</span>
                        }
                      </div>
                      <span [class]="'text-[10px] uppercase font-bold px-1.5 rounded ' + getStateColor(task.fields['System.State'])">
                        {{ task.fields['System.State'] }}
                      </span>
                    </div>
                    <h4 class="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors dark:text-slate-100 dark:group-hover:text-blue-400">{{ task.fields['System.Title'] }}</h4>
                    @if (task.fields['System.Description']) {
                      <div class="text-[10px] text-gray-500 mt-1 line-clamp-1 dark:text-slate-400" [innerHTML]="renderMarkdown(task.fields['System.Description'])"></div>
                    }
                  </div>
                }
              </div>
              } @else {
                <div class="text-center py-6 px-4 bg-white border-2 border-dashed border-gray-200 rounded-lg dark:bg-slate-800/50 dark:border-slate-700">
                  <p class="text-xs text-gray-400 dark:text-slate-500">No tasks created yet for this US.</p>
                </div>
              }
            </div>
          </section>

          <!-- AI Suggestions -->
          <section class="pt-6 border-t border-gray-200 dark:border-slate-700">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <button (click)="toggleAISuggestions()" class="p-1 hover:bg-gray-100 rounded dark:hover:bg-slate-700 transition-colors" [title]="isAISuggestionsVisible() ? 'Esconder Sugestões' : 'Mostrar Sugestões'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200" [class.rotate-180]="!isAISuggestionsVisible()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">AI Suggestions</h3>
              </div>
              <button (click)="generateTasks()" [disabled]="isGenerating()" 
                class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                title="Generate suggestions">
                @if (isGenerating()) {
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              </button>
            </div>

            @if (tasks().length > 0 && isAISuggestionsVisible()) {
              <div class="space-y-3">
                @for (task of tasks(); track task.title) {
                  <div class="p-3 bg-purple-50/50 border border-purple-100 rounded-lg dark:bg-purple-900/10 dark:border-purple-900/20">
                    <h4 class="text-sm font-semibold text-purple-900 dark:text-purple-300">{{ task.title }}</h4>
                    <p class="text-xs text-purple-700 mt-1 line-clamp-2 dark:text-purple-400/80">{{ task.description }}</p>
                  </div>
                }
              </div>
            } @else if (!isGenerating() && isAISuggestionsVisible()) {
              <p class="text-[11px] text-gray-400 text-center dark:text-slate-500 italic">Clique no ícone para sugestões IA.</p>
            }
          </section>
        </div>
      </div>

      <!-- Toast/Popup -->
      @if (toastMessage()) {
        <div class="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce">
          <div class="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-bold">{{ toastMessage() }}</span>
          </div>
        </div>
      }

      <!-- AI Summary Modal -->
      @if (summaryContent()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" (click)="summaryContent.set('')">
          <div class="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <h2 class="text-lg font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resumo IA
              </h2>
              <button (click)="summaryContent.set('')" class="text-indigo-400 hover:text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="p-8">
              <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-slate-300 whitespace-pre-line">
                {{ summaryContent() }}
              </div>
            </div>
            <div class="p-6 bg-slate-50 dark:bg-slate-900/40 border-t border-gray-100 dark:border-slate-700 text-right">
              <button (click)="summaryContent.set('')" class="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">Fechar</button>
            </div>
          </div>
        </div>
      }

      <!-- Daily Modal -->
      @if (showDailyModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" (click)="showDailyModal.set(false)">
          <div class="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-gray-100 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20 flex justify-between items-center">
              <h2 class="text-lg font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Gerar Relatório Daily
              </h2>
              <button (click)="showDailyModal.set(false)" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Selecione a US</label>
                <select [ngModel]="dailyUSId()" (ngModelChange)="onUSChange($event)" class="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white">
                  @for (us of availableStories(); track us.id) {
                    <option [value]="us.id">#{{ us.id }} - {{ us.fields['System.Title'] }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
                  <span class="block text-[10px] text-gray-500 uppercase font-bold mb-1">Real Acumulado</span>
                  <span class="text-xl font-bold text-indigo-600">
                    {{ getSelectedUSHours() }}h
                  </span>
                </div>
                <div class="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
                  <span class="block text-[10px] text-gray-500 uppercase font-bold mb-1">Estimado Story Points</span>
                  <span class="text-xl font-bold text-amber-600">
                    {{ getSelectedUSEstimatedPoints() }} pts
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-1">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Horas Hoje</label>
                  <input type="number" [(ngModel)]="dailyHoursToday" class="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Observações</label>
                  <textarea [(ngModel)]="dailyNotes" rows="1" class="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none" placeholder="O que foi feito..."></textarea>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Pendências ou Bloqueios</label>
                <textarea [(ngModel)]="dailyPending" rows="2" class="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none" placeholder="Informe aqui se houver pendências..."></textarea>
              </div>

              <div class="flex justify-center">
                <button (click)="addDemand()" [disabled]="!dailyHoursToday" class="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-xs font-bold transition-all dark:bg-indigo-900/20 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  PRÓXIMA DEMANDA
                </button>
              </div>

              <div class="bg-slate-900 text-blue-400 p-4 rounded-lg font-mono text-xs whitespace-pre-wrap border border-blue-900/50">
{{ getDailyPreview() }}
              </div>
            </div>
            <div class="p-6 bg-slate-50 dark:bg-slate-900/40 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
              <button (click)="showDailyModal.set(false)" class="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-slate-400">Fechar</button>
              <button (click)="copyDaily()" class="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Gerar Relatório Daily
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Task Modal -->
      @if (selectedTask()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" (click)="closeTaskModal()">
          <div class="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100" 
               (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/20">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <span class="px-2 py-1 text-[10px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">TASK #{{ selectedTask()!.id }}</span>
                  <span [class]="'px-2 py-1 text-[10px] font-bold rounded ' + getStateColor(selectedTask()!.fields['System.State'])">
                    {{ selectedTask()!.fields['System.State'] }}
                  </span>
                </div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100">{{ selectedTask()!.fields['System.Title'] }}</h2>
              </div>
              <button (click)="closeTaskModal()" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-8 overflow-y-auto max-h-[70vh] space-y-8">
              @if (selectedTask()!.fields['System.Description']) {
                <div>
                  <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Description</h3>
                  <div class="prose prose-sm max-w-none text-gray-700 dark:text-slate-300" [innerHTML]="renderMarkdown(selectedTask()!.fields['System.Description'])"></div>
                </div>
              }

              <div class="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                <div>
                  <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Effort</h3>
                  <div class="flex items-center gap-4">
                    <div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700 flex-1">
                      <span class="block text-[10px] text-gray-500 uppercase">Completed</span>
                      <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">{{ selectedTask()!.fields['Microsoft.VSTS.Scheduling.CompletedWork'] || 0 }}h</span>
                    </div>
                    <div class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700 flex-1">
                      <span class="block text-[10px] text-gray-500 uppercase">Remaining</span>
                      <span class="text-lg font-bold text-amber-600 dark:text-amber-400">{{ selectedTask()!.fields['Microsoft.VSTS.Scheduling.RemainingWork'] || 0 }}h</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assigned To</h3>
                  <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                    <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {{ (selectedTask()!.fields['System.AssignedTo']?.displayName || '?')[0] }}
                    </div>
                    <span class="text-sm font-medium text-gray-700 dark:text-slate-200">{{ selectedTask()!.fields['System.AssignedTo']?.displayName || 'Unassigned' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Modal Footer -->
            <div class="p-6 bg-slate-50 dark:bg-slate-900/40 border-t border-gray-100 dark:border-slate-700 text-right">
              <button (click)="closeTaskModal()" class="px-6 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-sm font-bold text-gray-600 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DetailViewComponent {
  workItem = input.required<WorkItem>();
  availableStories = input<WorkItem[]>([]);
  triggerDaily = input<number>(0);
  
  private azure = inject(AzureService);
  private injector = inject(Injector);
  private _gemini?: GeminiService;

  private get gemini() {
    if (!this._gemini) {
      this._gemini = this.injector.get(GeminiService);
    }
    return this._gemini;
  }
  
  tasks = signal<GeneratedTask[]>([]);
  realTasks = signal<WorkItem[]>([]);
  isGenerating = signal(false);
  isRefining = signal(false);

  isUSContentVisible = signal(true);
  isRealTasksVisible = signal(true);
  isAISuggestionsVisible = signal(true);
  
  selectedTask = signal<WorkItem | null>(null);
  isRefreshingDetails = signal(false);
  generatedBranch = signal<string>('');
  toastMessage = signal<string>('');
  summaryContent = signal<string>('');
  isGeneratingSummary = signal(false);

  showDailyModal = signal(false);
  dailyHoursToday = 0;
  dailyNotes = '';
  dailyPending = '';
  dailyUSId = signal<number>(0);
  dailyReports = signal<{ us: WorkItem, hours: number, notes: string }[]>([]);

  totalHours = computed(() => {
    return this.realTasks().reduce((acc, t) => acc + (t.fields['Microsoft.VSTS.Scheduling.CompletedWork'] || 0), 0);
  });

  totalEstimated = computed(() => {
    return this.workItem().fields['Microsoft.VSTS.Scheduling.StoryPoints'] || this.workItem().fields['Microsoft.VSTS.Scheduling.Effort'] || 0;
  });

  // Reset local state when workItem changes
  constructor() {
    effect(() => {
      const wi = this.workItem();
      this.tasks.set([]); 
      this.isGenerating.set(false);
      this.isRefining.set(false);
      this.generatedBranch.set('');
      this.loadRealTasks(wi);
    });

    effect(() => {
      if (this.triggerDaily() > 0) {
        this.openDailyModal();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscKey() {
    this.closeTaskModal();
  }

  toggleUSContent() {
    this.isUSContentVisible.update(v => !v);
  }

  toggleRealTasks() {
    this.isRealTasksVisible.update(v => !v);
  }

  toggleAISuggestions() {
    this.isAISuggestionsVisible.update(v => !v);
  }

  openTaskModal(task: WorkItem) {
    this.selectedTask.set(task);
  }

  closeTaskModal() {
    this.selectedTask.set(null);
  }

  refreshDetails() {
    this.isRefreshingDetails.set(true);
    // Passamos um header para o interceptor ignorar o cache
    this.azure.getWorkItem(this.workItem().id, true).subscribe({
      next: (fullItem) => {
        // Atualizar o item localmente. Como workItem é um input, 
        // o ideal seria emitir um evento para o pai atualizar, 
        // mas para simplificar e garantir a atualização da UI:
        Object.assign(this.workItem(), fullItem);
        this.loadRealTasks(fullItem);
        this.isRefreshingDetails.set(false);
        this.showToast('Dados atualizados!');
      },
      error: () => {
        this.isRefreshingDetails.set(false);
        this.showToast('Erro ao atualizar!');
      }
    });
  }

  async generateSummary() {
    const desc = this.workItem().fields['System.Description']?.replace(/<[^>]*>/g, '') || '';
    if (!desc) return;
    
    this.isGeneratingSummary.set(true);
    const summary = await this.gemini.summarizeDescription(desc);
    this.summaryContent.set(summary);
    this.isGeneratingSummary.set(false);
  }

  generateBranchName() {
    const wi = this.workItem();
    const id = wi.id;
    const title = wi.fields['System.Title'];
    
    const cleanTitle = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-'); 
      
    const name = `feature/${id}-${cleanTitle}`;
    navigator.clipboard.writeText(name).then(() => {
      this.showToast('Nome da branch copiado!');
    });
  }

  openDailyModal() {
    this.dailyHoursToday = 0;
    this.dailyNotes = '';
    this.dailyPending = '';
    this.dailyUSId.set(this.workItem().id);
    this.dailyReports.set([]);
    this.showDailyModal.set(true);
  }

  onUSChange(newId: any) {
    this.dailyUSId.set(+newId);
    this.dailyHoursToday = 0;
    this.dailyNotes = '';
  }

  getSelectedUSHours(): number {
    const currentId = this.workItem().id;
    const selectedId = Number(this.dailyUSId());
    if (selectedId === currentId) {
      return this.totalHours();
    }
    const us = this.availableStories().find(s => s.id === selectedId);
    return us?.fields['Microsoft.VSTS.Scheduling.CompletedWork'] || 0;
  }

  getSelectedUSEstimatedPoints(): number {
    const currentId = this.workItem().id;
    const selectedId = Number(this.dailyUSId());
    const us = this.availableStories().find(s => s.id === selectedId);
    if (us) {
      return us.fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 0;
    }
    return this.workItem().fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 0;
  }

  addDemand() {
    const us = this.availableStories().find(s => s.id === Number(this.dailyUSId())) || this.workItem();
    this.dailyReports.update(reports => [...reports, {
      us,
      hours: this.dailyHoursToday,
      notes: this.dailyNotes
    }]);
    this.dailyHoursToday = 0;
    this.dailyNotes = '';
  }

  getDailyPreview(): string {
    const today = new Date().toLocaleDateString('pt-BR');
    const header = `Relatório Diário - ${today}\n#### Planejamento do Dia\n\n`;
    const footer = `\n\n#### Pendências ou Bloqueios:\n${this.dailyPending || 'Nenhuma.'}`;

    const currentUS = this.availableStories().find(s => s.id === Number(this.dailyUSId())) || this.workItem();
    const currentPreview = `#US ${currentUS.id} - ${currentUS.fields['System.Title']}\nReal/ Est /Variação: ${this.getUSRealHours(currentUS)}h / ${this.getUSEstimatedHours(currentUS)}h +${this.dailyHoursToday}h\nObservações: ${this.dailyNotes}`;

    let content = '';
    if (this.dailyReports().length > 0) {
      const historical = this.dailyReports().map(r => {
        return `#US ${r.us.id} - ${r.us.fields['System.Title']}\nReal/ Est /Variação: ${this.getUSRealHours(r.us)}h / ${this.getUSEstimatedHours(r.us)}h +${r.hours}h\nObservações: ${r.notes}`;
      }).join('\n\n');
      content = `${historical}\n\n${currentPreview}`;
    } else {
      content = currentPreview;
    }

    return `${header}${content}${footer}`;
  }

  private getUSRealHours(us: WorkItem): number {
    if (us.id === this.workItem().id) return this.totalHours();
    return us.fields['Microsoft.VSTS.Scheduling.CompletedWork'] || 0;
  }

  private getUSEstimatedHours(us: WorkItem): number {
    return us.fields['Custom.StoryPointsHours'] || us.fields['Microsoft.VSTS.Scheduling.Effort'] || 0;
  }

  copyDaily() {
    navigator.clipboard.writeText(this.getDailyPreview()).then(() => {
      this.showToast('Daily copiada!');
    });
  }

  renderMarkdown(content?: string): string {
    if (!content) return '';
    const cleanContent = content.replace(/<[^>]*>/g, (tag) => {
      if (tag.startsWith('<br')) return '\n';
      if (tag.startsWith('</p')) return '\n';
      if (tag.startsWith('<li')) return '\n- ';
      return '';
    });
    return marked.parse(cleanContent, { gfm: true, breaks: true }) as string;
  }

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }

  private loadRealTasks(wi: WorkItem) {
    this.realTasks.set([]);
    const taskIds = wi.relations
      ?.filter(rel => rel.rel === 'System.LinkTypes.Hierarchy-Forward' || rel.url.includes('/workItems/'))
      .map(rel => {
        const parts = rel.url.split('/');
        return parseInt(parts[parts.length - 1], 10);
      })
      .filter(id => !isNaN(id)) || [];

    if (taskIds.length > 0) {
      this.azure.getWorkItemsByIds(taskIds).subscribe(items => {
        const onlyTasks = items
          .filter(i => i.fields['System.WorkItemType'] === 'Task')
          .sort((a, b) => a.id - b.id);
        this.realTasks.set(onlyTasks);
      });
    }
  }

  async generateTasks() {
    this.isGenerating.set(true);
    const wi = this.workItem();
    const desc = wi.fields['System.Description']?.replace(/<[^>]*>/g, '') || '';
    
    const suggested = await this.gemini.generateTasks(wi.fields['System.Title'], desc);
    this.tasks.set(suggested);
    this.isGenerating.set(false);
  }

  async refineStory() {
    this.isRefining.set(true);
    const wi = this.workItem();
    const desc = wi.fields['System.Description']?.replace(/<[^>]*>/g, '') || '';
    const improved = await this.gemini.refineDescription(desc);
    
    wi.fields['System.Description'] = improved.replace(/\n/g, '<br>');
    this.isRefining.set(false);
  }

  getStateColor(state: string): string {
    const s = state.toLowerCase();
    if (s === 'closed' || s === 'fechado') return 'bg-green-800 text-green-100 dark:bg-green-900 dark:text-green-200';
    if (s === 'testes' || s === 'testing' || s === 'resolved') return 'bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100';
    if (s === 'para fazer' || s === 'to do' || s === 'new') return 'bg-green-500 text-white dark:bg-green-700 dark:text-green-100';
    if (s === 'revisão' || s === 'review') return 'bg-red-600 text-white dark:bg-red-800 dark:text-red-100';
    
    switch (s) {
      case 'active': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      case 'removed': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  }
}
