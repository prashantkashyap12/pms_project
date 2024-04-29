import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-customer-new-order',
  templateUrl: './customer-new-order.component.html',
  styleUrls: ['./customer-new-order.component.css']
})
export class CustomerNewOrderComponent implements OnInit {

  constructor(private _http:HttpClient) { }
  ngOnInit(): void {
    this.dataget()
  }

  private auth ='http://localhost:3000/customerManagement'
  datatable = [
    {
      id: "1",
      firstName: "Kunwar",
      LastName: "Bahadur kashyap",
      custContact: 987465468,
      altcontact: 8865080562,
      Wallet: 174,
      custBox:215,
      custAddres: "Nagla Ajeeta",
      custlandMark: "mandir",
      custCity: "Agra",
    }
  ];

  btndataView = true;
  AlertView=false;
  @ViewChild ('datalogin', {read: NgForm}) FormEditTemp!:NgForm;


  // POST Data
  dataSend(formData:any){
    if(this.btndataView){
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this._http.post(this.auth,formData).subscribe(res=>{
        console.log(res);
        this.AlertView = true;
        this.FormEditTemp.resetForm();  
      })
    }else{   // Update Operation Fill-2
      if(confirm('Are you Sure want to update this entry')){
        this._http.put(this.auth,formData).subscribe(res=>{
          console.log(res);
        })
      }
    }
  }

  // Delete Data -- DONE
  del(i:any){
    if(confirm("Do You want to delete this : "+this.datatable[i].firstName+" "+this.datatable[i].LastName)){
      this.datatable.splice(i);
      this._http.delete(`${this.auth}/${i}`).subscribe(res=>{
        console.log(res);
      })
    }
  }

  // Fatch Data   -- DONE
  dataget(){
    this._http.get(this.auth).subscribe(res=>{
       const dataupdate = JSON.stringify(res);
       this.datatable = JSON.parse(dataupdate);
       console.log(res);
    })
  }

  
  // Update Operation Fill-1 - DONE
  edit(i:any){
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.btndataView = false;
    let sr = i;
    this.FormEditTemp.setValue({
      firstName: this.datatable[i].firstName,
      LastName: this.datatable[i].LastName,
      custContact: this.datatable[i].custContact,
      altcontact: this.datatable[i].altcontact,
      Wallet: this.datatable[i].Wallet,
      custBox: this.datatable[i].custBox,
      custAddres: this.datatable[i].custAddres,
      custlandMark: this.datatable[i].custlandMark,
      custCity: this.datatable[i].custCity,
    })
  }

}
