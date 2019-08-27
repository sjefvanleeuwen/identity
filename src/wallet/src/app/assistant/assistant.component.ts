import { Component, OnInit } from '@angular/core';


declare global {
  interface Window { chatWindow: any; }
}

window.chatWindow = window.chatWindow || {};
declare const Bubbles: any;

@Component({
  selector: 'app-assistant',
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.scss']
})
export class AssistantComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    window.chatWindow = new Bubbles(
      document.getElementById('chat'), // ...passing HTML container element...
      "window.chatWindow" // ...and name of the function as a parameter
    );
    
    window.chatWindow.talk(
      // pass your JSON/JavaScript object to `.talk()` function where
      // you define how the conversation between the bot and user will go
      {
        // "ice" (as in "breaking the ice") is a required conversation object
        // that maps the first thing the bot will say to the user
        "ice": {
    
          // "says" defines an array of sequential bubbles
          // that the bot will produce
          "says": [ "Hey!", "Can I have a banana?" ],
    
          // "reply" is an array of possible options the user can pick from
          // as a reply
          "reply" : [
            {
              "question" : "🍌",  // label for the reply option
              "answer" : "banana",  // key for the next conversation object
            }
          ]
        }, // end required "ice" conversation object
    
        // another conversation object that can be queued from within
        // any other conversation object, including itself
        "banana" : {
          "says" : [ "Thank you!", "Can I have another banana?"],
          "reply": [
            {
              "question": "🍌🍌",
              "answer": "banana"
            }
          ]
        } // end conversation object
      } // end conversation object
    );
  }

}
