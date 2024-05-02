import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-working-report-list',
  templateUrl: './customer-working-report-list.component.html',
  styleUrls: ['./customer-working-report-list.component.css'],
})
export class CustomerWorkingReportListComponent implements OnInit {
  private orders = 'http://localhost:3000/orders';
  private customers = 'http://localhost:3000/customerManagement';
  private products = 'http://localhost:3000/products';

  datatable: any;
  customerList: any;
  customerForm: any;
  productForm: any;
  productList: any;
  viewOrderDetail: any;
  fromDate: any;
  toDate: any;
  searchName: any;
  searchStatus = null;
  @ViewChild('datalogin', { read: NgForm }) FormEditTemp!: NgForm;

  constructor(private _http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      selectCustomer: [null, Validators.required],
      name: [{ value: '', disabled: true }],
      contact: [{ value: '', disabled: true }],
      wallet: [{ value: '', disabled: true }],
      box: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
    });
    this.productForm = this.fb.group({
      productName: [null, Validators.required],
      box: [null, Validators.required],
      totalWeight: [null, Validators.required],
      goodsWeight: [null, Validators.required],
      totalBill: [null, Validators.required],
      payAmount: [null, Validators.required],
      submitBox: [null, Validators.required],
    });
    this.getProducts();
    this.getCustomers();
    this.getOrdersJson();
  }

  getOrdersJson() {
    this._http.get(this.orders).subscribe((res) => {
      const dataupdate = JSON.stringify(res);
      this.datatable = JSON.parse(dataupdate);
      this.datatable.map((ele: any) => {
        this.customerList.map((custEle: any) => {
          console.log(ele, 'ele');
          this.productList.map((prodEle: any) => {
            if (ele.items[0].id == prodEle.id) {
              ele['prodName'] = prodEle.productName;
            }

            if (ele.customerId == custEle.id) {
              ele['name'] = custEle.firstName + ' ' + custEle.LastName;
              ele['contact'] = custEle.custContact;
              ele['wallet'] = custEle.Wallet;
              ele['box'] = custEle.custBox;
            }
          });
        });
      });
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

  normalizeString(input: string): string {
    return input.replace(/\s+/g, '').toLowerCase();
  }

  searchOrder(event: any) {
    this.getOrdersJson();
    setTimeout(() => {
      this.datatable = this.datatable.filter((order: any) => {
        const validName = event.searchName
          ? this.normalizeString(order.name) ===
            this.normalizeString(event.searchName)
          : true;
        const validStatus = event.searchStatus
          ? this.normalizeString(order.status) ===
            this.normalizeString(event.searchStatus)
          : true;

        let validFromDate = true;
        let validToDate = true;

        if (event.fromDate) {
          const from = new Date(event.fromDate);
          const orderDate = new Date(order.autoDate);
          validFromDate = orderDate >= from;
        }

        if (event.toDate) {
          const to = new Date(event.toDate);
          to.setHours(23, 59, 59, 999); // Include the whole day
          const orderDate = new Date(order.autoDate);
          validToDate = orderDate <= to;
        }

        return validName && validStatus && validFromDate && validToDate;
      });
    }, 2000);
  }

  printPage() {
    window.print();
  }
  viewOrder(order: any) {
    console.log(order);

    this.viewOrderDetail = order;
  }

  clearFilter(dataLogin: NgForm) {
    this.FormEditTemp.resetForm();
    this.getOrdersJson();
  }
}
