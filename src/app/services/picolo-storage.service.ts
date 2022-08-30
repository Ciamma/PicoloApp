import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PicoloStorageService {

  constructor() {
  }

  async setItem(key: string, value: any) {
    await Preferences.set({ key, value });
    return Preferences.get({ key });
  }

  async getString(key: string): Promise<any> {
    return (await Preferences.get({ key }));
  }

  async setItemJson(key: string, value: any): Promise<void> {
    await Preferences.set({
      key: key,
      value: JSON.stringify(value),
    });
  }

  async getItemJson(key: string): Promise<any> {
    const item = await Preferences.get({ key });
    return JSON.parse(item.value);
  }

  async removeItem(key: string) {
    await Preferences.remove({ key });
  }

  async clear() {
    await Preferences.clear();
  }

}
