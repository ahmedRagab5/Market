import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { acount, FirebaseService } from '../../services/firebase.service';
import { doc, Firestore, onSnapshot } from 'firebase/firestore';
import { UserService } from '../../services/user.service';
import { ThemesService } from '../../services/themes.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun , faMoon} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,RouterLinkActive,ReactiveFormsModule,TranslocoModule,FontAwesomeModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{

  faSun=faSun;
  faMoon=faMoon


    private userService:UserService=inject(UserService)

  private authService:AuthService=inject(AuthService)
  private firebaseService:FirebaseService=inject(FirebaseService)
  private themesService:ThemesService=inject(ThemesService)
  private auth:Auth=inject(Auth)
  private router:Router = inject(Router);
  private translocoService:TranslocoService = inject(TranslocoService);

  langSelect=new FormControl("en")

  isLoggedIn:boolean=false;
  role:string='';
  rLink:string=''
  path:string=''
  image:string=''
  user:any
  m:string=''
  l:string=''




  ngOnInit(){
    this.m=this.themesService.getMode();
    this.l=this.themesService.getLang();

    this.langSelect.setValue(this.l)

    onAuthStateChanged(this.auth,async (user) => {
      this.isLoggedIn = !!user;
      this.role=''
      this.authService.getCurrentUserId().subscribe(id=>{
        const uid=id
        if(uid){
          this.firebaseService.getUserById(uid!).then( (data)=>{


              if (data) {
                this.user=data;
                this.role='user'
                this.image=this.user.image
              }
              else{
                this.role='admine'
                this.userService.updateRole('admine')
              }


        })
        }
        else{
          this.role=''
        }

      })

    });

    this.userService.profileImage$.subscribe(imageUrl => {
      this.image = imageUrl;
    });



  }
  logOut(){
    this.authService.logout()
    this.role=''
    this.router.navigate(['/guestProducts']);
  }


  mode(){
    // this.userService.changeMode(this.m)
    this.themesService.activeMode()
    this.m=this.m==='light'?'dark':'light';
  }
  lang(){

    this.themesService.activeLang()
    this.l=this.l==='en'?'ar':'en';
  }

  // changeLang(lang: string) {
  //   console.log("heree")
  //   this.translocoService.setActiveLang(lang);
  //   document.documentElement.lang = lang;
  //   document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  // }

}
