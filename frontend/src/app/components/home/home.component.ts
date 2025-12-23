import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService, SessionSummary } from '../../services/session.service';

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

      <button class="history-toggle" (click)="toggleHistory()">
        {{ showHistory ? 'Hide history' : 'Show history' }}
      </button>

      <div class="history-tab" [class.open]="showHistory">
        <div class="history-header">
          <h3>Today’s sessions</h3>
          <button class="secondary" (click)="toggleHistory()" style="margin-left: auto;">
            {{ showHistory ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div *ngIf="historyError" class="error-message" style="margin-top: 10px;">
          {{ historyError }}
        </div>
        <div *ngIf="sessionHistory.length === 0 && !historyError" style="color: #666; margin-top: 10px;">
          No sessions yet today.
        </div>
        <div class="history-list" *ngIf="sessionHistory.length > 0">
          <div *ngFor="let item of sessionHistory" class="history-item">
            <div style="font-weight: bold;">{{ item.storyName }}</div>
            <div style="color: #666;">{{ item.creatorName }} • {{ item.createdAt | date:'shortTime' }}</div>
            <div style="margin-top: 6px;">
              <span class="badge">ID: {{ item.sessionId }}</span>
              <span class="badge" [class.active]="item.votingStarted">{{ item.votingStarted ? 'In progress' : 'Not started' }}</span>
            </div>
            <button class="secondary" style="margin-top: 8px;" (click)="goToSession(item.sessionId)">
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-tab {
      position: fixed;
      right: 0;
      top: 0;
      height: 100vh;
      width: 320px;
      background: #f8f9ff;
      border-left: 1px solid #e0e0e0;
      padding: 20px;
      box-shadow: -4px 0 12px rgba(0,0,0,0.04);
      transform: translateX(100%);
      transition: transform 0.2s ease-in-out;
      overflow-y: auto;
      z-index: 10;
    }
    .history-tab.open {
      transform: translateX(0);
    }
    .history-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .history-list {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .history-item {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 999px;
      background: #eef2ff;
      color: #4c51bf;
      font-size: 12px;
      margin-right: 6px;
    }
    .badge.active {
      background: #e6fffa;
      color: #0b9e7c;
    }
    .history-toggle {
      position: fixed;
      right: 12px;
      bottom: 20px;
      z-index: 11;
    }
  `]
})
export class HomeComponent implements OnInit {
  storyName = '';
  creatorName = '';
  joinSessionId = '';
  participantName = '';
  isCreating = false;
  isJoining = false;
  errorMessage = '';
  sessionHistory: SessionSummary[] = [];
  historyError = '';
  showHistory = false;

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSavedName();
    this.loadHistory();
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
    if (this.showHistory && this.sessionHistory.length === 0) {
      this.loadHistory();
    }
  }

  loadHistory() {
    this.historyError = '';
    this.sessionService.getSessionHistory().subscribe({
      next: (sessions) => {
        this.sessionHistory = sessions;
      },
      error: () => {
        this.historyError = 'Unable to load session history right now.';
      }
    });
  }

  goToSession(sessionId: string) {
    if (!this.participantName.trim()) {
      this.errorMessage = 'Enter your name before opening a session from history.';
      return;
    }
    this.router.navigate(['/session', sessionId], {
      queryParams: { participantName: this.participantName.trim() }
    });
  }

  createSession() {
    if (!this.storyName.trim() || !this.creatorName.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isCreating = true;
    this.errorMessage = '';

    const creatorName = this.creatorName.trim();
    this.sessionService.createSession({
      storyName: this.storyName.trim(),
      creatorName
    }).subscribe({
      next: (response) => {
        this.saveDefaultName(creatorName);
        this.saveSessionName(response.sessionId, creatorName);
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

    const participantName = this.participantName.trim();
    const sessionId = this.joinSessionId.trim();
    this.sessionService.joinSession(sessionId, {
      participantName
    }).subscribe({
      next: (response) => {
        this.saveDefaultName(participantName);
        this.saveSessionName(sessionId, participantName);
        this.router.navigate(['/session', response.sessionId], {
          queryParams: { participantName }
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to join session. Please check the session ID and try again.';
        this.isJoining = false;
      }
    });
  }

  private loadSavedName() {
    const saved = localStorage.getItem('pointer_default_name');
    if (saved) {
      this.creatorName = saved;
      this.participantName = saved;
    }
  }

  private saveDefaultName(name: string) {
    localStorage.setItem('pointer_default_name', name);
  }

  private saveSessionName(sessionId: string, name: string) {
    try {
      const raw = localStorage.getItem('pointer_session_names');
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[sessionId] = name;
      localStorage.setItem('pointer_session_names', JSON.stringify(parsed));
    } catch (e) {
      console.warn('Failed to persist session name', e);
    }
  }
}

