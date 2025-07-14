import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { title } from 'node:process';
import { FirebaseService, Product } from '../../../services/firebase.service';
import { addDoc, collection } from 'firebase/firestore';
import { AuthService } from '../../../services/auth.service';
import { Firestore } from '@angular/fire/firestore';
import { count } from 'node:console';
import { WaitComponent } from "../../../templete/wait/wait.component";
import { UserService } from '../../../services/user.service';

export interface item{
  category:string;
  description:string;
  id:number
  image:string;
  price:number;
  rating:{
    count:number;
    rate:number
  };
  title:string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, WaitComponent], // ✅ إضافة CommonModule
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'] // ✅ تصحيح 'styleUrl' إلى 'styleUrls'
})
export class ProductsComponent implements OnInit{
  products:any[]=[];
  addDisplay:boolean=false;
  cartDisplay:boolean=true;
  idclick:number=0;
  items:any[]=[]
  input=new FormControl();
  category:string='all'
  userId:string=''
  cartId:any[]=[]
  load:boolean=true
  selectedControl = new FormControl('all');
  focusId:string=''
  mode:boolean=true
  searchpro:any[]=[]
  pattern=new RegExp('')




  private userService:UserService = inject(UserService);
  private firebaseService:FirebaseService = inject(FirebaseService);
  private router = inject(Router);
  private authService:AuthService = inject(AuthService);



  async ngOnInit(){

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (localStorage.getItem('select')) {
        this.selectedControl.setValue(localStorage.getItem('select'))
      }
      else{
        localStorage.setItem('select','all')
      }
    }


    this.isFound()
    this.firebaseService.getItems(`products`).subscribe( data => {
      this.products = data;
      if (data) {
        this.load=false
        this.searchpro=data
      }
    });


  }

  selectChange(){
    localStorage.setItem('select',this.selectedControl.value||'all')
  }

  isFound(){
    this.authService.getCurrentUserId().subscribe(uid => {
      this.userId = uid?uid:'';
      if(uid){
      this.firebaseService.getCart(this.userId).then(data=>{
        this.cartId=data

      })

      // console.log("المعرف الفريد للمستخدم:", this.userId);
    }});
  }

  addTocart(product:item){
    this.addDisplay=true;
    this.idclick=product.id;
    this.input.setValue(0)
  }
  async add(product:item){
    if((this.input.value > 0) && this.userId ){

      this.isFound()
        this.addDisplay=false;
        this.idclick=product.id;
        const found=this.cartId.find(item => item.productId === product.id)

        if (found) {
          this.firebaseService.getCartById(this.userId,found.cartId).then(data=>{
            const newdata={quantity:data.quantity + this.input.value}
            this.firebaseService.updateCartProduct(this.userId,found.cartId,newdata)
            this.input.setValue(null)
          })

        }
        else{
          const item={
            item:{
              id:product.id,
              title:product.title,
              image:product.image,
              price:product.price,
            },
            quantity:this.input.value,
          }
          if (this.userId) {
            this.firebaseService.addToCart(this.userId,item)
            this.addDisplay=false
          }
        }



    }
  }





  details(productId:string){
    this.router.navigate(['/details', productId], {
      queryParams: { path: this.userId?'/products':'/guestProducts' }
    });
  }

  change(event:Event){
    const value=(event.target as HTMLInputElement).value
    this.pattern=new RegExp(`^${value}.*`)
    this.searchpro=this.products.filter(item=> this.pattern.test(item.title.toLowerCase()))
  }
}
