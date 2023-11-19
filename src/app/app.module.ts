import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from  '@angular/common/http'
import { FormsModule } from '@angular/forms';
import { EditorComponent } from './editor/editor.component';
import { LoaderComponent } from './loader/loader.component';
import { AppInterceptor } from './auth/app.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoaderComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
