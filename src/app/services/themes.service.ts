import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class ThemesService {

  private translocoService:TranslocoService = inject(TranslocoService);
  mode='light'
  lang='en'
  constructor(){

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.mode=localStorage.getItem('mode') || 'light'
      this.lang=localStorage.getItem('lang') || 'en'
    }

    

    this.toggleMode();
    this.toggleLang(this.lang);
  }


  activeMode(){
    this.mode=this.mode==='light'?'dark':'light';
    if (typeof window !== 'undefined' && typeof document !== 'undefined'){
      localStorage.setItem('mode',this.mode)
    }


    this.toggleMode();
  }


  private toggleMode(){
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.body.classList.toggle('dark-mode',this.mode==='dark')
    }
  }

  getMode(){
    return this.mode
  }

  // ************
  activeLang(){
    this.lang=this.lang==='en'?'ar':'en';
    if (typeof window !== 'undefined' && typeof document !== 'undefined'){
      localStorage.setItem('lang',this.lang)
    }



    this.toggleLang(this.lang);
  }


  private toggleLang(lang:string){

    this.translocoService.setActiveLang(lang);
    if (typeof window !== 'undefined' && typeof document !== 'undefined'){
      document.body.classList.toggle('arab-lang',this.lang==='ar')
    }


  }

  getLang(){
    return this.lang
  }

}
