
// anniversary.component.ts (updated)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnniversaryService } from '../../services/anniversary.service';
import { NotificationService } from '../../services/notification.service';
import { formatDate } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router} from '@angular/router';


// anniversary.model.ts

// Frontend models (for type safety in components)
export interface Product {
  id: number;
  name: string;
  price: number;
  size: string;
}

export interface Church {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  date: Date;
  church: Church;
  product: Product;
  qty: number;
  recorded_by: string;
}

export interface Receipt {
  id: number;
  date: Date;
  church: Church;
  product: Product;
  amount: number;
  method: 'cash' | 'momo' | 'transfer';
  deposited_at: 'local_treasury' | 'district_treasury';
  recorded_by: string;
}

export interface OrderDelivered {
  id: number;
  date: Date;
  church: Church;
  product: Product;
  qty: number;
  recorded_by: string;
}

// API Request models (what we send to backend)
export interface OrderRequest {
  church: number;  // Just the ID
  product: number; // Just the ID
  qty: number;
}

export interface ReceiptRequest {
  church: number;
  product: number;
  amount: number;
  method: 'cash' | 'momo' | 'transfer';
  deposited_at: 'local_treasury' | 'district_treasury';
}

export interface OrderDeliveredRequest {
  church: number;
  product: number;
  qty: number;
}


export interface DashboardMetrics {
  totalOrders: number;
  totalReceipts: number;
  totalExpectedValue: number;
  totalDelivered: number;
  ordersByChurch: ChurchOrder[];
  receiptsByChurch: ChurchReceipt[];
  ordersByProduct: ProductOrder[];
}



// New interfaces for the grouped data
export interface ChurchOrder {
  church: string;
  products: ProductOrder[];
}

export interface ChurchReceipt {
  church: string;
  products: ProductReceipt[];
}

export interface ProductOrder {
  product: string;
  count: number;
  value: number;
  qty:number;
}

export interface ProductReceipt {
  product: string;
  amount: number;
}


@Component({
  selector: 'app-anniversary',
  standalone: false,
  templateUrl: './anniversary.component.html',
  styleUrl: './anniversary.component.css'
})

export class AnniversaryComponent implements OnInit {

   // ... other properties ...
  metrics: DashboardMetrics = {
    totalOrders: 0,
    totalReceipts: 0,
    totalExpectedValue: 0,
    totalDelivered: 0,
    ordersByChurch: [],
    receiptsByChurch: [],
    ordersByProduct: []
  };


  activeForm: 'order' | 'receipt' | 'delivery' | null = null;
  products: Product[] = [];
  ordersVsDeliveries: any[] = [];
  
  // Loading states
  loading = {
    products: false,
    churches: false,
    metrics: false,
    deliveries: false,
    submitting: false
  };

  orderForm: FormGroup;
  receiptForm: FormGroup;
  deliveryForm: FormGroup;


  // Hardcoded churches - match your backend CHURCH_CHOICES
  churches = [
    { id: 'Achimota', name: 'Achimota' },
    { id: 'Prince of Peace', name: 'Prince of Peace' },
    { id: 'King of Glory', name: 'King of Glory' },
    { id: 'Nii Boi Town', name: 'Nii Boi Town' },
    { id: 'Israel', name: 'Israel' }
  ];

  constructor(
    private router : Router,
    private authService: AuthService,
    private notification: NotificationService,
    private anniversaryService: AnniversaryService,
    private fb: FormBuilder
  ) {
    this.orderForm = this.createOrderForm();
    this.receiptForm = this.createReceiptForm();
    this.deliveryForm = this.createDeliveryForm();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadProducts();
    this.loadMetrics();
    this.loadOrdersVsDeliveries();
  }

