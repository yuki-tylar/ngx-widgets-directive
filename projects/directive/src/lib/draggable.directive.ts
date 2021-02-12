import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[ngxDraggable]'
})
export class DraggableDirective {

  @Input() ngxDraggable?: any; /** not used */

  @Input() direction?: 'vertical' | 'horizontal' | 'all' = 'all';

  @Output() dragstart = new EventEmitter<DragEvent>();
  @Output() dragend = new EventEmitter<DragEvent>();
  @Output() drag = new EventEmitter<DragEvent>();

  private status: {type: 'mouse'|'touch'|null, isOn: boolean} = {type: null, isOn: false};
  private coordLog: CoordsWithTimestamp[] = [];
  private timer: any;

  constructor() { }


  @HostListener('mousedown', ['$event']) Mousedown(e: MouseEvent){ this.onDragStart(e); }
  @HostListener('touchstart', ['$event']) Touchstart(e: TouchEvent){ this.onDragStart(e); }

  @HostListener('window:mousemove', ['$event']) Mousemove(e: MouseEvent){ this.onDrag(e); }
  @HostListener('window:touchmove', ['$event']) Touchmove(e: TouchEvent){ this.onDrag(e); }

  @HostListener('window:mouseup', ['$event']) Mouseup(e: MouseEvent){ this.onDragEnd(e);  }
  @HostListener('window:touchend', ['$event']) Touchend(e: TouchEvent){ this.onDragEnd(e); }

  isEventTypeMatch(e: MouseEvent | TouchEvent): boolean{
    if(
      (this.status.type == 'mouse' && e instanceof MouseEvent) || 
      (this.status.type == 'touch' && e instanceof TouchEvent)
    ){    return true;  }
    else{ return false; }
  }

  resetTimer(){ if(this.timer){ clearTimeout(this.timer); }}


  onDragStart(e: MouseEvent | TouchEvent){
    e.preventDefault();

    if(this.status.type === null || this.isEventTypeMatch(e)){
      const c = new Coords(e);
      const de = new DragEvent(c);

      this.status = { type: de.inputType, isOn: true };      
      this.coordLog.unshift({x: de.x, y: de.y, timestamp: e.timeStamp});

      this.resetTimer();
      this.dragstart.emit(de);
    }
  }

  onDrag(e: MouseEvent | TouchEvent){
    if( this.status.isOn && this.isEventTypeMatch(e)){
      e.preventDefault();
      const c = new Coords(e);

      if(this.direction == 'horizontal' && c.x == this.coordLog[0].x){ /** no move detect */ }
      else if(this.direction == 'vertical' && c.y == this.coordLog[0].y){ /** no move detect */ }
      else if(this.direction == 'all' && c.x == this.coordLog[0].x && c.y == this.coordLog[0].y){ /** no move detect */ }
      else{
        const de = new DragEvent(c, this.coordLog[this.coordLog.length - 1], this.coordLog[0] );

        this.coordLog.unshift({x: de.x, y: de.y, timestamp: e.timeStamp});
        this.drag.emit(de)
      }
    }
  }

  onDragEnd(e: MouseEvent | TouchEvent){
    if(this.status.isOn && this.isEventTypeMatch(e)){
      e.preventDefault();
      const c = new Coords(e);
      const de = new DragEvent(c, this.coordLog[this.coordLog.length - 1], this.coordLog[0] );

      this.coordLog = [];
      this.resetTimer(); 
      this.status.isOn = false;


      this.dragend.emit(de)

      this.timer = setTimeout(()=>{ this.status.type = null; }, 500);
    }
  }
}


export class DragEvent {

  get x(){ return this._cc.x } /** current coordX relative to viewport */
  get y(){ return this._cc.y; } /** current coordY relative to viewport */

  get dx(){ return this._delta.x; } /** current coordX - last coordX */
  get dy(){ return this._delta.y; } /** current coordY - last coordY */
  get dxAll(){ return this._deltaAll.x; }
  get dyAll(){ return this._deltaAll.y; }

  get distanceX(){ return Math.abs(this.dx); }
  get distanceY(){ return Math.abs(this.dx); }
  get distance(){  return Math.sqrt( Math.pow(this.dx, 2) + Math.pow(this.dy, 2) ); }

  get distanceXAll(){ return Math.abs(this.dxAll); }
  get distanceYAll(){ return Math.abs(this.dyAll); }
  get distanceAll(){  return Math.sqrt(Math.pow(this.dxAll, 2) + Math.pow(this.dyAll, 2) ); }

  get directionX(){ return (this.dx > 0) ? 1 : (this.dx < 0) ? -1 : 0; }
  get directionY(){ return (this.dy > 0) ? 1 : (this.dy < 0) ? -1 : 0; }
  get directionXAll(){ return (this.dxAll > 0) ? 1: (this.dxAll < -1) ? -1 : 0; }
  get directionYAll(){ return (this.dyAll > 0) ? 1: (this.dyAll < -1) ? -1 : 0; }

  get isMouse(){ return (this.c.e instanceof MouseEvent); }
  get isTouch(){ return (this.c.e instanceof TouchEvent); }
  get inputType(){ return this.isMouse ? 'mouse' : 'touch'; }
  get type(){
    let type: string;
    if(this.c.e.type.match(/mousedown|touchstart/)){ type = 'dragstart'; }
    else if(this.c.e.type.match(/mousemove|toucehmove/)){ type = 'drag'; }
    else{ type = 'dragend'; }
    return type;
  }

  get timeStamp(){ return this.c.e.timeStamp; }

  // preventDefault(){ this.c.e.preventDefault(); }
  // stopPropagation(){ this.c.e.stopPropagation(); }

  private _pc: Coord /** coordinates relative to document */
  private _sc: Coord; /** coordinates relative to screen in device pixels */
  private _cc: Coord; /** coordinates relative to viewport */

  private _delta: Coord = {x: 0, y: 0};
  private _deltaAll: Coord = {x: 0, y: 0};

  constructor(private c: Coords, c0?: Coord, cPrev?: Coord){
    this._pc = c.pc;
    this._sc = c.sc;
    this._cc = c.cc;

    if(c0){ this._deltaAll = {x: c.x - c0.x, y: c.y - c0.y}; }
    if(cPrev){ this._delta = {x: c.x - cPrev.x, y: c.y - cPrev.y}; }
  }
}

interface Coord {
  x: number;
  y: number;
}

interface CoordsWithTimestamp extends Coord{
  timestamp: number;
}

class Coords {
  private _pc: Coord /** coordinates relative to document */
  private _sc: Coord; /** coordinates relative to screen in device pixels */
  private _cc: Coord; /** coordinates relative to viewport */
  private _timestamp: number;

  get x(){ return this._cc.x } /** current coordX relative to viewport */
  get y(){ return this._cc.y; } /** current coordY relative to viewport */
  
  get pc(){ return this._pc; }
  get sc(){ return this._sc; }
  get cc(){ return this._cc; }
  get timestamp(){ return this._timestamp; }

  constructor(public e: MouseEvent | TouchEvent){
    this._pc = (e instanceof MouseEvent) ? {x: e.pageX,   y: e.pageY}   : {x: e.touches[0].pageX,   y: e.touches[0].pageY};
    this._cc = (e instanceof MouseEvent) ? {x: e.clientX, y: e.clientY} : {x: e.touches[0].clientX, y: e.touches[0].clientY};
    this._sc = (e instanceof MouseEvent) ? {x: e.screenX, y: e.screenY} : {x: e.touches[0].screenX, y: e.touches[0].screenY};

    this._timestamp = e.timeStamp;
  }
}