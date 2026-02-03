import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AzureService } from './services/azure.service';
import { SettingsComponent } from './components/settings.component';
import { DetailViewComponent } from './components/detail-view.component';
import { WorkItem, WiqlResponse } from './types';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap, of, forkJoin } from 'rxjs';
import { CacheService } from './services/cache.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, SettingsComponent, DetailViewComponent, FormsModule],
  template: `
    <div class="h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      
      <!-- Top Navigation -->
      <header class="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md z-10 flex-shrink-0 dark:bg-black">
        <div class="flex items-center gap-3">
          <button (click)="toggleSidebar()" class="p-2 hover:bg-slate-800 rounded-md transition-colors mr-2 text-slate-400 hover:text-white" title="Toggle Sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-lg">A</div>
          <h1 class="text-lg font-medium tracking-tight">Azure DevOps <span class="text-blue-400">AI Manager</span></h1>
        </div>
        <div class="flex items-center gap-4">
           @if (azure.config().isDemoMode) {
             <span class="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded uppercase font-bold tracking-wider">Demo Mode</span>
           }
           
           <button (click)="toggleDarkMode()" class="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white" [title]="isDarkMode() ? 'Light Mode' : 'Dark Mode'">
             @if (isDarkMode()) {
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 7.757l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
               </svg>
             } @else {
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
               </svg>
             }
           </button>

           <button (click)="refreshAll()" [disabled]="isLoading()" class="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white" title="Atualizar Tudo">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" [class.animate-spin]="isLoading()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </button>

           <button (click)="dailyTrigger.set(Date.now())" class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold transition-all" title="Gerar Daily">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             Daily
           </button>

           <button (click)="showSettings.set(true)" class="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white" title="Settings">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543 .826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
           </button>
        </div>
      </header>

      <!-- Main Layout -->
      <div class="flex-1 flex overflow-hidden dark:bg-slate-900">
        
        <!-- Sidebar: List -->
        <aside [class.w-0]="!isSidebarOpen()" [class.opacity-0]="!isSidebarOpen()" [class.w-80]="isSidebarOpen()" class="bg-white border-r border-gray-200 flex flex-col flex-shrink-0 dark:bg-slate-900 dark:border-slate-800 transition-all duration-300 ease-in-out overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between dark:border-slate-800">
            <h2 class="font-semibold text-gray-700 dark:text-slate-200">User Stories</h2>
            <button (click)="refresh()" [disabled]="isLoading()" class="text-blue-600 hover:text-blue-800 text-sm font-medium dark:text-blue-400 dark:hover:text-blue-300">
               {{ isLoading() ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
          
      <div class="flex-1 overflow-y-auto p-3 space-y-3">
        @if (errorMessage()) {
          <div class="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
            {{ errorMessage() }}
            <div class="mt-2 text-xs">Check Settings or use Demo Mode.</div>
          </div>
        }

        <!-- Search and Filters -->
        <div class="space-y-2 mb-4">
          <div class="relative">
            <input type="text" 
                   [ngModel]="searchQuery()" 
                   (ngModelChange)="searchQuery.set($event)"
                   placeholder="Buscar #ID..." 
                   class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div class="flex flex-wrap gap-1">
            @for (status of availableStatus; track status) {
              <button (click)="toggleStatusFilter(status)"
                      [class]="'text-[10px] px-2 py-1 rounded-full border transition-all ' + 
                               (statusFilters().includes(status) 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-blue-300')">
                {{ status }}
              </button>
            }
          </div>
        </div>

        @for (item of filteredStories(); track item.id) {
              <div (click)="selectStory(item)" 
                   [class]="'p-3 rounded-lg cursor-pointer border transition-all duration-200 ' + 
                            (selectedStory()?.id === item.id 
                              ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300 shadow-sm dark:bg-blue-900/20 dark:border-blue-800 dark:ring-blue-800' 
                              : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-750 dark:hover:border-slate-600')">
                 <div class="flex justify-between items-start mb-1">
                   <div class="flex items-center gap-2">
                     <span class="text-xs font-mono text-gray-500 dark:text-slate-400">#{{ item.id }}</span>
                     @if (item.fields['Microsoft.VSTS.Scheduling.CompletedWork'] > 0 || item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] > 0) {
                       <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                         {{ item.fields['Microsoft.VSTS.Scheduling.CompletedWork'] || 0 }}h / {{ item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 0 }}pts
                         @let diff = (item.fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 0) - (item.fields['Microsoft.VSTS.Scheduling.CompletedWork'] || 0);
                         <span [class]="diff < 0 ? 'text-red-500 ml-1' : 'text-gray-400 ml-1'">
                           ({{ diff < 0 ? 'verificar' : '+' + diff + 'h' }})
                         </span>
                       </span>
                     }
                   </div>
                   <span [class]="'text-[10px] uppercase font-bold px-1.5 rounded ' + getStateColor(item.fields['System.State'])">
                     {{ item.fields['System.State'] }}
                   </span>
                 </div>
                 <h3 class="text-sm font-medium text-gray-800 line-clamp-2 leading-snug dark:text-slate-200">{{ item.fields['System.Title'] }}</h3>
              </div>
            } @empty {
              @if (!isLoading() && !errorMessage()) {
                <div class="text-center py-10 text-gray-400 text-sm dark:text-slate-500">No stories found.</div>
              }
            }
          </div>
        </aside>

        <!-- Main Content: Details -->
        <main class="flex-1 p-6 bg-slate-50 overflow-hidden dark:bg-slate-900">
          @if (selectedStory()) {
             <app-detail-view [workItem]="selectedStory()!" [availableStories]="activeStories()" [triggerDaily]="dailyTrigger()" class="h-full block" />
          } @else {
            <div class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
              <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                 </svg>
              </div>
              <p class="text-lg font-medium">Select a User Story to view details</p>
              <p class="text-sm mt-2 max-w-xs text-center">Configure your connection in Settings to fetch real data from Azure DevOps.</p>
            </div>
          }
        </main>
      </div>

      <!-- Settings Modal -->
      @if (showSettings()) {
        <app-settings (close)="closeSettings()" />
      }
    </div>
  `
})
export class AppComponent {
  azure = inject(AzureService);
  cache = inject(CacheService);
  http = inject(HttpClient);
  Date = Date;
  
