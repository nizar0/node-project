import {Component, OnInit} from '@angular/core';
import Chart from 'chart.js/auto';
import {HeaderComponent} from '../header/header.component';
import {NgForOf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {OrderService} from '../../services/orderService/order.service';
import {getUrl} from '../../constants/functions';

@Component({
  selector: 'app-owner-earnings',
  imports: [
    HeaderComponent,
    NgForOf
  ],
  templateUrl: './owner-earnings.component.html',
  standalone: true,
  styleUrl: './owner-earnings.component.css'
})
export class OwnerEarningsComponent implements OnInit {
  totalEarnings: number = 0;
  yachtEarnings: any[] = [];
  currentImage: any[] = [];

  yachtImages: any = {};
  constructor(private http: HttpClient , private orderService : OrderService) {}

  ngOnInit() {
    this.fetchEarnings();
  }

  fetchEarnings() {
    this.orderService.ownerEarnings().subscribe(response => {
      this.totalEarnings = response.totalEarnings;
      this.yachtEarnings = Object.keys(response.yachts).map(yachtName => ({
        name: yachtName,
        images: response.yachts[yachtName].images,
        reservations: response.yachts[yachtName].reservations,
        totalRevenue: response.yachts[yachtName].totalRevenue
      }));
      this.yachtEarnings.forEach((yacht, index) => {
        let currentIndex = 0;
        this.currentImage[index] = yacht.images[0];
        setInterval(() => {
          currentIndex = (currentIndex + 1) % yacht.images.length;
          this.currentImage[index] = yacht.images[currentIndex];
        }, 5000);
      });
      this.renderChart();
    });
  }

  renderChart() {
    const ctx = document.getElementById('earningsChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.yachtEarnings.map(yacht => yacht.name),
          datasets: [{
            label: 'Revenus en DT',
            data: this.yachtEarnings.map(yacht => yacht.totalRevenue),
            backgroundColor: 'rgba(108,99,255,0.36)',
            borderColor: 'rgb(99,255,219)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,

          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  protected readonly getUrl = getUrl;
}
