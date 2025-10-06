// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AnniversaryService {

//   constructor() { }
// }



// anniversary.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, retry, catchError } from 'rxjs';
import { Product, Church, Order, Receipt, OrderDelivered, DashboardMetrics, OrderRequest, ReceiptRequest, OrderDeliveredRequest } from '../pages/anniversary/anniversary.component';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnniversaryService {
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }

  // Product endpoints
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/`).pipe(
      timeout(30000),
      retry(2),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
      })
    );
  }

  // Church endpoints
  getChurches(): Observable<Church[]> {
    return this.http.get<Church[]>(`${this.apiUrl}/churches/`).pipe(
      timeout(30000),
      retry(2),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
      })
    );
  }

 // Order endpoints
submitOrder(order: OrderRequest): Observable<Order> {
  return this.http.post<Order>(`${this.apiUrl}/orders/`, order).pipe(
    timeout(30000),
    retry(2),
    catchError(error => {
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/`).pipe(
      timeout(30000),
      retry(2),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
      })
    );
  }

  // Receipt endpoints
submitReceipt(receipt: ReceiptRequest): Observable<Receipt> {
  return this.http.post<Receipt>(`${this.apiUrl}/receipts/`, receipt).pipe(
    timeout(30000),
    retry(2),
    catchError(error => {
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}

  getReceipts(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(`${this.apiUrl}/receipts/`).pipe(
      timeout(30000),
      retry(2),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
      })
    );
  }

 
  // OrderDelivered endpoints
submitOrderDelivered(delivery: OrderDeliveredRequest): Observable<OrderDelivered> {
  return this.http.post<OrderDelivered>(`${this.apiUrl}/order-deliveries/`, delivery).pipe(
    timeout(30000),
    retry(2),
    catchError(error => {
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    })
  );
}

  getOrderDeliveries(): Observable<OrderDelivered[]> {
    return this.http.get<OrderDelivered[]>(`${this.apiUrl}/order-deliveries/`).pipe(
      timeout(30000),
      retry(2),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
      })
    );
  }

  // Dashboard metrics endpoint
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/anniversary/dashboard-metrics/`).pipe(
      timeout(30000),
      retry(2),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
      })
    );
  }

  // Orders vs Deliveries endpoint
  getOrdersVsDeliveries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/anniversary/orders-vs-deliveries/`).pipe(
      timeout(30000),
      retry(2),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
      })
    );
  }


  // anniversary.service.ts
exportOrdersReport(): Observable<any> {
  return this.http.get(`${this.apiUrl}/orders/export_orders/`, { 
    responseType: 'blob' 
  }).pipe(
    timeout(60000),
    retry(2),
    catchError(error => {
      if (error.name === 'TimeoutError') {
        throw new Error('Export request timed out. Please try again.');
      }
      throw error;
    })
  );
}

exportReceiptsReport(): Observable<any> {
  return this.http.get(`${this.apiUrl}/receipts/export_receipts/`, { 
    responseType: 'blob' 
  }).pipe(
    timeout(60000),
    retry(2),
    catchError(error => {
      if (error.name === 'TimeoutError') {
        throw new Error('Export request timed out. Please try again.');
      }
      throw error;
    })
  );
}

}