  showSettings = signal(false);
  isSidebarOpen = signal(true);
  dailyTrigger = signal<number>(0);
  isDarkMode = signal(this.loadTheme());
  stories = signal<WorkItem[]>([]);
  activeStories = computed(() => {
    const filters = ['testes', 'em desenvolvimento', 'revisão', 'para fazer'];
    return this.stories().filter(s => {
      const state = s.fields['System.State'].toLowerCase();
      return filters.some(f => {
        if (f === 'para fazer') return state === 'new' || state === 'to do' || state === 'para fazer';
        if (f === 'em desenvolvimento') return state === 'active' || state === 'in progress' || state === 'em desenvolvimento';
        if (f === 'revisão') return state === 'review' || state === 'revisão';
        if (f === 'testes') return state === 'testing' || state === 'testes';
        return state === f;
      });
    });
  });
  selectedStory = signal<WorkItem | null>(null);

  searchQuery = signal('');
  statusFilters = signal<string[]>(['testes', 'em desenvolvimento', 'revisão', 'para fazer']);
  availableStatus = ['para fazer', 'em desenvolvimento', 'revisão', 'testes', 'resolvido', 'fechado', 'novo', 'ativo'];

  filteredStories = computed(() => {
    let list = this.stories();
    const query = this.searchQuery().trim();
    const filters = this.statusFilters();

    if (query) {
      list = list.filter(s => s.id.toString().includes(query));
    }

    if (filters.length > 0) {
      list = list.filter(s => {
        const state = s.fields['System.State'].toLowerCase();
        // Mapeamento básico para o filtro
        return filters.some(f => {
           if (f === 'para fazer') return state === 'new' || state === 'to do' || state === 'para fazer';
           if (f === 'em desenvolvimento') return state === 'active' || state === 'in progress' || state === 'em desenvolvimento';
           if (f === 'revisão') return state === 'review' || state === 'revisão';
           if (f === 'testes') return state === 'testing' || state === 'testes';
           if (f === 'resolvido') return state === 'resolved' || state === 'resolvido';
           if (f === 'fechado') return state === 'closed' || state === 'fechado';
           return state === f;
        });
      });
    }

    return list;
  });
  isLoading = signal(false);
  errorMessage = signal<string>('');

  constructor() {
    // Check if configured, else show settings
    const conf = this.azure.config();
    if (!conf.pat && !conf.isDemoMode) {
      this.showSettings.set(true);
    } else {
      this.refresh();
    }
  }

  closeSettings() {
    this.showSettings.set(false);
    this.refresh();
  }

