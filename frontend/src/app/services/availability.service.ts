import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { BehaviorSubject, EMPTY, interval, switchMap, tap, catchError, startWith, throwError } from 'rxjs';

const HEALTH_URL = 'http://localhost:8080/api/health';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private available$ = new BehaviorSubject<boolean>(true);

  backendAvailable$ = this.available$.asObservable();

  constructor(private http: HttpClient) {}

  startMonitoring() {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.http.get(HEALTH_URL, { responseType: 'text' }).pipe(
            tap(() => this.setAvailable(true)),
            catchError(() => {
              this.setAvailable(false);
              return EMPTY;
            })
          )
        )
      )
      .subscribe();
  }

  setAvailable(value: boolean) {
    if (this.available$.value !== value) {
      this.available$.next(value);
    }
  }
}

export const availabilityInterceptor: HttpInterceptorFn = (req, next) => {
  const service = inject(AvailabilityService);
  return next(req).pipe(
    tap(() => {
      service.setAvailable(true);
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        service.setAvailable(false);
      }
      return throwError(() => error);
    })
  );
};


