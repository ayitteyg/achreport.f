import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-report-page',
  standalone: false,
  templateUrl: './report-page.component.html',
  styleUrl: './report-page.component.css'
})
export class ReportPageComponent {


  startDate!: Date;
  endDate!: Date;
  selectedModel: string = '';
  exportableModels: string[] = [];
  filteredData: { [key: string]: any }[] = [];
  availableFields: string[] = [];
  fieldSelections: { [key: string]: boolean } = {}; 
  selectedFields: string[] = [];
  username!: any;
  church!: string;
  department!: string;
  


    constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private notification: NotificationService,
    private apiService: ApiService,
    //private datePipe: DatePipe,

  ) {}

  ngOnInit(): void {
    this.loadExportModels();

    //Initialize selection defaults when data loads:
    this.fieldSelections = {};
    this.availableFields.forEach(field => {
      this.fieldSelections[field] = true;
    });
    this.updateSelectedFields();


    const currentUserString = localStorage.getItem('currentUser');
    let church = '';

    if (currentUserString) {
      const currentUser = JSON.parse(currentUserString);
      this.church = currentUser.church;
      this.department = currentUser.department;
    }

    this.username = localStorage.getItem('username');
  }



updateSelectedFields() {
  this.selectedFields = this.availableFields.filter(field => this.fieldSelections[field]);
}
  

loadExportModels() {
  this.apiService.getExportableModels().subscribe({
    next: (models) => {
      this.exportableModels = models;
    },
    error: (err) => {
      this.handleSubmissionError
    }
  });
}




loadExportData(): void {
  if (!this.selectedModel) return;

  this.apiService.getFilteredExportData(this.selectedModel).subscribe({
    next: (data) => {
      this.filteredData = data;

      if (data.length > 0) {
        this.availableFields = Object.keys(data[0]);  // Extract keys as fields
        this.fieldSelections = {};
        this.availableFields.forEach(field => {
          this.fieldSelections[field] = true;
        });
        this.updateSelectedFields();  // Optional, sync selectedFields
      } else {
        this.availableFields = [];
        this.fieldSelections = {};
      }
    },
    error: (err) => {
      console.error('Error loading export data:', err);
    }
  });
}




  
// Enhanced error handler
private handleSubmissionError(error: any): void {
  let errorMessage = 'Failed to fetch data';
  
  if (error.status === 400) {
    if (error.error) {
      // Handle date-specific errors
      const dateErrors: string[] = [];
      
      // Check each possible date field for errors
      ['startDate', 'endDate'].forEach(field => {
        if (error.error[field]) {
          dateErrors.push(`${field}: ${error.error[field].join(' ')}`);
        }
      });

      if (dateErrors.length > 0) {
        errorMessage = `Date errors:\n${dateErrors.join('\n')}`;
      } else {
        errorMessage = 'Validation errors: ' + 
          JSON.stringify(error.error, null, 2);
      }
    }
  } else if (error.status === 0) {
    errorMessage = 'Network error. Please check your connection.';
  } else if (error.status >= 500) {
    errorMessage = 'Server error. Please try again later.';
  }
  
  this.notification.error(errorMessage);
  console.error('Submission error details:', error);
}




formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // gives yyyy-MM-dd
}


formatDate2(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}


