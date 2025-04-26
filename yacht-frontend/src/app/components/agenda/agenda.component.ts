import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/bookingService/booking.service';
import { ToastrService } from 'ngx-toastr';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import timeGridPlugin from '@fullcalendar/timegrid';
import { HeaderComponent } from '../header/header.component';
import { WebSocketService } from '../../services/webSocketService/web-socket.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { getUrl, showAlert } from '../../constants/functions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agenda',
  imports: [FullCalendarModule, HeaderComponent],
  templateUrl: './agenda.component.html',
  standalone: true,
  styleUrl: './agenda.component.css',
})
export class AgendaComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
  };

  constructor(private bookingService: BookingService, private webSocketService: WebSocketService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadBookings();
    this.webSocketService.notificationSubject$.subscribe((notification) => {
      if (notification) {
        this.loadBookings();
      }
    });
  }

  loadBookings(): void {
    this.bookingService.getBookingsForOwner().subscribe({
      next: (data) => {
        this.initializeCalendar(data);
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
      },
    });
  }

  initializeCalendar(data: any[]): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      locales: [frLocale],
      locale: 'fr',
      events: data.map((booking: any) => ({
        id: booking._id,
        title: booking.yacht.name,
        start: booking.startDate,
        end: booking.endDate,
        extendedProps: {
          yachtImages: booking.yacht.images || [],  // Array of images
          clientImage: booking.client.image,
          status: booking.status,
          totalPrice: booking.totalPrice,
          clientName: booking.client.name,
          yachtName: booking.yacht.name,
        },
        classNames: [`booking-${booking.status}`],
      })),
      nowIndicator: true,
      editable: false,
      eventClick: this.onEventClick.bind(this),
      eventDidMount: (info) => {
        const { yachtImages, clientImage, status, totalPrice, yachtName, clientName } = info.event.extendedProps;

        if (!yachtImages || yachtImages.length === 0) {
          yachtImages.push('assets/img/default-yacht.jpg');
        }

        let currentIndex = 0;


        const updateImage = () => {
          const imgElement = document.getElementById(`yacht-img-${info.event.id}`) as HTMLImageElement;
          if (imgElement) {
            imgElement.src = getUrl(yachtImages[currentIndex]);
          }
        };

        // Start image rotation every 3s
        const imageInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % yachtImages.length;
          updateImage();
        }, 3000);

        // Define colors for each status
        let statusColor = "#FFA500"; // Default: Pending
        if (status === "accepted") statusColor = "#28A745";
        else if (status === "canceled") statusColor = "#DC3545";
        else if (status === "payed") statusColor = "#007BFF";
        else if (status === "ongoing") statusColor = "#e331e0";
        else if (status === "done") statusColor = "#686767";

        tippy(info.el, {
          content: `
  <div style="text-align: left; font-family: Arial, sans-serif; color: #fdf0ff; max-width: 220px;">
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <img src="${getUrl(clientImage)}" alt="Client" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px; border: 2px solid #6c63ff;" />
      <div>
        <div style="font-weight: bold; color: #fbf0ff; font-size: 14px;">${clientName}</div>
        <small style="color: #555;">Client</small>
      </div>
    </div>
    <img id="yacht-img-${info.event.id}" src="${getUrl(yachtImages[0])}" alt="Yacht" style="width: 100%; height: 80px; border-radius: 8px; object-fit: cover; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);" />
    <div style="margin-bottom: 8px;">
      <strong style="color: #ffffff;">Statut:</strong>
      <span style="color: ${statusColor};">
        ${status === 'pending' ? 'En attente' :
            status === 'accepted' ? 'Accepté' :
              status === 'payed' ? 'Payé' :
                status === 'ongoing' ? 'En cours' :
                  status === 'done' ? 'Terminé' :
                    'Annulé'}
      </span>
    </div>
    <div>
      <strong style="color: #ffffff;">Prix total:</strong>
      <span style="color: #000; font-weight: bold;">${totalPrice} DT</span>
    </div>
  </div>
  `,
          allowHTML: true,
          theme: 'light',
          onHidden() {
            clearInterval(imageInterval); // Stop image rotation on close
          }
        });
      },
    };
  }

  onEventClick(info: any): void {
    const booking = info.event.extendedProps;

    if (booking.status === 'canceled') {
      this.toastr.warning('Cette réservation a déjà été annulée.');
      return;
    }

    // Define booking status display
    const statusDisplay :any = {
      pending: { text: 'En attente', color: '#FFC107' },
      accepted: { text: 'Accepté', color: '#28A745' },
      payed: { text: 'Payé', color: '#007BFF' },
      ongoing: { text: 'En cours', color: '#17A2B8' },
      done: { text: 'Terminé', color: '#6C757D' },
      canceled: { text: 'Annulé', color: '#DC3545' },
    };

    // Modernized reservation display
    const statusMessage = `
    <div style="
        font-family: 'Arial', sans-serif;
        background: linear-gradient(135deg, #2C3E50, #4CA1AF);
        color: #ffffff;
        padding: 15px;
        border-radius: 12px;
        text-align: left;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        max-width: 350px;
    ">
      <h3 style="text-align: center; margin-bottom: 10px;"> Détails de la réservation</h3>

      <div style="margin-bottom: 10px;">
        <strong>  Yacht :</strong> ${booking.yachtName}
      </div>
      <div style="margin-bottom: 10px;">
        <strong>  Client :</strong> ${booking.clientName}
      </div>
      <div style="margin-bottom: 10px; font-weight: bold;">
        <strong>  Statut :</strong>
        <span style="color: ${statusDisplay[booking.status].color};">
          ${statusDisplay[booking.status].text}
        </span>
      </div>
      <div style="margin-bottom: 10px;">
        <strong> Prix total:</strong> ${booking.totalPrice} DT
      </div>
    </div>
  `;

    // Define buttons based on status
    const isPending = booking.status === 'pending';
    const showCancel = booking.status !== 'done' && booking.status !== 'ongoing' && booking.status !== 'payed';

    const customAlertData = {
      title: ' Gérer la réservation',
      html: statusMessage,
      icon: 'info',
      showCancelButton: showCancel,
      confirmButtonText: isPending ? '✅ Accepter' : 'OK',
      cancelButtonText: isPending ? '❌ Refuser' : 'Annuler',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      allowOutsideClick: true,
    };

    showAlert(customAlertData).then((result) => {
      if (result.isConfirmed && isPending) {
        this.bookingService.updateBookingStatus(info.event.id, 'accepted').subscribe(() => {
          this.toastr.success('✅ Réservation acceptée avec succès !');
          this.loadBookings();
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.bookingService.updateBookingStatus(info.event.id, 'canceled').subscribe(() => {
          this.toastr.success('❌ Réservation annulée avec succès !');
          this.loadBookings();
        });
      }
    });
  }
}
