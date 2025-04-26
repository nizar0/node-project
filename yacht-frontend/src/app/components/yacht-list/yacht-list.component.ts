import { Component, OnInit } from '@angular/core';
import { YachtService } from '../../services/yachtService/yacht.service';
import { NgClass, NgForOf, NgIf, SlicePipe} from '@angular/common';
import { getUrl, showAlert } from '../../constants/functions';
import { AuthService } from '../../services/authService/auth.service';
import { Router } from '@angular/router';
import {HeaderComponent} from '../header/header.component';
import Swal from 'sweetalert2';
import {GoogleMap, MapMarker} from '@angular/google-maps';
import {WebSocketService} from '../../services/webSocketService/web-socket.service';

@Component({
  selector: 'app-yacht-list',
  imports: [

    NgIf,
    NgForOf,
    NgClass,
    HeaderComponent,
    GoogleMap,
    MapMarker,
    SlicePipe,
  ],
  templateUrl: './yacht-list.component.html',
  standalone: true,
  styleUrl: './yacht-list.component.css'
})
export class YachtListComponent implements OnInit {
  yachts: any[] = [];
  role: string = '';
  currentImageIndex: { [key: string]: number } = {};
  imageInterval: { [key: string]: any } = {};
  isMapModalOpen = false;
  expandedDescriptions: { [key: string]: boolean } = {};


