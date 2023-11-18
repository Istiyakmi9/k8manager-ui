import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }
}
