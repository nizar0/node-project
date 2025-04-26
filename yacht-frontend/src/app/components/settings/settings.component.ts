import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authService/auth.service';
import { UserService } from '../../services/userService/user.service';
import { getUrl, showAlert } from '../../constants/functions';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { User } from '../../constants/User';
import { Role } from '../../constants/Role.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, HeaderComponent],
  templateUrl: './settings.component.html',
  standalone: true,
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  user: User = {
    name: '',
    email: '',
    password: '',
    role: Role.CLIENT,
    image: null
  };
  currentPassword: string = '';
  newPassword: string = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = ''; // ✅ Stockage temporaire de l'image

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.getUserProfile();
  }

  getUserProfile(): void {
    this.user = JSON.parse(<string>localStorage.getItem('user'))
    this.imagePreview = this.user.image ? getUrl(this.user.image) : 'assets/default-avatar.png';
  }

  onSubmit(form: any): void {
    if (form.valid) {
      const formData = new FormData();
      formData.append('name', this.user.name);
      formData.append('email', this.user.email);

      if (this.currentPassword && this.newPassword) {
        formData.append('currentPassword', this.currentPassword);
        formData.append('newPassword', this.newPassword);
      }

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.userService.updateUser(formData).subscribe({
        next: async (response) => {
          this.authService.setUser(response.user);
          this.imagePreview = getUrl(response.user.image); // ✅ Mise à jour de l’image après upload
          await this.openModal('success', response.user);
        },
        error: async (error) => {
          await this.openModal('error');
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      this.user.image = file;

      // ✅ Affichage de l’aperçu de l’image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async openModal(status: string = '', user: any = {}) {
    const customAlertData = {
      title: status === 'error' ? `<strong>Attention !!</strong>` : '<strong>Mise à jour réussie 😊</strong>',
      icon: status,
      html: status === 'error' ? 'Une erreur est survenue lors de la mise à jour.' : 'Mise à jour réussie !'
    };
    try {
      const result = await showAlert(customAlertData);
      if (result.isConfirmed && status !== 'error') {
        if (user.role !== Role.ADMIN) {
          this.router.navigate([`/dashboard/${user.role}/list`]);
        } else {
          this.router.navigate([`/dashboard/admin/users`]);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'affichage de l'alerte :", error);
    }
  }

  protected readonly getUrl = getUrl;
}
