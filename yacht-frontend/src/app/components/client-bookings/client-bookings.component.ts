import {Component, OnInit, ViewChild} from '@angular/core';
import {BookingService} from '../../services/bookingService/booking.service';
import {ToastrService} from 'ngx-toastr';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {getUrl, showAlert} from '../../constants/functions';
import {HeaderComponent} from '../header/header.component';
import {WebSocketService} from '../../services/webSocketService/web-socket.service';
import {PaymentModalComponent} from '../payment-modal/payment-modal.component';
import {Router} from '@angular/router';
import {ReviewService} from '../../services/reviewService/review.service';

@Component({
  selector: 'app-client-bookings',
  templateUrl: './client-bookings.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    DatePipe,
    HeaderComponent,
    PaymentModalComponent,

  ],
  styleUrl: './client-bookings.component.css'
})
export class ClientBookingsComponent implements OnInit {
  bookings: any[] = [];
  currentImageIndex: { [key: string]: number } = {};
  selectedBooking: any = null;
  isPaymentModalVisible = false;
  @ViewChild(PaymentModalComponent) paymentModal!: PaymentModalComponent;

  constructor(private bookingService: BookingService, private router: Router, private reviewService: ReviewService, private webSocketService: WebSocketService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.loadClientBookings();
    this.webSocketService.notificationSubject$.subscribe((notification) => {
      if (notification) {
        this.loadClientBookings();
      }
    });
  }

  loadClientBookings(): void {


    this.bookingService.getBookingsForClient().subscribe({
      next: (data) => {
        this.bookings = data;
        this.bookings = this.bookings.map(booking => ({
          ...booking,
          hasReviewed: false
        }));
        this.bookings.forEach(booking => {
          this.reviewService.getHasReview(booking._id).subscribe((response: any) => {
            booking.hasReviewed = response.hasReviewed;
          });
        });
        console.log('this.bookings',this.bookings)
               this.bookings.forEach(booking => {
          this.currentImageIndex[booking._id] = 0;
        });
        console.log('this.currentImageIndex',this.currentImageIndex)
      },
      error: (err) => {
        console.error('Error fetching client bookings:', err);
        this.toastr.error('Erreur lors du chargement des réservations.');
      }
    });



  }

  nextImage(booking: any, event: Event) {
    event.stopPropagation();
    if (!booking.yacht.images || booking.yacht.images.length === 0) return;

    this.currentImageIndex[booking._id] =
      (this.currentImageIndex[booking._id] + 1) % booking.yacht.images.length;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const customAlertData = {
      title: 'Confirmer l\'annulation',
      html: "Êtes-vous sûr de vouloir annuler cette réservation ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e63946',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, fermer',
    };

    try {
      const result = await showAlert(customAlertData);

      if (result.isConfirmed) {
        this.bookingService.updateBookingStatus(bookingId, 'canceled').subscribe({
          next: () => {
            showAlert({
              title: 'Annulé !',
              html: 'Votre réservation a été annulée avec succès.',
              icon: 'success',
            });
            this.loadClientBookings();
          },
          error: () => {
            showAlert({
              title: 'Erreur',
              html: 'Une erreur s\'est produite lors de l\'annulation.',
              icon: 'error',
            });
          }
        });
      }
    } catch (error) {
      console.error("Erreur dans showAlert :", error);
    }
  }



  goToAddReview(bookingId: string) {
    console.log(bookingId)
    this.router.navigate(['/dashboard/client/add-review', bookingId]);
  }

  protected readonly getUrl = getUrl;
}
