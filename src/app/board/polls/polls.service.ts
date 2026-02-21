import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Poll {
  id: number;
  title: string;
  description: string;
  type: 'feedback' | 'test';
  active_from: string | null;
  active_to: string | null;
  time_limit: number | null;
  created_at: string;
  authorName: string;
  submitted_at?: Date;
  questionCount?: number;
}

export interface Question {
  id: number;
  title: string;
  type: 'text' | 'single' | 'multiple';
  points: number;
  order: number;
  options?: Option[];
}

export interface Option {
  id: number;
  label: string;
  order: number;
  is_correct?: boolean; // Only visible if allowed
}

export interface PollResponse {
  id: number;
  started_at: string;
  submitted_at: string;
  total_score: number;
  total_max_score: number;
  percentage: number;
}

// Helper type to avoid rigorous RxJS typing if environment differs
type ObservableLike<T> = Observable<T>;

@Injectable({
  providedIn: 'root'
})
export class PollsService {
  private http = inject(HttpClient);
  public selectedPollId$ = new BehaviorSubject<number | null>(null);

  public getPolls(): ObservableLike<{ polls: Poll[], canCreate: boolean }> {
    return this.http.get<{ polls: Poll[], canCreate: boolean }>(
      `${Config.API_URL}/v1/polls`,
      { withCredentials: true }
    ) as any;
  }

  public getPoll(id: number): ObservableLike<{ poll: Poll, questions: Question[], submission: PollResponse | null, assignment?: any }> {
    return this.http.get<any>(
      `${Config.API_URL}/v1/polls/${id}`,
      { withCredentials: true }
    ) as any;
  }

  public createPoll(data: any): ObservableLike<{ success: boolean, id: number }> {
    return this.http.post<any>(
      `${Config.API_URL}/v1/polls`,
      data,
      { withCredentials: true }
    ) as any;
  }

  public submitPoll(id: number, answers: any[]): ObservableLike<{ success: boolean, score: number, max: number }> {
    return this.http.post<any>(
      `${Config.API_URL}/v1/polls/${id}/submit`,
      { answers },
      { withCredentials: true }
    ) as any;
  }

  public getResults(id: number): ObservableLike<any> {
    return this.http.get<any>(
      `${Config.API_URL}/v1/polls/${id}/results`,
      { withCredentials: true }
    ) as any;
  }
  
  public getStudentSubmission(pollId: number, studentId: number): ObservableLike<any> {
    return this.http.get<any>(
      `${Config.API_URL}/v1/polls/${pollId}/student/${studentId}`,
      { withCredentials: true }
    ) as any;
  }

  public gradeStudent(pollId: number, studentId: number, updates: any[]): ObservableLike<any> {
    return this.http.post<any>(
      `${Config.API_URL}/v1/polls/${pollId}/student/${studentId}/grade`,
      { updates },
      { withCredentials: true }
    ) as any;
  }

  public sharePoll(id: number, teacherId: number): ObservableLike<{ success: boolean }> {
    return this.http.post<any>(
      `${Config.API_URL}/v1/polls/${id}/share`,
      { teacherId },
      { withCredentials: true }
    ) as any;
  }

  public getShares(id: number): ObservableLike<{ shares: any[] }> {
    return this.http.get<any>(
      `${Config.API_URL}/v1/polls/${id}/shares`,
      { withCredentials: true }
    ) as any;
  }

  public removeShare(pollId: number, shareId: number): ObservableLike<{ success: boolean }> {
    return this.http.delete<any>(
      `${Config.API_URL}/v1/polls/${pollId}/shares/${shareId}`,
      { withCredentials: true }
    ) as any;
  }

  public updatePoll(id: number, data: any): ObservableLike<{ success: boolean }> {
    return this.http.put<any>(
      `${Config.API_URL}/v1/polls/${id}`,
      data,
      { withCredentials: true }
    ) as any;
  }
  public startPoll(id: number): ObservableLike<{ success: boolean, responseId: number }> {
    return this.http.post<any>(
      `${Config.API_URL}/v1/polls/${id}/start`,
      {},
      { withCredentials: true }
    ) as any;
  }

  public sendAnswer(id: number, data: { questionId: number, answerText?: string, optionId?: number, optionIds?: number[] }): ObservableLike<{ success: boolean }> {
    return this.http.post<any>(
      `${Config.API_URL}/v1/polls/${id}/answer`,
      data,
      { withCredentials: true }
    ) as any;
  }
}
