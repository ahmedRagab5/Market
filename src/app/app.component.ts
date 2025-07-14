import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './templete/navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from './services/firebase.service';
import { CollectionReference, Firestore, collection, getDocs, query } from '@angular/fire/firestore';
import { AuthService } from './services/auth.service';
import { FooterComponent } from './templete/footer/footer.component';
import { UserService } from './services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { provideTransloco, TRANSLOCO_CONFIG, TRANSLOCO_LOADER, translocoConfig, TranslocoModule } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './services/transloco.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, NavbarComponent, ReactiveFormsModule
    ,FormsModule,RouterModule,FooterComponent, TranslocoModule
  ],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {
  title = 'market';
  mode:boolean=true

  private firebaseService:FirebaseService=inject(FirebaseService)
  private firestore:Firestore=inject(Firestore)
  private authService:AuthService=inject(AuthService)
  private router:Router=inject(Router)
  private userService:UserService=inject(UserService)



  ngOnInit(){
    this.userService.mode$.subscribe(m=>{
      this.mode=m
    })
  }
}
