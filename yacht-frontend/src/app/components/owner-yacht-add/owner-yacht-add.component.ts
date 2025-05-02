import {Component, OnInit} from '@angular/core';
import {Yacht} from '../../constants/Yacht';
import {HttpClient} from '@angular/common/http';
import {YachtService} from '../../services/yachtService/yacht.service';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {showAlert} from '../../constants/functions';
import {HeaderComponent} from "../header/header.component";

import {GoogleMap, MapMarker} from '@angular/google-maps';

@Component({
  selector: 'app-owner-yacht-add',
  imports: [
    FormsModule,
    HeaderComponent,
    GoogleMap,
    MapMarker
],
  templateUrl: './owner-yacht-add.component.html',
  standalone: true,
  styleUrl: './owner-yacht-add.component.css'
})
export class OwnerYachtAddComponent implements OnInit{
  yacht : Yacht ={
    name: '',
    description: '',
    pricePerDay: 0,
    capacity: 0,
    owner: '',
    location :'',
    isValidatedByAdmin : false,
    isPublic : false,
    image: [] as File[]
  };

  previewImages: string[] = [];



  yachtId: string | null = null;

  isEditMode = false;
  showMapModal = false;
  isMapModalOpen = false;

  center = { lat: 36.8065, lng: 10.1815 };
  zoom = 12;
  selectedPosition = this.center;
  markerOptions = { draggable: true };
  constructor(private http: HttpClient, private route: ActivatedRoute,
              private router: Router,private yachtService :YachtService) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.yachtId = params.get('id');
      this.isEditMode = !!this.yachtId;

      if (this.isEditMode && this.yachtId) {
        this.loadYachtDetails(this.yachtId);
      }
    });
  }
  openMapModal() {
    this.isMapModalOpen = true;
    console.log("isMapModalOpen",this.isMapModalOpen)
  }

  closeMapModal() {
    this.isMapModalOpen = false;
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.selectedPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.selectedPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
    }
  }


  confirmLocation() {
    this.yacht.location = `${this.selectedPosition.lat},${this.selectedPosition.lng}`;
    this.closeMapModal();
  }
  loadYachtDetails(id: string): void {
    this.yachtService.getYachtById(id).subscribe({
      next: (yacht) => {
        this.yacht = {
          name: yacht.name,
          description: yacht.description,
          pricePerDay: yacht.pricePerDay,
          capacity: yacht.capacity,
          image:[yacht.image] ,
          owner: yacht.owner,
          location :yacht.location,
          isValidatedByAdmin : yacht.isValidatedByAdmin,
          isPublic : yacht.isPublic
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails du yacht', err);
      },
    });
  }


  onFileSelected(event: any) {
    if (event.target.files) {
      for (let file of event.target.files) {
        if (file.type.startsWith('image/')) {
          this.yacht.image.push(file);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.previewImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  // ❌ Remove an image from selection
  removeImage(index: number) {
    this.yacht.image.splice(index, 1);
    this.previewImages.splice(index, 1);
  }



  onSubmit(form: any): void {
    if (form.valid) {
      const formData = new FormData();
      formData.append('name', this.yacht.name);
      formData.append('description', this.yacht.description);
      formData.append('location', this.yacht.location);
      formData.append('pricePerDay', this.yacht.pricePerDay.toString());
      formData.append('capacity', this.yacht.capacity.toString());
      if (this.yacht.image && this.yacht.image.length > 0) {
        this.yacht.image.forEach((img: string, index: any) => {
          formData.append(`images`, img);
        });
      }

      if (this.isEditMode && this.yachtId) {

        this.yachtService.updateYacht(this.yachtId, formData).subscribe({
          next: async () => {
            const customAlertData = {
              title: 'Succès',
              html: 'Yacht modifié avec succès !',
              icon: 'success',
              confirmButtonText: 'OK',
            };
            await showAlert(customAlertData);
            this.router.navigate(['/dashboard/owner/list']);
          },
          error: async (err) => {
            const customAlertData = {
              title: 'Erreur',
              html: 'Erreur lors de la modification du yacht.',
              icon: 'error',
              confirmButtonText: 'OK',
            };
            await showAlert(customAlertData);
            console.error('Erreur lors de la modification du yacht', err);
          },
        });
      } else {
        // Add yacht
        this.yachtService.createYacht(formData).subscribe({
          next: async () => {
            const customAlertData = {
              title: 'Succès',
              html: 'Yacht ajouté avec succès !',
              icon: 'success',
              confirmButtonText: 'OK',
            };
            await showAlert(customAlertData);
            form.reset();
            this.router.navigate(['/dashboard/owner/list']);
          },
          error: async (err) => {
            const customAlertData = {
              title: 'Erreur',
              html: 'Erreur lors de l\'ajout du yacht.',
              icon: 'error',
              confirmButtonText: 'OK',
            };
            await showAlert(customAlertData);
            console.error('Erreur lors de l\'ajout du yacht', err);
          },
        });
      }
    }
  }
}
