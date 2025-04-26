import { Component } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {SidebarComponent} from './helpers/sidebar/sidebar.component';
import {NgIf} from '@angular/common';
import {HeaderComponent} from './components/header/header.component';
import {AuthService} from './services/authService/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, NgIf],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'yacht-frontend';

  showSidebar: boolean = true;

  constructor(private router: Router,private authService : AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      this.showSidebar = user && !['/login', '/register'].includes(currentRoute);
    });
  }
}
