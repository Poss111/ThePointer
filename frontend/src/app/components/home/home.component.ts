import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h1>🎯 Pointer</h1>
        <p style="color: #666; margin-bottom: 30px;">Create or join an agile story pointing session</p>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="storyName">Story Name</label>
          <input
            id="storyName"
            type="text"
            [(ngModel)]="storyName"
            placeholder="Enter story name"
            [disabled]="isCreating"
          />
        </div>

        <div class="form-group">
          <label for="creatorName">Your Name</label>
          <input
            id="creatorName"
            type="text"
            [(ngModel)]="creatorName"
            placeholder="Enter your name"
            [disabled]="isCreating"
          />
        </div>

        <button (click)="createSession()" [disabled]="!storyName || !creatorName || isCreating">
          {{ isCreating ? 'Creating...' : 'Create Session' }}
        </button>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;" />

        <h2>Join Existing Session</h2>

        <div class="form-group">
          <label for="sessionId">Session ID</label>
          <input
            id="sessionId"
            type="text"
            [(ngModel)]="joinSessionId"
            placeholder="Enter session ID"
            [disabled]="isJoining"
          />
        </div>

        <div class="form-group">
          <label for="participantName">Your Name</label>
          <input
            id="participantName"
            type="text"
            [(ngModel)]="participantName"
            placeholder="Enter your name"
            [disabled]="isJoining"
          />
        </div>

        <button (click)="joinSession()" [disabled]="!joinSessionId || !participantName || isJoining" class="secondary">
          {{ isJoining ? 'Joining...' : 'Join Session' }}
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent {
  storyName = '';
  creatorName = '';
  joinSessionId = '';
  participantName = '';
  isCreating = false;
  isJoining = false;
  errorMessage = '';

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  createSession() {
    if (!this.storyName.trim() || !this.creatorName.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isCreating = true;
    this.errorMessage = '';

    this.sessionService.createSession({
      storyName: this.storyName.trim(),
      creatorName: this.creatorName.trim()
    }).subscribe({
      next: (response) => {
        this.router.navigate(['/session', response.sessionId], {
          queryParams: { participantName: response.creatorName }
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to create session. Please try again.';
        this.isCreating = false;
      }
    });
  }

  joinSession() {
    if (!this.joinSessionId.trim() || !this.participantName.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isJoining = true;
    this.errorMessage = '';

    this.sessionService.joinSession(this.joinSessionId.trim(), {
      participantName: this.participantName.trim()
    }).subscribe({
      next: (response) => {
        this.router.navigate(['/session', response.sessionId], {
          queryParams: { participantName: this.participantName.trim() }
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to join session. Please check the session ID and try again.';
        this.isJoining = false;
      }
    });
  }
}

