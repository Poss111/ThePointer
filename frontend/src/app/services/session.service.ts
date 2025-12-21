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
}

export interface VoteResponse {
  participantName: string;
  points: number;
  isOwnVote: boolean;
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
}

