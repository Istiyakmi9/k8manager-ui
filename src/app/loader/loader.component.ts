import { Component } from '@angular/core';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  isLoading: boolean = true;

  constructor(private common: CommonService){
    this.common.isLoading.subscribe(res => {
      this.isLoading = res;
    })
   }
}
