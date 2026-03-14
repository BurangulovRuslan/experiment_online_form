import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root-legacy',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class App {}
