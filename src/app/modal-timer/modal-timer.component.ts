import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { addSeconds, format } from "date-fns";
import { interval, Subject } from 'rxjs';
import { map, takeUntil, takeWhile } from "rxjs/operators";



@Component({
  selector: 'app-modal-timer',
  templateUrl: './modal-timer.component.html',
  styleUrls: ['./modal-timer.component.scss'],
})
export class ModalTimerComponent implements OnInit {
  secs = new FormControl(10);
  countdownDisplay?: string;
  starter$ = new Subject<void>();
  startC: boolean;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.countdownDisplay = "00:00";
    this.startC = false;
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  startCountdown(): void {
    this.starter$.next();  // clear pending timers
    this.startC = true;
    let nsecs = this.secs.value;
    interval(1000)
      .pipe(
        takeUntil(this.starter$),
        takeWhile(countup => countup <= nsecs),
        map(countup => {
          let countdown = nsecs - countup;
          let d = new Date();
          d.setHours(0, 0, 0, 0);
          d = addSeconds(d, countdown);
          let fmt = format(d, "mm:ss");
          return fmt;
        }))
      .subscribe(cd => this.countdownDisplay = cd,
        (err) => console.log(err),
        () => {
          this.startC = false;
        }
        // () => alert("ding")
      );
  }
}

