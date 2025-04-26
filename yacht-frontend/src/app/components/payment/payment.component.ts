import {Component, OnDestroy, OnInit} from '@angular/core';
import Chart from 'chart.js/auto';
import {OrderService} from '../../services/orderService/order.service';
import { DatePipe, NgClass, NgForOf} from '@angular/common';
import {HeaderComponent} from '../header/header.component';
import {getUrl} from '../../constants/functions';

@Component({
  selector: 'app-payment',
  imports: [
    NgForOf,
    DatePipe,
    NgClass,
    HeaderComponent
  ],
  templateUrl: './payment.component.html',
  standalone: true,
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit,OnDestroy {
  payments: any[] = [];
  totalPayments: number = 0;
  paidPercentage: string | number = 0;
  failedPercentage: string | number = 0;
  totalAmountPaid: number = 0;
  currentImageIndex: { [key: string]: number } = {};
  intervalIds: { [key: string]: any } = {};
  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchPayments();
  }
  ngOnDestroy() {
    Object.keys(this.intervalIds).forEach(id => clearInterval(this.intervalIds[id]));
  }
  fetchPayments(): void {
    this.orderService.getPayments().subscribe(
      (data: any) => {
        this.payments = data;
        this.payments.forEach(payment => {
          this.currentImageIndex[payment.booking._id] = 0;
          this.startImageRotation(payment.booking._id, payment.booking.yacht.images.length);
        });
        this.totalPayments = this.payments.length;
        const paidPayments = this.payments.filter(p => p.status === 'paid');
        const failedCount = this.payments.filter(p => p.status === 'failed').length;

        this.paidPercentage = this.totalPayments > 0 ? (paidPayments.length / this.totalPayments * 100).toFixed(1) : 0;
        this.failedPercentage = this.totalPayments > 0 ? (failedCount / this.totalPayments * 100).toFixed(1) : 0;

        this.totalAmountPaid = paidPayments.reduce((sum, payment) => sum + payment.totalPrice, 0);

        this.generateChart(paidPayments.length, failedCount, this.totalPayments - paidPayments.length - failedCount);
      },
      (error) => {
        console.error('Erreur lors de la récupération des paiements:', error);
      }
    );
  }
  startImageRotation(yachtId: string, imageCount: number) {
    if (imageCount > 1) {
      this.intervalIds[yachtId] = setInterval(() => {
        this.currentImageIndex[yachtId] =
          (this.currentImageIndex[yachtId] + 1) % imageCount;
      }, 5000); // Change image every 5 seconds
    }
  }
  generateChart(paid: number, failed: number, pending: number): void {
    const ctx = document.getElementById('paymentChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Paiements réussis', 'Paiements échoués', 'En attente'],
        datasets: [{
          data: [paid, failed, pending],
          backgroundColor: ['#28a745', '#dc3545', '#ffc107']
        }]
      }
    });
  }

  getStatusClass(status: string): string {
    return {
      'paid': 'status-paid',
      'failed': 'status-failed',
      'pending': 'status-pending'
    }[status] || '';
  }

  getStatusText(status: string): string {
    return {
      'paid': 'Payé ✅',
      'failed': 'Échoué ❌',
      'pending': 'En attente ⏳'
    }[status] || 'Inconnu';
  }

  protected readonly getUrl = getUrl;
}
