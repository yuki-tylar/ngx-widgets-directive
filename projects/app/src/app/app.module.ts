import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DirectiveModule } from 'directive';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DirectiveModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
