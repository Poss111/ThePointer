import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvailabilityService } from './services/availability.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>

    <div class="offline-overlay" *ngIf="!backendAvailable">
      <div class="offline-card">
        <h2>Backend unavailable</h2>
        <p>The server cannot be reached. Please try again later.</p>
      </div>
    </div>
  `,
  styles: [`
    .offline-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .offline-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 360px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Pointer';
  backendAvailable = true;
  private sub?: Subscription;

  constructor(private availabilityService: AvailabilityService) {}

  ngOnInit() {
    this.sub = this.availabilityService.backendAvailable$.subscribe(val => {
      this.backendAvailable = val;
    });
    this.availabilityService.startMonitoring();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}