  loadProducts() {
    this.loading.products = true;
    this.anniversaryService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading.products = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.products = false;
        alert('Error loading products: ' + error.message);
      }
    });
  }


  // loadChurches() {
  //   this.loading.churches = true;
  //   this.anniversaryService.getChurches().subscribe({
  //     next: (churches) => {
  //       this.churches = churches;
  //       this.loading.churches = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading churches:', error);
  //       this.loading.churches = false;
  //       alert('Error loading churches: ' + error.message);
  //     }
  //   });
  // }


  loadMetrics() {
    this.loading.metrics = true;
    this.anniversaryService.getDashboardMetrics().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading.metrics = false;
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        this.loading.metrics = false;
        alert('Error loading dashboard metrics: ' + error.message);
      }
    });
  }

  loadOrdersVsDeliveries() {
    this.loading.deliveries = true;
    this.anniversaryService.getOrdersVsDeliveries().subscribe({
      next: (data) => {
        this.ordersVsDeliveries = data;
        this.loading.deliveries = false;
      },
      error: (error) => {
        console.error('Error loading orders vs deliveries:', error);
        this.loading.deliveries = false;
        alert('Error loading delivery data: ' + error.message);
      }
    });
  }

  createOrderForm(): FormGroup {
    return this.fb.group({
      church: ['', Validators.required],
      product: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]]
    });
  }

  createReceiptForm(): FormGroup {
    return this.fb.group({
      church: ['', Validators.required],
      product: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      method: ['cash', Validators.required],
      deposited_at: ['local_treasury', Validators.required]
    });
  }

  createDeliveryForm(): FormGroup {
    return this.fb.group({
      church: ['', Validators.required],
      product: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]]
    });
  }

  toggleForm(formType: 'order' | 'receipt' | 'delivery') {
    this.activeForm = this.activeForm === formType ? null : formType;
  }

  submitOrder() {
    if (this.orderForm.valid && confirm('Are you sure you want to submit this order?')) {
      this.loading.submitting = true;
      const formValue = this.orderForm.value;
      
      // Map form values to API expected format
      const orderData = {
        church: formValue.church,
        product: formValue.product,
        qty: formValue.qty
        // date and recorded_by will be handled by backend
      };

      this.anniversaryService.submitOrder(orderData).subscribe({
        next: () => {
          this.orderForm.reset();
          this.activeForm = null;
          this.loadMetrics();
          this.loadOrdersVsDeliveries();
          this.loading.submitting = false;
          this.notification.success('Order submitted successfully!')
          // alert('Order submitted successfully!');
        },
        error: (error) => {
          console.error('Error submitting order:', error);
          this.loading.submitting = false;
          this.notification.error('Error submitting order: ' + error.message)
          alert('Error submitting order: ' + error.message);
        }
      });
    }
  }

  submitReceipt() {
    if (this.receiptForm.valid && confirm('Are you sure you want to submit this receipt?')) {
      this.loading.submitting = true;
      const formValue = this.receiptForm.value;
      
      const receiptData = {
        church: formValue.church,
        product: formValue.product,
        amount: formValue.amount,
        method: formValue.method,
        deposited_at: formValue.deposited_at
      };

      this.anniversaryService.submitReceipt(receiptData).subscribe({
        next: () => {
          this.receiptForm.reset();
          this.activeForm = null;
          this.loadMetrics();
          this.loading.submitting = false;
          this.notification.success('submitted successfully!')
          // alert('Receipt submitted successfully!');
        },
        error: (error) => {
          console.error('Error submitting receipt:', error);
          this.loading.submitting = false;
          alert('Error submitting receipt: ' + error.message);
        }
      });
    }
  }

  submitDelivery() {
    if (this.deliveryForm.valid && confirm('Are you sure you want to submit this delivery?')) {
      this.loading.submitting = true;
      const formValue = this.deliveryForm.value;
      
      const deliveryData = {
        church: formValue.church,
        product: formValue.product,
        qty: formValue.qty
      };

      this.anniversaryService.submitOrderDelivered(deliveryData).subscribe({
        next: () => {
          this.deliveryForm.reset();
          this.activeForm = null;
          this.loadMetrics();
          this.loadOrdersVsDeliveries();
          this.loading.submitting = false;
          this.notification.success('submitted successfully!')
          // alert('Delivery recorded successfully!');
        },
        error: (error) => {
          console.error('Error submitting delivery:', error);
          this.loading.submitting = false;
          alert('Error submitting delivery: ' + error.message);
        }
      });
    }
  }

  getCompletionClass(orders: number, deliveries: number): string {
    const percent = orders > 0 ? (deliveries / orders) * 100 : 0;
    if (percent >= 80) return 'bg-success';
    if (percent >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  getCompletionPercent(orders: number, deliveries: number): number {
    if (orders === 0) return 0;
    return Math.round((deliveries / orders) * 100);
  }

  // Export functionality
  exportOrders() {
    
      this.anniversaryService.exportOrdersReport().subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orders-report-${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          alert('Error exporting orders: ' + error.message);
        }
      });
    
  }


   exportReceipts() {
    
      this.anniversaryService.exportReceiptsReport().subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipts-report-${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          alert('Error exporting receipt: ' + error.message);
        }
      });
    
  }



// Add these methods to your AnniversaryComponent class

getChurchTotalOrders(churchData: any): number {
    if (!churchData?.products) return 0;
    return churchData.products.reduce((total: number, product: any) => total + product.count, 0);
}

getChurchTotalValue(churchData: any): number {
    if (!churchData?.products) return 0;
    return churchData.products.reduce((total: number, product: any) => total + product.value, 0);
}

isLast(item: any, array: any[]): boolean {
    if (!array) return true;
    return array.indexOf(item) === array.length - 1;
}



// Add this method to your AnniversaryComponent class
getChurchTotalReceipts(churchData: any): number {
    if (!churchData?.products) return 0;
    return churchData.products.reduce((total: number, product: any) => total + product.amount, 0);
}



// Add this method to your component
getPendingClass(pending: number): string {
    if (pending === 0) return 'text-success';
    if (pending > 0) return 'text-warning';
    return 'text-danger';
}


// Add these methods to your AnniversaryComponent

getProductContribution(productValue: number): number {
    if (!this.metrics?.totalExpectedValue || this.metrics.totalExpectedValue === 0) return 0;
    return Math.round((productValue / this.metrics.totalExpectedValue) * 100);
}

getProductColor(productName: string): string {
    // Generate consistent colors based on product name
    const colors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
        '#9b59b6', '#1abc9c', '#d35400', '#34495e',
        '#16a085', '#c0392b', '#2980b9', '#8e44ad'
    ];
    
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
        hash = productName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}


 logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }


}
