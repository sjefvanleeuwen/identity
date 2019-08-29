import { Component, OnInit } from '@angular/core';
import { IdentityComponent } from '../identity/identity.component';
import { CredentialsComponent } from '../credentials/credentials.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
