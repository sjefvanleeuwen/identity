import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnInit {


  constructor() { }

  ngOnInit() {
  }
  messages = [
    {
      image: 'assets/img/certificate-icon.jpg', // Icons should be fetched of blockchain network such as IPFS
      credential:
      {
        "@context": "https://www.w3.org/2018/credentials/v1",
        "id": "link:discipl:ephemeral:394799234772934879324...",
        "type": ["VerifiableCredential", "Uittreksel-GBA-woonplaats"],
        "issuer": "did:discipl:nlx:x509:2349837EF9032783278CD93434...",
        "issuanceDate": "2017-01-01T19:23:24Z",
        "credentialSubject": {
          "BSN": "123456789",
          "CityLivingIn": "The Hague"
        }
      }
    },
    {
      image: 'assets/img/certificate-icon.jpg', // Icons should be fetched of blockchain network such as IPFS
      credential: {
        "@context": "https://www.w3.org/2018/credentials/v1",
        "id": "link:discipl:ephemeral:394799234772934879324...",
        "type": ["VerifiableCredential", "Uittreksel-GBA-woonplaats"],
        "issuer": "did:discipl:nlx:x509:2349837EF9032783278CD93434...",
        "issuanceDate": "2017-01-01T19:23:24Z",
        "credentialSubject": {
          "BSN": "123456789",
          "CityLivingIn": "The Hague"
        }
      }
    },
  ]
}
