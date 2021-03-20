import { Injectable } from '@angular/core';

(window as any).global = window;
// @ts-ignore
window.Buffer = window.Buffer || require('buffer').Buffer;

@Injectable({
  providedIn: 'root'
})
export class WebcryptoService {

  private _iv: Uint8Array;
  private _salt: Uint8Array;

  constructor() {
    this.generateNewSalt();
  }

  get iv(): string {
    const hex = Buffer.from(this._iv).toString('hex');
    return hex;
  }

  set iv(hexValue: string) {
    this._iv = Buffer.from(hexValue, 'hex');
  }

  get salt(): string {
    const hex = Buffer.from(this._salt).toString('hex');
    return hex;
  }

  set salt(hexValue: string) {
    this._salt = Buffer.from(hexValue, 'hex');
  }

  async createCriptoKey(password: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: this._salt,
          iterations: 1000,
          hash: 'SHA-512'
        },
        keyMaterial,
        { name: 'AES-CBC', length: 128 },
        true,
        ['encrypt', 'decrypt']
    );
    return key;
  }

  /*
   * Encrypt the message.
   */
  async encryptMessage(message: string, password: string) {
    const key = await this.createCriptoKey(password);
    const enc = new TextEncoder();
    const encoded = enc.encode(message);
    // The iv must never be reused with a given key.
    this._iv = window.crypto.getRandomValues(new Uint8Array(16));
    const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: 'AES-CBC',
          iv: this._iv
        },
        key,
        encoded
    );

    const buffer = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    return buffer;
  }

  /*
  * Decrypt  the message.
  */
  async decryptMessage(encryptedMessage: string, password: string) {
    const key = await this.createCriptoKey(password);
    const bytes = Uint8Array.from(atob(encryptedMessage), v => v.charCodeAt(0));
    if (!this._iv) {
      throw new Error('The block IV must be set first');
    }
    if (!this._salt) {
      throw new Error('The salt must be set first');
    }

    const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-CBC',
          iv: this._iv
        },
        key,
        bytes
    );

    const dec = new TextDecoder();

    return dec.decode(decrypted);
  }

  toHexadecimal(text: Uint8Array) {
    let hex, i;

    const result = [];
    for (i = 0; i < text.length; i++) {
      hex = Number(text[i].toString(16));
      result.push(hex);
    }

    return result.join('');
  }

  buf2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }

  toByteArray(hexString) {
    const result = [];
    for (let i = 0; i < hexString.length; i += 2) {
      result.push(parseInt(hexString.substr(i, 2), 16));
    }
    return result;
  }

  toHex(str: string) {
    const arr1 = [];
    for (let n = 0, l = str.length; n < l; n++) {
      const hex = Number(str.charCodeAt(n)).toString(16);
      arr1.push(hex);
    }
    return arr1.join('');
  }

  _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  _base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  }

  generateNewSalt() {
    this._salt = window.crypto.getRandomValues(new Uint8Array(16));
  }

}
