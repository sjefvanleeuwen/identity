import { SignalRService } from './signalr.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { global } from '../app.globals';
import { User } from '../models/dto/user';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
  private loggedInUser = new BehaviorSubject<User>(new User());
  private auth: HubConnection;

  public User = new User();

  get isLoggedInUser() {
    return this.loggedInUser.asObservable();
  }

  constructor(private router: Router, private signalR: SignalRService) {
    console.log('Auth-Service constructed');
  }

  loginInwoner(bsn: number) {
    if (bsn) {
        const user = new User();
        user.bsn = bsn;
        user.loggedIn = true;
        user.isInwoner = true;
        this.loggedInUser.next(user);
        global.loggedInUser = user;
        this.router.navigate(['/stadspas/stadspas-burger']);
    }
  }

  loginProfessional(userName: string, password: string) {
    this.auth = new HubConnectionBuilder()
      .withUrl(environment.authHub)
      .build();
    this.auth
      .start()
      .catch(err => document.write('Error connecting to signalr authenticationhub'))
      .then(() => {
          this.auth.invoke('authenticate', userName, password).then((authUser) => {
              this.User.isProfessional = true;
              this.User.token = authUser.token;
              console.log('authenticate token: ' + this.User.token);
              this.User.loggedIn = true;
              this.User.isProfessional = true;
              this.loggedInUser.next(this.User);
              global.loggedInUser = this.User;
              this.router.navigate(['/stadspas/stadspas-prof']);
              console.log('loginProfessional = ' + userName);
              // auth service connection does not need to stay open.
              this.auth.stop();
              this.signalR.connect();
          });
      });
  }

  logout() {
    this.loggedInUser.next(new User());
    this.router.navigate(['/login']);
  }
}