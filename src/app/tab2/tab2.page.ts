import { Component } from '@angular/core';
import { WebcryptoService } from '../shared/services/webcrypto.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  text = 'Hello World';
  pwd = 'Maracé';
  decrypted: string;

  constructor(private cryptoService: WebcryptoService) {
  }

  encrypt() {
    this.cryptoService.generateNewSalt();
    this.cryptoService.encryptMessage(this.text, this.pwd).then(value => this.decrypted = value);
  }
}
