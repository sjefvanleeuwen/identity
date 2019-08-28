import { Component, OnInit } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CredentialsComponent } from '../credentials/credentials.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { DigitalMEWallet, DIDNetwork } from '../neo/DigitalME';

const appRoutes: Routes = [
  { path: 'credentials', component: CredentialsComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'alerts', component: NotificationsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: '',
    redirectTo: '/identity',
    pathMatch: 'full'
  },
  { 
    path: '**',
    redirectTo: '/identity',
    pathMatch: 'full'
  }
];


@Component({
  selector: 'app-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss']
})
export class IdentityComponent implements OnInit {

  visible: boolean = true;

  constructor() { }

  ngOnInit() {
    var wallet = new DigitalMEWallet({name: "MyWallet"});
    var DID = wallet.createDID(DIDNetwork.TestNet);
    console.log('wallet', wallet)
    console.log('DID', DID)
  }
}