  refreshAll() {
    this.cache.clear();
    this.refresh();
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleStatusFilter(status: string) {
    this.statusFilters.update(current => 
      current.includes(status) 
        ? current.filter(s => s !== status)
        : [...current, status]
    );
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    const mode = this.isDarkMode() ? 'dark' : 'light';
    localStorage.setItem('theme', mode);
    this.applyTheme(mode);
  }

  private loadTheme(): boolean {
    const stored = localStorage.getItem('theme');
    const isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(isDark ? 'dark' : 'light');
    return isDark;
  }

  private applyTheme(mode: 'dark' | 'light') {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  refresh() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.stories.set([]);
    this.selectedStory.set(null);

    // Orchestrate the WIQL + Detail fetch logic here
    if (this.azure.config().isDemoMode) {
      this.azure.searchUserStories().subscribe({
        next: (items) => {
          this.stories.set(items);
          this.isLoading.set(false);
        },
        error: (e) => this.handleError(e)
      });
      return;
    }

    // Real API Chain
    const conf = this.azure.config();
    if (!conf.organization || !conf.project || !conf.pat) {
      this.errorMessage.set('Missing configuration.');
      this.isLoading.set(false);
      return;
    }

    // Step 1: WIQL
    const query = `SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'User Story' AND [Custom.Dev] = '${conf.devEmail}' ORDER BY [System.ChangedDate] DESC`;
    // WIQL supports TOP through the query or by limiting result in processing. 
    // Azure API often prefers the project-level endpoint without the project in the URL for global WIQL, 
    // but for project-specific, the current URL is usually fine.
    // Let's ensure the URL and body are perfect.
    const urlWiql = `https://dev.azure.com/${conf.organization}/${conf.project}/_apis/wit/wiql?api-version=7.0`;
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(':' + conf.pat)}`
    };

    console.log('Fetching WIQL from:', urlWiql);
    this.http.post<WiqlResponse>(urlWiql, { query }, { headers }).pipe(
      // Step 2: Get Details
      switchMap(res => {
        if (!res.workItems || res.workItems.length === 0) return of([]);
        const ids = res.workItems.map(wi => wi.id).join(',');
        const urlDetails = `https://dev.azure.com/${conf.organization}/${conf.project}/_apis/wit/workitems?ids=${ids}&$expand=all&api-version=7.0`;
        return this.http.get<{value: WorkItem[]}>(urlDetails, { headers }).pipe(
           map(r => r.value)
        );
      }),
      // Step 3: Get Task Hours for Each US
      switchMap(items => {
        const usItems = items.filter(item => item.fields['System.WorkItemType'] === 'User Story');
        if (usItems.length === 0) return of([]);

        const taskDetailRequests = usItems.map(us => {
          const taskIds = us.relations
            ?.filter(rel => rel.rel === 'System.LinkTypes.Hierarchy-Forward')
            .map(rel => {
              const parts = rel.url.split('/');
              return parseInt(parts[parts.length - 1], 10);
            })
            .filter(id => !isNaN(id)) || [];

          if (taskIds.length === 0) {
            us.fields['Microsoft.VSTS.Scheduling.CompletedWork'] = 0;
            return of(us);
          }

          const urlTasks = `https://dev.azure.com/${conf.organization}/${conf.project}/_apis/wit/workitems?ids=${taskIds.join(',')}&api-version=7.0`;
          return this.http.get<{value: WorkItem[]}>(urlTasks, { headers }).pipe(
            map(r => {
              const totalCompleted = r.value
                .filter(t => t.fields['System.WorkItemType'] === 'Task')
                .reduce((acc, t) => acc + (t.fields['Microsoft.VSTS.Scheduling.CompletedWork'] || 0), 0);
              us.fields['Microsoft.VSTS.Scheduling.CompletedWork'] = totalCompleted;
              return us;
            }),
            catchError(() => {
              us.fields['Microsoft.VSTS.Scheduling.CompletedWork'] = 0;
              return of(us);
            })
          );
        });

        return forkJoin(taskDetailRequests);
      }),
      catchError(err => {
        throw err;
      })
    ).subscribe({
      next: (items) => {
        this.stories.set(items as WorkItem[]);
        this.isLoading.set(false);
      },
      error: (e) => this.handleError(e)
    });
  }

  selectStory(item: WorkItem) {
    // If it's real data, we might want to fetch more details (like relations) specifically for this item
    // But for now, the bulk fetch has basics. Let's do a specific fetch if needed, 
    // but to keep it snappy, we'll just use what we have or do a background refresh.
    // For full description/relations, let's fetch individual
    
    this.isLoading.set(true);
    this.azure.getWorkItem(item.id).subscribe({
      next: (fullItem) => {
        this.selectedStory.set(fullItem);
        this.isLoading.set(false);
      },
      error: (e) => {
        console.error('Error fetching detail', e);
        // Fallback to what we have in list
        this.selectedStory.set(item);
        this.isLoading.set(false);
      }
    });
  }

  handleError(e: any) {
    console.error(e);
    this.isLoading.set(false);
    if (e.status === 401) {
      this.errorMessage.set('Unauthorized. Check your PAT.');
    } else if (e.status === 404) {
      this.errorMessage.set('Project/Org not found.');
    } else {
      this.errorMessage.set('Connection failed. Likely CORS or Network error.');
    }
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
