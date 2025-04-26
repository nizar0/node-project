import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/adminService/admin.service';
import { ToastrService } from 'ngx-toastr';
import {User} from '../../constants/User';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {getUrl} from '../../constants/functions';
import {FormsModule} from '@angular/forms';
import {HeaderComponent} from '../header/header.component';

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrl: './admin-user-management.component.css',
  imports: [
    NgForOf,
    NgClass,
    NgIf,
    FormsModule,
    HeaderComponent
  ],
  standalone: true
})
export class AdminUserManagementComponent implements OnInit {
  owners: any[] = [];
  clients: any[] = [];
  showBlockedOnly = false;
  selectedTab: string = 'owners';
  searchQuery: string = '';

  filteredOwners: any[] = [];
  filteredClients: any[] = [];

  constructor(private adminService: AdminService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe((users: any[]) => {
      this.filteredOwners = this.owners = users.filter((user: User) => user.role === 'owner');
      console.log(this.owners)
      this.filteredClients =  this.clients = users.filter((user: User) => user.role === 'client');
    });
  }

  get filteredOwnersPending() {
    return this.owners.filter(user => !user.isValidatedByAdmin && (!this.showBlockedOnly || user.isBlockedByAdmin));
  }

  get filteredOwnersValid() {
    return this.owners.filter(user => user.isValidatedByAdmin && (!this.showBlockedOnly || user.isBlockedByAdmin));
  }

  get filteredClientsPending() {
    return this.clients.filter(user => !user.isValidatedByAdmin && (!this.showBlockedOnly || user.isBlockedByAdmin));
  }

  get filteredClientsValid() {
    return this.clients.filter(user => user.isValidatedByAdmin && (!this.showBlockedOnly || user.isBlockedByAdmin));
  }

  toggleBlockedFilter() {
    this.showBlockedOnly = !this.showBlockedOnly;
  }

  approveUser(userId: string) {
    this.adminService.approveUser(userId).subscribe(() => this.loadUsers());
  }

  blockUser(userId: string) {
    this.adminService.blockUser(userId).subscribe(() => this.loadUsers());
  }
  deblockUser(userId: string) {
    this.adminService.blockUser(userId).subscribe(() => this.loadUsers());
  }


  selectTab(tab: string) {
    this.selectedTab = tab;
    this.filterUsers(); // Apply filter when switching tabs
  }

  filterUsers() {
    const query = this.searchQuery.toLowerCase();
    if (this.selectedTab === 'owners') {
      this.filteredOwners = this.owners.filter(owner =>
        owner.name.toLowerCase().includes(query) || owner.email.toLowerCase().includes(query)
      );
    } else {
      this.filteredClients = this.clients.filter(client =>
        client.name.toLowerCase().includes(query) || client.email.toLowerCase().includes(query)
      );
    }
  }
  protected readonly getUrl = getUrl;
}
