import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService, SessionResponse, VoteResponse } from '../../services/session.service';
import { RealtimeService, SessionUpdateMessage } from '../../services/realtime.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="session-info">
          <h2>{{ session?.storyName }}</h2>
          <p>Session ID: <span class="session-id">{{ sessionId }}</span></p>
          <p *ngIf="session?.isCreator" style="color: #667eea; font-weight: bold; margin-top: 10px;">
            👑 You are the creator
          </p>
          <button class="secondary" style="margin-top: 10px;" (click)="leaveSession()" [disabled]="isLeaving">
            {{ isLeaving ? 'Leaving...' : 'Leave session' }}
          </button>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- Waiting for voting to start -->
        <div *ngIf="session && !session.votingStarted">
          <h3>Participants ({{ session.participants.length }}/15)</h3>
          <div class="participants-list">
            <span
              *ngFor="let participant of session.participants"
              class="participant-badge"
              [class.creator]="participant === session.creatorName"
            >
              {{ participant }} {{ participant === session.creatorName ? '👑' : '' }}
            </span>
          </div>

          <div *ngIf="session.isCreator" style="margin-top: 30px;">
            <button
              (click)="startVoting()"
              [disabled]="session.participants.length < 1 || isStarting"
            >
              {{ isStarting ? 'Starting...' : 'Start Voting' }}
            </button>
          </div>

          <div *ngIf="!session.isCreator" style="margin-top: 30px; color: #666;">
            Waiting for creator to start voting...
          </div>
        </div>

        <!-- Voting in progress -->
        <div *ngIf="session && session.votingStarted">
          <div class="timer" [class.warning]="remainingSeconds <= 10 && remainingSeconds > 5" 
               [class.danger]="remainingSeconds <= 5">
            {{ formatTime(remainingSeconds) }}
          </div>

        <div *ngIf="session?.isCreator && allVoted() && remainingSeconds > 0" style="margin: 10px 0;">
          <button (click)="concludeVoting()" [disabled]="isSubmitting">
            Conclude Now (all votes in)
          </button>
        </div>

          <div class="participants-status" *ngIf="session?.participants?.length">
            <div
              *ngFor="let participant of session.participants"
              class="participant-status"
              [class.voted]="hasVoted(participant)"
              [class.me]="participant === participantName"
            >
              <span>{{ participant }}</span>
              <span class="status-pill">
                {{ hasVoted(participant) ? 'Voted' : 'Waiting' }}
              </span>
            </div>
          </div>

          <h3>Select your points:</h3>
          <div class="voting-grid">
            <div
              *ngFor="let point of fibonacciPoints"
              class="vote-card"
              [class.selected]="selectedPoints === point"
              (click)="selectPoints(point)"
            >
              {{ point }}
            </div>
          </div>

          <div *ngIf="selectedPoints !== null" style="margin-top: 20px;">
            <button (click)="submitVote()" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit Vote' }}
            </button>
            <button (click)="selectedPoints = null" class="secondary" style="margin-left: 10px;">
              Clear Selection
            </button>
          </div>

          <div *ngIf="myVote !== null" class="success-message" style="margin-top: 20px;">
            ✓ You voted: {{ myVote.points }} points
          </div>
        </div>

        <!-- Timer expired or voting ended -->
        <div *ngIf="session && session.votingStarted && remainingSeconds <= 0" style="margin-top: 30px;">
          <h3>Time's up! Voting has ended.</h3>
          <div class="votes-summary">
            <h4>Votes Summary:</h4>
            <div *ngFor="let vote of votes" class="vote-item" [class.own-vote]="vote.isOwnVote">
              <span>{{ vote.participantName }}</span>
              <span style="font-weight: bold;">{{ vote.points }} points</span>
            </div>
          </div>

          <div *ngIf="session.isCreator" style="margin-top: 30px;">
            <h4>Start a new story</h4>
            <input
              type="text"
              [(ngModel)]="newStoryName"
              placeholder="Enter next story name"
              [disabled]="isResetting"
              style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;"
            />
            <button (click)="startNewStory()" [disabled]="isResetting">
              {{ isResetting ? 'Creating...' : 'Create Next Story' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .participants-status {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      margin: 15px 0;
    }
    .participant-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
    }
    .participant-status.me {
      border-color: #667eea;
      background: #eef2ff;
    }
    .participant-status.voted {
      border-color: #0b9e7c;
      background: #e6fffa;
    }
    .participant-status span {
      font-size: 14px;
    }
    .status-pill {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
    .participant-status.voted .status-pill {
      background: #dcfce7;
      color: #15803d;
      border-color: #bbf7d0;
    }
  `]
})
export class SessionComponent implements OnInit, OnDestroy {
  sessionId = '';
  participantName = '';
  session: SessionResponse | null = null;
  votes: VoteResponse[] = [];
  selectedPoints: number | null = null;
  myVote: VoteResponse | null = null;
  remainingSeconds = 0;
  // Classic Fibonacci planning-poker values
  fibonacciPoints = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  isStarting = false;
  isResetting = false;
  isLeaving = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  newStoryName = '';
  private timerSubscription?: Subscription;
  private realtimeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private realtimeService: RealtimeService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    this.participantName = this.route.snapshot.queryParamMap.get('participantName') || '';
    if (!this.participantName) {
      const saved = this.getSavedName(this.sessionId);
      if (saved) {
        this.participantName = saved;
      }
    }

    if (!this.sessionId || !this.participantName) {
      this.router.navigate(['/']);
      return;
    }

    this.loadSession();
    this.connectRealtime();
  }

  ngOnDestroy() {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }
    this.leaveIfPossible();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadSession() {
    this.sessionService.getSession(this.sessionId, this.participantName).subscribe({
      next: (session) => {
        this.session = session;
        this.session.isCreator = session.creatorName === this.participantName;
        this.saveSessionName(this.sessionId, this.participantName);
        if (session.votingStarted) {
          this.remainingSeconds = session.remainingSeconds || 0;
          this.startTimer();
          this.loadVotes();
        } else {
          this.stopTimer();
          this.remainingSeconds = 0;
          this.votes = [];
          this.myVote = null;
          this.selectedPoints = null;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load session. Redirecting...';
        setTimeout(() => this.router.navigate(['/']), 2000);
      }
    });
  }

  loadVotes() {
    this.sessionService.getVotes(this.sessionId, this.participantName).subscribe({
      next: (votes) => {
        this.votes = votes;
        this.myVote = votes.find(v => v.isOwnVote) || null;
        if (this.myVote) {
          this.selectedPoints = this.myVote.points;
        }
      },
      error: (error) => {
        console.error('Failed to load votes', error);
      }
    });
  }

  startTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.session && this.session.votingStarted && this.remainingSeconds > 0) {
        this.remainingSeconds--;
        if (this.remainingSeconds <= 0) {
          this.loadVotes(); // Load all votes when timer expires
        }
      }
    });
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  startVoting() {
    if (!this.session || !this.session.isCreator) {
      return;
    }

    this.isStarting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.sessionService.startVoting(this.sessionId, this.session.creatorName).subscribe({
      next: (session) => {
        this.session = session;
        this.remainingSeconds = session.remainingSeconds || 0;
        this.startTimer();
        this.isStarting = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to start voting. Please try again.';
        this.isStarting = false;
      }
    });
  }

  selectPoints(points: number) {
    if (this.remainingSeconds > 0) {
      this.selectedPoints = points;
    }
  }

  submitVote() {
    if (this.selectedPoints === null || !this.session) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.sessionService.submitVote(this.sessionId, {
      participantName: this.participantName,
      points: this.selectedPoints
    }).subscribe({
      next: (vote) => {
        this.myVote = vote;
        this.successMessage = 'Vote submitted successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to submit vote. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  startNewStory() {
    if (!this.session || !this.session.isCreator) {
      return;
    }
    const trimmedName = this.newStoryName.trim();
    if (!trimmedName) {
      this.errorMessage = 'Please enter a story name.';
      return;
    }

    this.isResetting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.sessionService.startNewStory(this.sessionId, {
      storyName: trimmedName,
      creatorName: this.session.creatorName
    }).subscribe({
      next: (session) => {
        this.session = session;
        this.newStoryName = '';
        this.stopTimer();
        this.remainingSeconds = 0;
        this.votes = [];
        this.myVote = null;
        this.selectedPoints = null;
        this.isResetting = false;
        this.successMessage = 'New story created. Waiting to start voting.';
      },
      error: () => {
        this.errorMessage = 'Failed to start new story. Please try again.';
        this.isResetting = false;
      }
    });
  }

  connectRealtime() {
    if (this.realtimeSubscription) {
      return;
    }
    this.realtimeSubscription = this.realtimeService.connectToSession(this.sessionId).subscribe({
      next: (message: SessionUpdateMessage) => this.handleRealtime(message),
      error: () => {
        // reconnect handled by stomp client; ignore errors here
      }
    });
  }

  concludeVoting() {
    if (!this.session || !this.session.isCreator) {
      return;
    }
    this.isSubmitting = true;
    this.sessionService.endVoting(this.sessionId, this.session.creatorName).subscribe({
      next: (session) => {
        this.session = session;
        this.remainingSeconds = session.remainingSeconds || 0;
        if (this.remainingSeconds <= 0) {
          this.stopTimer();
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to conclude voting early.';
        this.isSubmitting = false;
      }
    });
  }

  handleRealtime(message: SessionUpdateMessage) {
    if (message.type === 'SESSION_CLOSED') {
      this.errorMessage = 'Session has ended.';
      this.stopTimer();
      setTimeout(() => this.router.navigate(['/']), 1500);
      return;
    }
    if (!message.session) {
      return;
    }

    const session = message.session;
    session.isCreator = session.creatorName === this.participantName;
    this.session = session;
    this.saveSessionName(this.sessionId, this.participantName);

    if (session.votingStarted) {
      this.remainingSeconds = session.remainingSeconds || 0;
      this.startTimer();
    } else {
      this.stopTimer();
      this.remainingSeconds = 0;
      this.selectedPoints = null;
      this.myVote = null;
    }

    if (message.votes) {
      this.applyVotes(message.votes);
    }
  }

  private applyVotes(votes: VoteResponse[]) {
    this.votes = votes.map(v => ({
      ...v,
      isOwnVote: v.participantName === this.participantName
    }));
    this.myVote = this.votes.find(v => v.isOwnVote) || null;
    if (this.myVote) {
      this.selectedPoints = this.myVote.points;
    }
  }

  private getSavedName(sessionId: string): string | null {
    try {
      const raw = localStorage.getItem('pointer_session_names');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed[sessionId] || null;
    } catch {
      return null;
    }
  }

  private saveSessionName(sessionId: string, name: string) {
    try {
      const raw = localStorage.getItem('pointer_session_names');
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[sessionId] = name;
      localStorage.setItem('pointer_session_names', JSON.stringify(parsed));
    } catch {
      // ignore storage errors
    }
  }

  hasVoted(name: string): boolean {
    return this.votes.some(v => v.participantName === name);
  }

  allVoted(): boolean {
    if (!this.session) {
      return false;
    }
    return this.session.participants.every(p => this.hasVoted(p));
  }

  leaveSession() {
    if (!this.sessionId || this.isLeaving) {
      this.router.navigate(['/']);
      return;
    }

    this.isLeaving = true;
    this.sessionService.leaveSession(this.sessionId, {
      participantName: this.participantName
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        // Even if the request fails, navigate away to avoid stale state
        this.router.navigate(['/']);
      }
    });
  }

  private leaveIfPossible() {
    // Fire-and-forget leave; errors intentionally ignored
    if (!this.sessionId || !this.participantName) {
      return;
    }
    this.sessionService.leaveSession(this.sessionId, {
      participantName: this.participantName
    }).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