  center = { lat: 0, lng: 0 };
  zoom = 12;
  constructor(
    private yachtService: YachtService,
    private authService: AuthService,
    private router: Router,
    private webSocketService: WebSocketService,

  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.role = user.role;

      if (this.role === 'owner') {
        this.loadOwnerYachts();
      } else if (this.role === 'client') {
        this.loadPublicYachts();
      }
    });

    this.webSocketService.notificationSubject$.subscribe((notification) => {
      if (notification) {
        if (this.role === 'owner') {
          this.loadOwnerYachts();
        } else if (this.role === 'client') {
          this.loadPublicYachts();
        }
      }
    });
  }

  loadOwnerYachts(): void {
    this.yachtService.getMyYachts().subscribe({
      next: (data) => {
        this.yachts =data
        this.yachts.forEach(yacht => {
          this.currentImageIndex[yacht._id] = 0;
          this.startAutoSlide(yacht._id);
        });
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des yachts:', err);
      }
    });
  }
  openLocationModal(yacht: any): void {
    if (yacht.location) {
      const [lat, lng] = yacht.location.split(',').map((cord: string) => {
        return parseFloat(cord.trim());
      });

      this.center =
         { lat, lng }
      ;

this.isMapModalOpen =true
    } else {
      console.error('Position non disponible');
    }
  }


  closeMapModal() {
    this.isMapModalOpen = false;
  }
  loadPublicYachts(): void {
    this.yachtService.getPublicYachts().subscribe({
      next: (data) => {
        this.yachts = data;
        this.yachts.forEach(yacht => {
          this.currentImageIndex[yacht._id] = 0;
          this.startAutoSlide(yacht._id);
        });
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des yachts publics:', err);
      }
    });
  }


  nextImage(yacht: any, event: Event): void {
    event.stopPropagation();
    if (yacht.images && yacht.images.length > 0) {
      this.currentImageIndex[yacht._id] =
        (this.currentImageIndex[yacht._id] + 1) % yacht.images.length;
    }
  }

  startAutoSlide(yachtId: string): void {
    this.imageInterval[yachtId] = setInterval(() => {
      this.nextImage({ _id: yachtId, images: this.yachts.find(y => y._id === yachtId)?.images }, new Event(''));
    }, 10000);
  }

  pauseAutoSlide(yachtId: string): void {
    clearInterval(this.imageInterval[yachtId]);
  }

  resumeAutoSlide(yachtId: string): void {
    this.startAutoSlide(yachtId);
  }
  protected readonly getUrl = getUrl;

  editYacht(yacht: any): void {
    this.router.navigate([`dashboard/owner/yacht/edit/${yacht._id}`]);
  }

  async deleteYacht(id: string): Promise<void> {
    const customAlertData = {
      title: 'Êtes-vous sûr ?',
      html: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e63946',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    };
    try {
      const result = await showAlert(customAlertData);
      if (result.isConfirmed) {
        this.yachtService.deleteYacht(id).subscribe({
          next: async () => {
            this.yachts = this.yachts.filter((yacht) => yacht._id !== id);
            const customAlertData = {
              title: 'Supprimé !',
              html: "Le yacht a été supprimé avec succès.",
              icon: 'success',
              confirmButtonText: 'OK'
            };
            await showAlert(customAlertData);
          },
          error: async (err) => {
            const customAlertData = {
              title: 'Erreur !',
              html: "Une erreur s'est produite lors de la suppression.",
              icon: 'error',
              confirmButtonText: 'OK'
            };
            await showAlert(customAlertData);
          },
        });
      }
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  }

  async togglePublicStatus(yacht: any): Promise<void> {
    const customAlertData = {
      title: yacht.isPublic ? 'Rendre ce yacht privé ?' : 'Rendre ce yacht public ?',
      html: yacht.isPublic
        ? 'Ce yacht ne sera plus visible par les utilisateurs publics.'
        : 'Ce yacht sera désormais visible par tous les utilisateurs.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: yacht.isPublic ? 'Oui, rendre privé' : 'Oui, rendre public',
      cancelButtonText: 'Annuler',
    };

    try {
      const result = await showAlert(customAlertData);
      if (result.isConfirmed) {
        this.yachtService.togglePublicStatus(yacht._id).subscribe({
          next: async (response) => {
            yacht.isPublic = response.isPublic;

            const successAlertData = {
              title: 'Statut modifié !',
              html: `Le yacht est maintenant ${
                response.isPublic ? 'Public' : 'Privé'
              }.`,
              icon: 'success',
              confirmButtonText: 'OK',
            };
            await showAlert(successAlertData);
          },
          error: async (err) => {
            const errorAlertData = {
              title: 'Erreur !',
              html: 'Une erreur s\'est produite lors de la modification du statut.',
              icon: 'error',
              confirmButtonText: 'OK',
            };
            await showAlert(errorAlertData);
          },
        });
      }
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  }



  goToBooking(yacht: any): void {
    if (this.role !== 'owner') {
      this.router.navigate(['/dashboard/client/bookings', yacht._id]);
    }
  }

  showReviews(yacht: { reviews: any[]; name: any; }) {
    if (!yacht.reviews || yacht.reviews.length === 0) {
      Swal.fire({
        title: 'Aucun avis',
        text: 'Ce yacht n\'a pas encore de commentaires.',
        icon: 'info',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal-bg' // Add Custom Class
        }
      });
      return;
    }

    let reviewHtml = yacht.reviews.map(review => `
    <div class="review-item">
      <img src="${this.getUrl(review.client.image) || 'assets/default-avatar.png'}"
           class="client-avatar" />
      <div class="review-text">
        <div class="rating-stars">
          ${this.getStars(review.rating)}
        </div>
        <strong>${review.client.name}</strong>
        <p class="review-comment">${review.comment}</p>
      </div>
    </div>
  `).join('');

    Swal.fire({
      title: `${yacht.reviews.length} avis pour ${yacht.name}`,
      html: `<div class="reviews-container">${reviewHtml}</div>`,
      confirmButtonText: 'Fermer',
      width: '600px',
      customClass: {
        popup: 'custom-swal-bg'
      }
    });
  }

  getStars(rating: number) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<span class="star" style="color:${i <= rating ? '#FFD700' : '#ccc'}">★</span>`;
    }
    return stars;
  }



  toggleDescription(yachtId: string, event: Event): void {
    event.stopPropagation();
    this.expandedDescriptions[yachtId] = !this.expandedDescriptions[yachtId];

}

}
