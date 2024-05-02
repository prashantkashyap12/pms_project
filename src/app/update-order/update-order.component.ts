import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-order',
  templateUrl: './update-order.component.html',
  styleUrls: ['./update-order.component.css'],
})
export class UpdateOrderComponent implements OnInit {
  customerForm: any;
  productForm: any;
  datatable: any;
  customerList: any;
  productList: any;
  billNumber: any;
  currentDate: any;
  currentTime: any;
  selectedCustomerId: any;
  totalDue: any;
  totalBox: any;
  AlertView = false;
  constructor(private _http: HttpClient, private fb: FormBuilder) {}
  ngOnInit(): void {
    this.customerForm = this.fb.group({
      selectCustomer: [''],
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      contact: [{ value: '', disabled: true }],
      wallet: [{ value: '', disabled: true }],
      box: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
    });
    this.productForm = this.fb.group({
      id: [{ value: '' }],
      productName: [null, Validators.required],
      box: [null, Validators.required],
      totalWeight: [null, Validators.required],
      goodsWeight: [null, Validators.required],
      totalBill: [null, Validators.required],
      payAmount: [null, Validators.required],
      status: [{ value: '' }],
      submitBox: [null, Validators.required],
    });
    this.getOrdersJson();
    this.getCustomers();
    this.getProducts();
  }

  private orders = 'http://localhost:3000/orders';
  private customers = 'http://localhost:3000/customerManagement';
  private products = 'http://localhost:3000/products';
  btndataView = true;

  searchOrder() {
    console.log(this.billNumber);

    if (this.billNumber) {
      const selectedOrder = this.datatable.filter(
        (ele: any) => ele.orderId == this.billNumber
      );
      this.currentDate = selectedOrder[0].autoDate;
      this.currentTime = selectedOrder[0].autoTime;
      this.customerForm.patchValue({
        selectCustomer: selectedOrder[0].customerId,
      });
      this.productForm.patchValue({
        status: selectedOrder[0].status,
        id: selectedOrder[0].id,
      });
      this.productForm.patchValue({
        productName: selectedOrder[0].items[0].id,
        box: selectedOrder[0].items[0].boxNug,
        totalWeight: selectedOrder[0].items[0].totalWeight,
        goodsWeight: selectedOrder[0].items[0].goodsWeight,
        totalBill: selectedOrder[0].items[0].totalBill,
      });
      this.selectCustomer();
      console.log(selectedOrder, 'ORDER');
    }
  }

  // Fatch Data   -- DONE
  getOrdersJson() {
    this._http.get(this.orders).subscribe((res) => {
      const dataupdate = JSON.stringify(res);
      this.datatable = JSON.parse(dataupdate);
      console.log(res);
    });
  }

  getCustomers() {
    this._http.get(this.customers).subscribe((res) => {
      const dataupdate = JSON.stringify(res);
      this.customerList = JSON.parse(dataupdate);
      console.log(res);
    });
  }

  getProducts() {
    this._http.get(this.products).subscribe((res) => {
      const dataupdate = JSON.stringify(res);
      this.productList = JSON.parse(dataupdate);
      console.log(res);
    });
  }

  selectCustomer() {
    this.selectedCustomerId = this.customerForm.value.selectCustomer;
    const selectedCustomer = this.customerList.filter(
      (ele: any) => ele.id == this.selectedCustomerId
    );

    this.processAllControls('enable');
    this.customerForm.patchValue({
      firstName: selectedCustomer[0].firstName,
      lastName: selectedCustomer[0].LastName,
      contact: selectedCustomer[0].custContact,
      wallet: selectedCustomer[0].Wallet,
      box: selectedCustomer[0].custBox,
      address: selectedCustomer[0].custAddres,
    });
    this.totalDue = this.customerForm.get('wallet').value;
    this.totalBox = this.customerForm.get('box').value;
    this.processAllControls('disable');
    console.log(selectedCustomer, selectedCustomer[0].name, 'Customer');
    console.log(this.customerForm);
  }

  processAllControls(type: any) {
    Object.keys(this.customerForm.controls).forEach((field) => {
      console.log(field);

      if (field != 'selectCustomer') {
        const control = this.customerForm.get(field);
        type == 'enable' ? control.enable() : control.disable();
      }
    });
  }