exportAsPDF(startDate: Date, endDate: Date): void {
  if (!startDate || !endDate || !this.selectedModel) {
    this.notification.info('Please all fields are required.');
    return;
  }

  const start = this.formatDate(startDate);
  const end = this.formatDate(endDate);

  const frm = this.formatDate2(new Date(start)); // "Jan 2025"
  const to = this.formatDate2(new Date(end)); // "Feb 2023"

  console.log('before calling api ..')

 //check the model selected
  switch (this.selectedModel) {

    //if model is activity
    case 'Activity':
          this.apiService.getActivityPdfReport(start, end).subscribe((rows) => {
          const doc = new jsPDF();
          let y = 15;

          console.log('calling api ..')

          // ... header stuff ...
          const titleFontSize = 14;
          const infoFontSize = 10;
        
        // === 1. Church Header ===
        doc.setFont('times', 'bold');
        doc.setFontSize(titleFontSize);
        doc.text("ACCRA CITY CONFERENCE OF SEVENTH-DAY ADVENTIST CHURCH", 105, y, { align: 'center' });

        y += 8;
        doc.text(`${this.church} CHURCH, ACHIMOTA-DISTRICT`, 105, y, { align: 'center' });

        y += 12;

        // === 2. Report Info Table ===
        doc.setFontSize(infoFontSize);
        doc.setFont('times', 'normal');

        const infoLeftX = 20;
        const infoColGap = 35;
        const infoData = [
          ['Report Period:', `${frm} - ${to}`],
          ['Church:', this.church],
          ['Department:', this.department],
          ['Report:', this.selectedModel],
        ];

        infoData.forEach(([label, value]) => {
          y += 6;
          doc.setFont('times', 'bold');
          doc.text(label, infoLeftX, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), infoLeftX + infoColGap, y);
        });

        y += 10;

          // === Data Table ===
          autoTable(doc, {
            startY: y,
            head: [['Department', 'Date', 'Program', 'Facilitator', 'Expense', 'Income', 'Rating']],
            body: rows.map(r => [
              r.department,
              r.date,
              r.program,
              r.facilitator || '',
              r.expense || '0',
              r.income || '0',
              r.rating || ''
            ]),
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
          });

          doc.output('dataurlnewwindow');
          });

      break;


    case 'Baptism':
      this.apiService.getBaptismPdfReport(start, end).subscribe((rows) => {
          const doc = new jsPDF();
          let y = 15;

          console.log('calling api ..')

          // ... header stuff ...
          const titleFontSize = 14;
          const infoFontSize = 10;
        
        // === 1. Church Header ===
        doc.setFont('times', 'bold');
        doc.setFontSize(titleFontSize);
        doc.text("ACCRA CITY CONFERENCE OF SEVENTH-DAY ADVENTIST CHURCH", 105, y, { align: 'center' });

        y += 8;
        doc.text(`${this.church} CHURCH, ACHIMOTA-DISTRICT`, 105, y, { align: 'center' });

        y += 12;

        // === 2. Report Info Table ===
        doc.setFontSize(infoFontSize);
        doc.setFont('times', 'normal');

        const infoLeftX = 20;
        const infoColGap = 35;
        const infoData = [
          ['Report Period:', `${frm} - ${to}`],
          ['Church:', this.church],
          ['Department:', this.department],
          ['Report:', this.selectedModel],
        ];

        infoData.forEach(([label, value]) => {
          y += 6;
          doc.setFont('times', 'bold');
          doc.text(label, infoLeftX, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), infoLeftX + infoColGap, y);
        });

        y += 10;

          // === Data Table ===
          autoTable(doc, {
            startY: y,
            head: [['Fullname', 'Gender', 'Voted on', 'Baptized on', 'Baptized by', 'Baptized at']],
            body: rows.map(r => [
              r.full_name,
              r.gender,
              r.date_church_voted,
              r.date_baptized || '0',
              r.baptized_by || '0',
              r.place_baptized || ''
            ]),
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
          });

          doc.output('dataurlnewwindow');
          });

      break;

    
    case 'Transfer':
      this.apiService.getTransferPdfReport(start, end).subscribe((rows) => {
          const doc = new jsPDF();
          let y = 15;

          console.log('calling api ..')

          // ... header stuff ...
          const titleFontSize = 14;
          const infoFontSize = 10;
        
        // === 1. Church Header ===
        doc.setFont('times', 'bold');
        doc.setFontSize(titleFontSize);
        doc.text("ACCRA CITY CONFERENCE OF SEVENTH-DAY ADVENTIST CHURCH", 105, y, { align: 'center' });

        y += 8;
        doc.text(`${this.church} CHURCH, ACHIMOTA-DISTRICT`, 105, y, { align: 'center' });

        y += 12;

        // === 2. Report Info Table ===
        doc.setFontSize(infoFontSize);
        doc.setFont('times', 'normal');

        const infoLeftX = 20;
        const infoColGap = 35;
        const infoData = [
          ['Report Period:', `${frm} - ${to}`],
          ['Church:', this.church],
          ['Department:', this.department],
          ['Report:', this.selectedModel],
        ];

        infoData.forEach(([label, value]) => {
          y += 6;
          doc.setFont('times', 'bold');
          doc.text(label, infoLeftX, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), infoLeftX + infoColGap, y);
        });

        y += 10;

          // === Data Table ===
          autoTable(doc, {
            startY: y,
            head: [['Fullname', 'type', 'Voted on', 'Minutes No', 'Sending Church', 'Receiving Church']],
            body: rows.map(r => [
              r.full_name,
              r.typ,
              r.date_church_voted,
              r.minutes_number || '0',
              r.sending_church || '0',
              r.receiving_church || ''
            ]),
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
          });

          doc.output('dataurlnewwindow');
          });

      break;

    
    case 'Dedication':
      this.apiService.getDedicationPdfReport(start, end).subscribe((rows) => {
          const doc = new jsPDF();
          let y = 15;

          console.log('calling api ..')

          // ... header stuff ...
          const titleFontSize = 14;
          const infoFontSize = 10;
        
        // === 1. Church Header ===
        doc.setFont('times', 'bold');
        doc.setFontSize(titleFontSize);
        doc.text("ACCRA CITY CONFERENCE OF SEVENTH-DAY ADVENTIST CHURCH", 105, y, { align: 'center' });

        y += 8;
        doc.text(`${this.church} CHURCH, ACHIMOTA-DISTRICT`, 105, y, { align: 'center' });

        y += 12;

        // === 2. Report Info Table ===
        doc.setFontSize(infoFontSize);
        doc.setFont('times', 'normal');

        const infoLeftX = 20;
        const infoColGap = 35;
        const infoData = [
          ['Report Period:', `${frm} - ${to}`],
          ['Church:', this.church],
          ['Department:', this.department],
          ['Report:', this.selectedModel],
        ];

        infoData.forEach(([label, value]) => {
          y += 6;
          doc.setFont('times', 'bold');
          doc.text(label, infoLeftX, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), infoLeftX + infoColGap, y);
        });

        y += 10;

          // === Data Table ===
          autoTable(doc, {
            startY: y,
            head: [['Dedicated', 'child Name', 'Date of birth', 'Place Of Birth', 'Mother', 'Father']],
            body: rows.map(r => [
              r.date,
              r.child_name,
              r.date_of_birth,
              r.place_of_birth || '',
              r.mother_name || '',
              r.father_name || ''
            ]),
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
          });

          doc.output('dataurlnewwindow');
          });

      break;


    
     case 'Attendance':
      this.apiService.getDedicationPdfReport(start, end).subscribe((rows) => {
          const doc = new jsPDF();
          let y = 15;

          console.log('calling api ..')

          // ... header stuff ...
          const titleFontSize = 14;
          const infoFontSize = 10;
        
        // === 1. Church Header ===
        doc.setFont('times', 'bold');
        doc.setFontSize(titleFontSize);
        doc.text("ACCRA CITY CONFERENCE OF SEVENTH-DAY ADVENTIST CHURCH", 105, y, { align: 'center' });

        y += 8;
        doc.text(`${this.church} CHURCH, ACHIMOTA-DISTRICT`, 105, y, { align: 'center' });

        y += 12;

        // === 2. Report Info Table ===
        doc.setFontSize(infoFontSize);
        doc.setFont('times', 'normal');

        const infoLeftX = 20;
        const infoColGap = 35;
        const infoData = [
          ['Report Period:', `${frm} - ${to}`],
          ['Church:', this.church],
          ['Department:', this.department],
          ['Report:', this.selectedModel],
        ];

        infoData.forEach(([label, value]) => {
          y += 6;
          doc.setFont('times', 'bold');
          doc.text(label, infoLeftX, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), infoLeftX + infoColGap, y);
        });

        y += 10;

          // === Data Table ===
          autoTable(doc, {
            startY: y,
            head: [['Date', 'Service', 'Adult', 'Youth', 'Children']],
            body: rows.map(r => [
              r.date,
              r.service,
              r.adult,
              r.youth || '',
              r.children || '',
            ]),
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
          });

          doc.output('dataurlnewwindow');
          });

      break;


    case 'Visitor':
      this.apiService.getVisitorPdfReport(start, end).subscribe((rows) => {
          const doc = new jsPDF();
          let y = 15;

          console.log('calling api ..')

          // ... header stuff ...
          const titleFontSize = 14;
          const infoFontSize = 10;
        
        // === 1. Church Header ===
        doc.setFont('times', 'bold');
        doc.setFontSize(titleFontSize);
        doc.text("ACCRA CITY CONFERENCE OF SEVENTH-DAY ADVENTIST CHURCH", 105, y, { align: 'center' });

        y += 8;
        doc.text(`${this.church} CHURCH, ACHIMOTA-DISTRICT`, 105, y, { align: 'center' });

        y += 12;

        // === 2. Report Info Table ===
        doc.setFontSize(infoFontSize);
        doc.setFont('times', 'normal');

        const infoLeftX = 20;
        const infoColGap = 35;
        const infoData = [
          ['Report Period:', `${frm} - ${to}`],
          ['Church:', this.church],
          ['Department:', this.department],
          ['Report:', this.selectedModel],
        ];

        infoData.forEach(([label, value]) => {
          y += 6;
          doc.setFont('times', 'bold');
          doc.text(label, infoLeftX, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), infoLeftX + infoColGap, y);
        });

        y += 10;

          // === Data Table ===
          autoTable(doc, {
            startY: y,
            head: [['Date', 'Name', 'Place', 'status', 'Contact']],
            body: rows.map(r => [
              r.date,
              r.name,
              r.place,
              r.status || '',
              r.contact || '',
            ]),
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
          });

          doc.output('dataurlnewwindow');
          });

      break;      



    case 'Event':
      this.apiService.getEventPdfReport(start, end).subscribe((rows) => {
          const doc = new jsPDF();
          let y = 15;

          console.log('calling api ..')

          // ... header stuff ...
          const titleFontSize = 14;
          const infoFontSize = 10;
        
        // === 1. Church Header ===
        doc.setFont('times', 'bold');
        doc.setFontSize(titleFontSize);
        doc.text("ACCRA CITY CONFERENCE OF SEVENTH-DAY ADVENTIST CHURCH", 105, y, { align: 'center' });

        y += 8;
        doc.text(`${this.church} CHURCH, ACHIMOTA-DISTRICT`, 105, y, { align: 'center' });

        y += 12;

        // === 2. Report Info Table ===
        doc.setFontSize(infoFontSize);
        doc.setFont('times', 'normal');

        const infoLeftX = 20;
        const infoColGap = 35;
        const infoData = [
          ['Report Period:', `${frm} - ${to}`],
          ['Church:', this.church],
          ['Department:', this.department],
          ['Report:', this.selectedModel],
        ];

        infoData.forEach(([label, value]) => {
          y += 6;
          doc.setFont('times', 'bold');
          doc.text(label, infoLeftX, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), infoLeftX + infoColGap, y);
        });

        y += 10;

          // === Data Table ===
          autoTable(doc, {
            startY: y,
            head: [['Date', 'Event type', 'Place', 'Member involve', 'event-detail', 'remarks']],
            body: rows.map(r => [
              r.date,
              r.event_type,
              r.event_place,
              r.member_involved || '',
              r.event_detail || '',
              r.remarks || '',
            ]),
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
          });

          doc.output('dataurlnewwindow');
          });

      break; 

    default:
      console.warn("Unknown model:", this.selectedModel);
      break;
}

  
}





exportAsExcel(): void {
  if (!this.filteredData.length || !this.selectedFields.length) {
    console.warn('No data or fields selected to export.');
    return;
  }

  const selectedData = this.filteredData.map((record: { [key: string]: any }) => {
    const filtered: { [key: string]: any } = {};
    this.selectedFields.forEach((field: string) => {
      filtered[field] = record[field];
    });
    return filtered;
  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
  const workbook: XLSX.WorkBook = { Sheets: { 'Export': worksheet }, SheetNames: ['Export'] };

  const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  const filename = `Export_${this.selectedModel}_${new Date().toISOString().split('T')[0]}.xlsx`;
  FileSaver.saveAs(blob, filename);
}


}
