import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster  } from 'ngx-sonner';
import { Navbar } from './shared/components/navbar/navbar';


@Component({
  imports: [RouterOutlet, NgxSonnerToaster, Navbar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('cineverse');


}
