import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';



@Component({
  selector: 'app-modal-timer',
  templateUrl: './modal-timer.component.html',
  styleUrls: ['./modal-timer.component.scss'],
})
export class ModalTimerComponent implements OnInit {
  secs = new FormControl(10);
  timers: number;
  countdownDisplay?: string;
  start: boolean;
  stop: boolean;
  restart: boolean;

  constructor(private modalCtrl: ModalController, private toast: ToastController) { }

  ngOnInit() {
    this.timers = 10;
    this.start = this.stop = this.restart = false;
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  async toastCreate() {
    const notify = await this.toast.create({
      message: 'Timer concluso, è ora di bere!!!', //message
      duration: 500  //durata

    });
    notify.present();
    //da aggiungere il present
  }

  async restartTimer() {
    this.stop = true;
    await this.delay(1000);
    this.countDown();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async countDown() {
    let secondi = this.secs.value + 1;
    this.countdownDisplay = String(secondi);
    this.start = true;
    while (secondi > 0) {
      if (this.restart) {
        secondi = this.secs.value + 1;
        this.restart = false;
      }
      if (this.stop) {
        this.countdownDisplay = undefined;
        this.start = this.stop = false;
        break;
      }
      secondi--;
      this.countdownDisplay = String(secondi);
      await this.delay(1000);
    }
    this.start = false;
    this.toastCreate();
  }
}

