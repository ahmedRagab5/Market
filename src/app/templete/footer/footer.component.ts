import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp , faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

import { TranslocoModule } from '@jsverse/transloco';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FontAwesomeModule,TranslocoModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  faWhatsapp = faWhatsapp;
  faLinkedin = faLinkedin;
  faGithub = faGithub;
}
