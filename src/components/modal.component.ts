import { Component, input, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('modalAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px) scale(0.98)' }))
      ])
    ]),
    trigger('backdropAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div [@backdropAnim] class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" (click)="close.emit()">
      <div [@modalAnim] 
           [class]="'bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-full ' + maxWidth() + (fullHeight() ? ' h-full' : '')" 
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center" [ngClass]="headerClass()">
          <h2 class="text-lg font-bold flex items-center gap-2" [ngClass]="titleClass()">
            <ng-content select="[header-icon]"></ng-content>
            {{ title() }}
          </h2>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto" [ngClass]="bodyClass()">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div *ngIf="hasFooter()" class="p-6 bg-slate-50 dark:bg-slate-900/40 border-t border-gray-100 dark:border-slate-700">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  title = input.required<string>();
  maxWidth = input<string>('max-w-2xl');
  headerClass = input<string>('');
  titleClass = input<string>('');
  bodyClass = input<string>('p-8');
  hasFooter = input<boolean>(true);
  fullHeight = input<boolean>(false);
  
  close = output<void>();

  @HostListener('document:keydown.escape')
  onEsc() {
    this.close.emit();
  }
}
