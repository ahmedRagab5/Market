import { ChangeDetectorRef, Component, inject, input } from '@angular/core';
import { FormArray, FormBuilder, FormControl , ReactiveFormsModule,FormGroup, FormsModule} from '@angular/forms';
import { FirebaseService, item, Product } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { AuthService } from '../../services/auth.service';
import { filter, forkJoin } from 'rxjs';
import { WaitComponent } from "../../templete/wait/wait.component";
import { UserService } from '../../services/user.service';

interface CartItem {
  item:{
    title:string,
    image:string,
    price:number
  }
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, WaitComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cart:any[]=[]
  success:boolean=false;
  items:any[]=[]
  cusItems:any[]=[]
  userId:string=''
  user:any={}
  isDisabled:boolean[]=[]
  disabled:boolean=false
  custom:boolean=false;
  isCustom:boolean[]=[]
  isRun:boolean=false
  done:boolean=false
  load:boolean=true
  private userService:UserService=inject(UserService)
  constructor(private firebaseService:FirebaseService,private authService:AuthService,private cdRef: ChangeDetectorRef){}

  async ngOnInit(){




    this.authService.getCurrentUserId().subscribe(uid => {
      if (!uid || uid.trim() === '') {
        console.warn("⚠️ لم يتم العثور على userId، تأكد من تسجيل الدخول.");
        return; // ❗️ أوقف التنفيذ هنا
      }
      this.userId = uid ?? '';

      if (uid) {
        this.firebaseService.getItems(`user/${uid}/cart`).subscribe(cartItems => {
          this.items = cartItems;
          if (cartItems) {
            this.load=false
          }
          const observables = this.items.map(item =>
            this.firebaseService.getProductCountById(item.item.id)
          );

          forkJoin(observables).subscribe(counts => {
            this.isDisabled = this.items.map((item, i) => {
              const overLimit = item.quantity > counts[i];
              return overLimit;
            });
            if (!this.isRun) {
              this.isCustom = this.items.map(() => {
                return false;
              });
              this.isRun=true
            }

            this.disabled = this.isDisabled.includes(true);
          });
        });

        this.firebaseService.getUserById(this.userId).then(data=>{
          this.user=data
        })
      } else {
        console.warn("⚠️ لم يتم العثور على userId، تأكد من تسجيل الدخول.");
      }

  });
  }






  async plus(product: any,index:number) {
    const newQuantity = {quantity:product.quantity + 1}
    product.quantity=product.quantity + 1
    this.firebaseService.updateCartProduct(this.userId,product.id,newQuantity)
    await this.chek(product,index)
    this.customItems()
}


  minas(product:Product,index:number){
    if(product.quantity > 1){
      const newQuantity = {quantity:product.quantity - 1}
      if(product.id){
              this.firebaseService.updateCartProduct(this.userId,product.id,newQuantity)
              product.quantity=product.quantity - 1
              this.chek(product,index)
      }
      this.customItems()
    }

  }

  delete(product:Product){
    if (product.id) {
      this.firebaseService.deleteCartItem(this.userId,product.id)
    }
  }
  clear(){
    this.firebaseService.clearCart(this.userId)
  }
  total(product:Product){
    return (product.quantity * product.item.price).toFixed(3);
  }

  getTotal(items:any[]): number {
    return (items.reduce((total, item) => total + item.item.price * item.quantity, 0)).toFixed(3);
  }
  successCheck(){
    this.success = this.items.length>0 ?true:false;
  }

  timeNow(){
    const timestamp = Timestamp.now();
    const date = new Date(timestamp.seconds * 1000);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
    //   const day = date.getDate().toString().padStart(2, '0');
    // const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // const year = date.getFullYear();

    // const hours = date.getHours().toString().padStart(2, '0');
    // const minutes = date.getMinutes().toString().padStart(2, '0');
    // const seconds = date.getSeconds().toString().padStart(2, '0');

    // const formattedDate = `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate
  }
  async order(items:Product[]){
    if (!this.isDisabled.includes(true)||items.length>=1) {
      const name=`${this.user.name.fName +' ' + this.user.name.lName}`
      this.firebaseService.addOrder(this.userId,items,this.timeNow(),name)
      let nOrder;
      if (this.user.order>0) {
        nOrder=this.user.order + 1
        console.log("user "+this.user.order)
      }
      else{
        console.log("new")
        nOrder=1;
      }
      console.log(nOrder)
      this.firebaseService.updateUser(this.user.id,{order:nOrder})
      this.done=true
      setTimeout(()=>this.done=false,4000)
    }

  }
  orderOne(item:Product){
    this.firebaseService.getProductById(item.item.id).then(data=>{
      if (item.quantity<=data.rating.count) {
        this.order([item])
      }
    })
  }

  chek(item:any,index:number){
    this.firebaseService.getProductCountById(item.item.id).subscribe(count=>{
      this.isDisabled[index]=(item.quantity>count)
      if (item.quantity>count) {
        this.isCustom[index]=false
      }
      this.disabled=this.isDisabled.includes(true)
      this.customItems()

    })


  }
  cancel(){
    this.custom=false;
    this.isCustom=this.isCustom.map(()=>false)
  }
  customItems(){
      const custom=this.items.map((item,i)=>this.isCustom[i]&&(!this.isDisabled[i])?item:null)
      this.cusItems=custom.filter(item=>item!==null)
  }
  cusOrder(){
    // console.log(this.isCustom)
    if (this.isCustom.includes(true)) {

      const custom=this.items.map((item,i)=>this.isCustom[i]?item:null)
      this.cusItems=custom.filter(item=>item!==null)


      const newItems=this.items.map((item,i)=>!this.isCustom[i]?item:null)
      const x=newItems.filter(item=>item!==null)
      this.isCustom = x.map(() => {
                return false;
      });

      this.order(this.cusItems)

        this.isCustom.forEach((value,i)=> {
        if (value) {
          this.isCustom.splice(i,1)
        }
        });

        this.cusItems=[]



    }
  }

  count(id:any){
    this.firebaseService.getProductCountById(id).subscribe(count=>{
      return count;
    })
  }

}
