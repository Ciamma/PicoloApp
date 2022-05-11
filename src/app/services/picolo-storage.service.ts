import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class PicoloStorageService {

  constructor() {
  }

  async setItem(key: string, value: any) {
    await Storage.set({ key, value });
    return Storage.get({ key });
  }

  async getString(key: string): Promise<any> {
    return (await Storage.get({ key }));
  }

  async setItemJson(key: string, value: any): Promise<void> {
    await Storage.set({
      key: key,
      value: JSON.stringify(value),
    });
  }

  async getItemJson(key: string): Promise<any> {
    const item = await Storage.get({ key });
    return JSON.parse(item.value);
  }

  async removeItem(key: string) {
    await Storage.remove({ key });
  }

  async clear() {
    await Storage.clear();
  }

}
