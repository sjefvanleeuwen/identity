import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { global } from '../app.globals';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
  })
export class SignalRService {
    hubConnection: HubConnection;

    constructor() {
        console.log('SignalRService Constructed');
    }

    public connect(): void {
        console.log('signalRService connect()');
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(environment.eventHub,
            {
                accessTokenFactory: () => global.loggedInUser.token
            })
            .build();
            this.hubConnection
                .start()
                .catch(err => document.write('Error connecting to signalr eventhub'))
                .then(() => {
                    this.hubConnection.invoke('connected');
            });
    }
}