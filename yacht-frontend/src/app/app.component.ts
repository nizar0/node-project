import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {SidebarComponent} from './helpers/sidebar/sidebar.component';

import {HeaderComponent} from './components/header/header.component';
import {AuthService} from './services/authService/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'yacht-frontend';

  showSidebar: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      this.showSidebar = !['/login', '/register'].includes(currentRoute);
    });
  }
}
