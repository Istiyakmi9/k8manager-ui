import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { CommonService } from '../services/common.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {

  constructor(private common: CommonService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.common.isLoading.next(true);
    return next.handle(request).pipe(
      finalize(() => {
        this.common.isLoading.next(false);
      })
    );
  }
}
