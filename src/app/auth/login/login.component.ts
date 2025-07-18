import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLinkActive,RouterLink } from '@angular/router';
// import { Router } from 'express';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,TranslocoModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private auth:Auth=inject(Auth)
  private authService:AuthService=inject(AuthService)
  private userService:UserService=inject(UserService)
  private router:Router=inject(Router)
  private fb:FormBuilder=inject(FormBuilder)
  private firebaseService:FirebaseService=inject(FirebaseService)


  loginForm:any

  ngOnInit(){
    this.loginForm= this.fb.group({

          email: ['', [Validators.required,]],
          password: ['', [Validators.required,]],
      });
  }


  // role:any='';
  hid:boolean=false
  async login(){

    try{
      await signInWithEmailAndPassword(this.auth,this.loginForm.get('email')?.value,this.loginForm.get('password')?.value)
      this.hid=false
      if (typeof window !== 'undefined' && typeof document !== 'undefined'){
        localStorage.setItem("role",'user')
      }

      this.authService.getCurrentUserId().subscribe(uid => {
        const id=uid
        if (id) {
          this.firebaseService.getUserById(uid!).then( (data)=>{

            if (data) {
              this.router.navigate(['/products'])
            }
            else{
              this.router.navigate(['/admProducts'])
            }

          })

        }

      });



    }
    catch{
      this.hid=true

    }
  }



  //  changeLang(lang: string) {
  //   console.log("heree")
  //   this.translocoService.setActiveLang(lang);
  //   document.documentElement.lang = lang;
  //   document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  // }
}
