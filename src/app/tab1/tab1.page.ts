import { Component } from '@angular/core';
import { WebcryptoService } from '../shared/services/webcrypto.service';
import { Directory, Filesystem } from '@capacitor/filesystem';
import * as log from 'loglevel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  text = 'Hello World';
  pwd = 'Maracé';
  decrypted: string;

  constructor(private route: Router) {
  }

  requestPermissions() {
    // THIS CODE DOES NOT WORK. It always goes to the error code...
    // I need a way to wait for the user input to allow or not READ / WRITE permissions
    // Other question is: How can I ensure/trust that this automatic dialog and behavior will appear/run equally in all mobile phone and Android versions ?
    Filesystem.requestPermissions().then(() => {
        log.info('Directory permissions: PASSED')
        this.readDocumentsDirectory().then(() => log.info('DOCUMENTS Directory can be read: PASSED'))
          .catch(err =>  log.error('DOCUMENTS Directory can be read: FAILED. Error: ', err));
      },
      error => {
        log.error('Directory permissions: FAILED. Error: ', error);
        this.route.navigateByUrl('/error-page');
      }).catch(error => {
      log.error('Directory permissions: FAILED. Error: ', error);
      this.route.navigateByUrl('/error-page');
    });
  }

  readdir() {
    this.readDocumentsDirectory().then(() => log.info('DOCUMENTS Directory can be read: PASSED'))
      .catch(err =>  log.error('DOCUMENTS Directory can be read: FAILED. Error: ', err));
  }


  async readDocumentsDirectory(): Promise<string[]> {
    let files: string[] = [];
    const ret = await Filesystem.readdir({
      path: '',
      directory: Directory.Documents
    });
    if (ret && ret.files.length > 0) {
      files = ret.files.slice();
    }
    return files;
  }
}
