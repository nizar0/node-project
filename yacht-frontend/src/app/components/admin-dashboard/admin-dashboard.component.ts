import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/orderService/order.service';
import Chart from 'chart.js/auto';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    HeaderComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  ownerRevenue: any[] = [];
  yachtEarnings: any[] = [];
  clientPayments: any[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchStatistics();
  }

  fetchStatistics(): void {
    this.orderService.getOrderStatistics().subscribe(response => {
      this.ownerRevenue = response.ownerRevenue;
      console.log('response.yachtEarnings',response.yachtEarnings)
      this.yachtEarnings = response.yachtEarnings  ? response.yachtEarnings :[] ;
      this.clientPayments =  response.clientPayments ? response.clientPayments :[];
      this.renderYachtRevenueChart();
      this.renderClientPaymentChart();
    });
  }


  renderYachtRevenueChart(): void {
    const yachtNames = this.yachtEarnings.map(yacht => yacht.yachtName);
    const yachtRevenue = this.yachtEarnings.map(yacht => yacht.revenue);

    new Chart('yachtRevenueChart', {
      type: 'bar',
      data: {
        labels: yachtNames,
        datasets: [{
          label: 'Revenus des Yachts (DT)',
          data: yachtRevenue,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let yachtName = context.label;

                return [`${yachtName}: ${context.raw} DT`];
              }
            }
          }
        }
      }
    });
  }

  renderClientPaymentChart(): void {
    console.log('clientPayments',this.clientPayments)
    const clientNames = this.clientPayments.map(client => client.clientName);
    const clientSpending = this.clientPayments.map(client => client.totalPrice);

    new Chart('clientPaymentChart', {
      type: 'pie',
      data: {
        labels: clientNames,
        datasets: [{
          data: clientSpending,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.raw} DT`;
              }
            }
          }
        }
      }
    });
  }
}
