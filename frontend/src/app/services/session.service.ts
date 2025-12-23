import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/sessions';

export interface CreateSessionRequest {
  storyName: string;
  creatorName: string;
}

export interface JoinSessionRequest {
  participantName: string;
}

export interface SubmitVoteRequest {
  participantName: string;
  points: number;
}

export interface NewStoryRequest {
  storyName: string;
  creatorName: string;
}

export interface SessionResponse {
  sessionId: string;
  storyName: string;
  creatorName: string;
  votingStarted: boolean;
  votingStartTime?: string;
  timerDurationSeconds?: number;
  participants: string[];
  remainingSeconds?: number;
  isCreator: boolean;
  jiraIssue?: JiraIssueResponse | null;
}

export interface VoteResponse {
  participantName: string;
  points: number;
  isOwnVote: boolean;
}

export interface LeaveSessionRequest {
  participantName: string;
}

export interface SessionSummary {
  sessionId: string;
  storyName: string;
  creatorName: string;
  createdAt: string;
  votingStarted: boolean;
}

export interface JiraIssueRequest {
  issueKey: string;
}

export interface JiraIssueResponse {
  key: string;
  summary: string;
  status: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(private http: HttpClient) {}

  createSession(request: CreateSessionRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(API_URL, request);
  }

  joinSession(sessionId: string, request: JoinSessionRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${API_URL}/${sessionId}/join`, request);
  }

  startVoting(sessionId: string, creatorName: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${API_URL}/${sessionId}/start`, null, {
      params: { creatorName }
    });
  }

  endVoting(sessionId: string, creatorName: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${API_URL}/${sessionId}/end`, null, {
      params: { creatorName }
    });
  }

  submitVote(sessionId: string, request: SubmitVoteRequest): Observable<VoteResponse> {
    return this.http.post<VoteResponse>(`${API_URL}/${sessionId}/vote`, request);
  }

  getSession(sessionId: string, participantName: string): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`${API_URL}/${sessionId}`, {
      params: { participantName }
    });
  }

  getVotes(sessionId: string, participantName: string): Observable<VoteResponse[]> {
    return this.http.get<VoteResponse[]>(`${API_URL}/${sessionId}/votes`, {
      params: { participantName }
    });
  }

  startNewStory(sessionId: string, request: NewStoryRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${API_URL}/${sessionId}/story`, request);
  }

  leaveSession(sessionId: string, request: LeaveSessionRequest): Observable<void> {
    return this.http.post<void>(`${API_URL}/${sessionId}/leave`, request);
  }

  getSessionHistory(): Observable<SessionSummary[]> {
    return this.http.get<SessionSummary[]>(`${API_URL}/history`);
  }

  loadJiraIssueForSession(sessionId: string, issueKey: string, creatorName: string): Observable<JiraIssueResponse> {
    return this.http.post<JiraIssueResponse>(`http://localhost:8080/api/sessions/${sessionId}/jira`, { issueKey }, {
      params: { creatorName }
    });
  }
}

