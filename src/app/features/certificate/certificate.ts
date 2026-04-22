import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate.html',
  styleUrl: './certificate.css',
})
export class CertificateComponent {
  @Input() studentName: string = '';
  @Input() programName: string = '';
  @Input() programId: number | string = 0; // Added this Input
  @Input() completionDate: any = new Date(); // Using 'any' or 'Date' to avoid pipe errors

  @ViewChild('certificate') certificateElement!: ElementRef;

  public async downloadPDF() {
    const element = this.certificateElement.nativeElement;
    
    // Use a slightly higher scale for professional print quality
    const canvas = await html2canvas(element, { 
      scale: 3, 
      useCORS: true, 
      logging: false 
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Fill the A4 page exactly
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${this.studentName}_${this.programName}_Certificate.pdf`);
  }
}