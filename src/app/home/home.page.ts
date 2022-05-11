import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PicolodbService } from '../services/picolodb.service';
import { Frase } from '../services/picolomodels';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  statusDB: string;

  prova: Set<Frase>;
  constructor(private db: PicolodbService, private router: Router) {
    this.statusDB = 'Caricamento...';
  }
  ngOnInit(): void {
    this.upgradeDB();
  }

  goToPage() {
    this.router.navigate(['config']);
  }

  async upgradeDB() {
    await this.db.verifyDB();
    let status = await this.db.checkStorage();
    if (!status) {
      this.statusDB = 'Online';
    } else {
      this.statusDB = 'Locale';
    }
  }
}