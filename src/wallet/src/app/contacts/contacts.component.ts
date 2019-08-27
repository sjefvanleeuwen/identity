import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  constructor() { }

  ngOnInit() {

   
  }
    messages = [
      {
        image: 'https://thispersondoesnotexist.com/image',
        from: 'Entity 1',
        subject: 'Message Subject 1',
        content: 'Message Content 1'
      },
      {
        image: 'https://thispersondoesnotexist.com/image',
        from: 'Entity 2',
        subject: 'Message Subject 2',
        content: 'Message Content 2'
      },
    ]
}
