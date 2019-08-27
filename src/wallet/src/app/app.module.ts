import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';


import { AssistantComponent } from './assistant/assistant.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { ContactsComponent } from './contacts/contacts.component';
import { SettingsComponent } from './settings/settings.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { IdentityComponent } from './identity/identity.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WelcomeComponent } from './welcome/welcome.component';

import { 
  MatCardModule, 
  MatRippleModule,
  MatButtonModule, 
  MatIconModule, 
  MatMenuModule,
  MatToolbarModule,
  MatBadgeModule,
  MatListModule,
  MatTableModule,
 } 
  from '@angular/material';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


const appRoutes: Routes = [
  { path: 'identity', component: IdentityComponent },
  { path: 'credentials', component: CredentialsComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'alerts', component: NotificationsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'assistant', component: AssistantComponent },
    { path: '',
    redirectTo: '/welcome',
    pathMatch: 'full'
  },
  { 
    path: '**',
    redirectTo: '/welcome',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    AssistantComponent,
    CredentialsComponent,
    ContactsComponent,
    SettingsComponent,
    NotificationsComponent,
    IdentityComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    MatCardModule,
    MatRippleModule,
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule,
    MatToolbarModule,
    MatBadgeModule,
    MatListModule,
    MatTableModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  exports: [
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule,
    MatToolbarModule,
    MatBadgeModule,
    AppComponent,
    AssistantComponent,
    CredentialsComponent,
    ContactsComponent,
    SettingsComponent,
    NotificationsComponent,
    IdentityComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
