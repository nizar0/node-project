import {Component} from '@angular/core';
import {User} from '../../constants/User';
import {Role} from '../../constants/Role.enum';
import {FormsModule} from '@angular/forms';
import {UserService} from '../../services/userService/user.service';
import {showAlert} from '../../constants/functions';
import {Router} from '@angular/router';
import {AuthService} from '../../services/authService/auth.service';

@Component({
  selector: 'app-create-user',
  imports: [
    FormsModule
  ],
  templateUrl: './create-user.component.html',
  standalone: true,
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  user: User = {
    name: '',
    email: '',
    password: '',
    role: Role.CLIENT,
    image : null
  };
  acceptedTerms: boolean = false

  constructor(private userService: UserService,private authService :AuthService,private router: Router) {
  }

  onSubmit(form: any): void {
    if (form.valid) {
      const formData = new FormData();
      formData.append('name', this.user.name);
      formData.append('email', this.user.email);
      formData.append('password', this.user.password);
      formData.append('role', this.user.role);
      if (this.user.image) {
        formData.append("image", this.user.image);
      }
      this.userService.createUser(formData).subscribe({
        next: async (response) => {

          await this.openModal('success')
        },
        error: async (error) => {
          await this.openModal('error')
        },
      });
    }
  }
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.user.image = file;
    }
  }
  async openModal(status: string = '', user: any = {}) {
    const customAlertData = {
      title: status == 'error' ? `<strong>Attention !!</strong>` : '<strong>Inscription réussie</strong>',
      icon: status,
      html: status == 'error'
        ? 'Une erreur est survenue lors de l\'inscription.'
        : 'Votre compte a été enregistré avec succès. La validation de votre compte sera effectuée dans les plus brefs délais. <br><br> 📧 <strong>Vous recevrez un e-mail</strong> lorsque votre compte sera validé.',
      confirmButtonText: 'OK'
    };

    try {
      const result = await showAlert(customAlertData);
      if (result.isConfirmed && status != 'error') {
        this.router.navigate(['/login']); // Redirection vers la page de connexion après inscription
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage du message :', error);
    }
  }
  goToRegister() {
    return  this.router.navigate(['/login']);

  }
}