  calculateGoodsWeight() {
    const boxCount = this.productForm.get('box').value || 0;
    const totalWeight = this.productForm.get('totalWeight').value || 0;
    if (boxCount && totalWeight) {
      const boxWeight = 2; // Each box's weight

      // Calculate goods weight
      const goodsWeight = totalWeight - boxCount * boxWeight;

      this.productForm.patchValue({
        goodsWeight: goodsWeight > 0 ? goodsWeight : 0, // Ensure that the goods weight isn't negative
      });
      // this.productForm.get('goodsWeight').disable();
    }
  }
  calculateDueAmount() {
    if (parseFloat(this.productForm.get('payAmount').value)) {
      const totalBill =
        parseFloat(this.productForm.get('totalBill').value) || 0;
      const existingDue =
        parseFloat(this.customerForm.get('wallet').value) || 0;
      const payAmount = parseFloat(this.productForm.get('payAmount').value);
      const currentDue = totalBill + existingDue - payAmount;
      this.customerForm.patchValue({
        wallet: currentDue,
      });
    }
  }
  calculateBoxCount() {
    if (parseFloat(this.productForm.get('submitBox').value)) {
      const currentBox = parseFloat(this.productForm.get('box').value) || 0;
      const existingDueBox =
        parseFloat(this.customerForm.get('box').value) || 0;
      const submitBox = parseFloat(this.productForm.get('submitBox').value);
      const remainingBox = currentBox + existingDueBox - submitBox;
      this.customerForm.patchValue({
        box: remainingBox,
      });
    }
  }

  resetDueAmount() {
    this.customerForm.patchValue({
      wallet: this.totalDue,
    });
  }

  resetBox() {
    this.customerForm.patchValue({
      box: this.totalBox,
    });
  }

  saveOrder() {
    if (this.productForm.get('payAmount').value === null) {
      const totalBill =
        parseFloat(this.productForm.get('totalBill').value) || 0;
      const existingDue =
        parseFloat(this.customerForm.get('wallet').value) || 0;
      const currentDue = totalBill + existingDue;
      this.customerForm.patchValue({
        wallet: currentDue,
      });
    }

    if (this.productForm.get('submitBox').value === null) {
      const currentBox = parseFloat(this.productForm.get('box').value) || 0;
      const existingDueBox =
        parseFloat(this.customerForm.get('box').value) || 0;
      const remainingBox = currentBox + existingDueBox;
      this.customerForm.patchValue({
        box: remainingBox,
      });
    }

    if (
      this.customerForm?.get('wallet')?.value ||
      this.customerForm?.get('box')?.value
    ) {
      this.customerList.filter((ele: any) => {
        if (ele.id == this.customerForm.value.selectCustomer) {
          ele['Wallet'] = this.customerForm?.get('wallet')?.value;
          ele['custBox'] = this.customerForm?.get('box')?.value;
          this._http
            .put(this.customers + '/' + ele.id, ele)
            .subscribe((res) => {
              console.log(res);
            });
        }
      });
    }
    let status;
    if (this.productForm.value.payAmount == 0) {
      status = 'Not Paid';
    } else if (
      this.productForm.value.payAmount == this.productForm.value.totalBill
    ) {
      status = 'Fully Paid';
    } else {
      status = 'Due Pay';
    }

    let postData = {
      id: this.productForm.value.id,
      orderId: this.billNumber,
      autoDate: this.currentDate,
      autoTime: this.currentTime,
      status: this.productForm.value.status,
      customerId: this.selectedCustomerId,
      items: [
        {
          id: this.productForm.value.productName,
          boxNug: this.productForm.value.box,
          totalWeight: this.productForm.value.totalWeight,
          goodsWeight: this.productForm.value.goodsWeight,
          totalBill: this.productForm.value.totalBill,
          payAmount: this.productForm.value.payAmount,
          submitBox: this.productForm.value.submitBox,
        },
      ],
    };
    console.log(postData);

    this._http
      .put(this.orders + '/' + postData.id, postData)
      .subscribe((res) => {
        console.log(res);
        this.AlertView = true;
      });
  }
}
