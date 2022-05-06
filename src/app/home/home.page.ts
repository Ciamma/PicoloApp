import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PicolodbService } from '../services/picolodb.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private db: PicolodbService, private router: Router) {
  }
  ngOnInit(): void {
  }

  goToPage() {
    this.router.navigate(['config']);
  }
}