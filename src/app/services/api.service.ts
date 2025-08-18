import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiService {



private apiUrl = environment.apiUrl;
 //private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL // Update with your Django API URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }




createActivity(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/activities/`, data).pipe(
    // Add timeout for slow networks
    timeout(30000),
    // Add retry logic for transient errors
    retry(2),
    catchError(error => {
      // Convert to more user-friendly error
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}




createBaptism(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/baptisms/`, data).pipe(
    // Add timeout for slow networks
    timeout(30000),
    // Add retry logic for transient errors
    retry(2),
    catchError(error => {
      // Convert to more user-friendly error
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}






createTransfer(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/transfers/`, data).pipe(
    // Add timeout for slow networks
    timeout(30000),
    // Add retry logic for transient errors
    retry(2),
    catchError(error => {
      // Convert to more user-friendly error
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}



createAttendance(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/attendance/`, data).pipe(
    // Add timeout for slow networks
    timeout(30000),
    // Add retry logic for transient errors
    retry(2),
    catchError(error => {
      // Convert to more user-friendly error
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}



createVisitor(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/visitors/`, data).pipe(
    // Add timeout for slow networks
    timeout(30000),
    // Add retry logic for transient errors
    retry(2),
    catchError(error => {
      // Convert to more user-friendly error
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}



createDedication(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/dedications/`, data).pipe(
    // Add timeout for slow networks
    timeout(30000),
    // Add retry logic for transient errors
    retry(2),
    catchError(error => {
      // Convert to more user-friendly error
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}



createEvent(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/events/`, data).pipe(
    // Add timeout for slow networks
    timeout(30000),
    // Add retry logic for transient errors
    retry(2),
    catchError(error => {
      // Convert to more user-friendly error
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}



createTreasury(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/treasury/`, data).pipe(
    // Add timeout for slow networks
    timeout(30000),
    // Add retry logic for transient errors
    retry(2),
    catchError(error => {
      // Convert to more user-friendly error
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}


getChurchSummary(
  startDate?: string,
  endDate?: string,
  service?: string,
  quarter?: string,
  status?: string
): Observable<any> {
  const params: any = {
    ...(startDate && { start_date: formatDate(startDate, 'yyyy-MM-dd', 'en-US') }),
    ...(endDate && { end_date: formatDate(endDate, 'yyyy-MM-dd', 'en-US') }),
    ...(service && { service }),
    ...(quarter && { quarter }),
    ...(status && { status }),
  };

  return this.http.get(`${this.apiUrl}/church-summary/`, { params }).pipe(
    timeout(30000),
    retry(2),
    catchError(error => {
      if (error.name === 'TimeoutError') {
        throw new Error('Summary request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}



getDepartmentSummary(
  startDate?: string,
  endDate?: string
): Observable<any> {
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('No token found in localStorage');
  }

  const headers = new HttpHeaders({
    Authorization: `Token ${token}`  // MUST match what DRF expects
  });

  const params: any = {
    ...(startDate && { start_date: formatDate(startDate, 'yyyy-MM-dd', 'en-US') }),
    ...(endDate && { end_date: formatDate(endDate, 'yyyy-MM-dd', 'en-US') }),
  };

  // console.log('Sending department summary request with token:', token);

  return this.http.get(`${this.apiUrl}/department-summary/`, {
    headers,
    params,
  }).pipe(
    timeout(30000),
    retry(2),
    catchError(error => {
      console.error('Request failed:', error);
      throw error;
    })
  );
}




 getExportableModels(): Observable<string[]> {
  return this.http.get<{ models: string[] }>(`${this.apiUrl}/export/models/`).pipe(
    map((res: { models: any; }) => res.models)
  );
}


getFilteredExportData(model: string): Observable<any[]> {
 
  const params = new HttpParams().set('model', model);

  return this.http.get<{ data: any[] }>(`${this.apiUrl}/export/data/`, {
    
    params
  }).pipe(map(res => res.data));
}

getActivityPdfReport(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/generate-activity-report/?start_date=${start}&end_date=${end}`);
}


getBaptismPdfReport(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/generate-baptism-report/?start_date=${start}&end_date=${end}`);
}

getTransferPdfReport(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/generate-transfer-report/?start_date=${start}&end_date=${end}`);
}

getDedicationPdfReport(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/generate-transfer-report/?start_date=${start}&end_date=${end}`);
}

getAttendancePdfReport(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/generate-attendance-report/?start_date=${start}&end_date=${end}`);
}

getVisitorPdfReport(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/generate-visitor-report/?start_date=${start}&end_date=${end}`);
}


getEventPdfReport(start: string, end: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/generate-event-report/?start_date=${start}&end_date=${end}`);
}



}
