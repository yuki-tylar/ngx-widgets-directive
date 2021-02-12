import { NgModule } from '@angular/core';
import { FocusDirective } from './focus.directive';
import { ClickOutsideDirective } from './click-outside.directive';
import { DraggableDirective } from './draggable.directive';



@NgModule({
  declarations: [FocusDirective, ClickOutsideDirective, DraggableDirective],
  imports: [
  ],
  exports: [FocusDirective, ClickOutsideDirective, DraggableDirective]
})
export class DirectiveModule { }
