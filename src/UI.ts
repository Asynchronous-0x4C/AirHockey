import p5, { Vector } from "p5";
import { controller } from "./sketch";
import { Touch } from "./controller";

export abstract class UIComponent{
  pid:number=0;
  position:Vector=new Vector(0,0);
  size:Vector=new Vector(0,0);
  p:p5;

  constructor(p:p5){
    this.p=p;
  }

  abstract update():void;

  abstract display():void;

  setBounds(pos:Vector,size:Vector){
    this.position=pos;
    this.size=size;
  }
}

export class VirtualStick extends UIComponent{
  deadzone:number=0.05;
  active:boolean=false;
  touch:Touch|null=null;
  touchDir:Vector=new Vector(0,0);

  constructor(p:p5){
    super(p);
  }

  update(){
    if(this.active){
      let current:Touch|null=null;
      controller.touchList.forEach(t=>{
        if(t.id==this.pid)current=t;
      });
      if(current==null){
        this.active=false;
        this.touch=null;
        this.touchDir.set(0,0);
      }else{
        this.touch=current;
        this.touchDir=this.getDir(this.touch);
      }
    }else{
      controller.touchList.forEach(t=>{
        if(this.canFocus(t)){
          this.pid=t.id;
          this.active=true;
          this.touch=t;
        }
      });
    }
  }

  display(): void {
    this.p.noFill();
    this.p.stroke(230,200);
    this.p.circle(this.position.x,this.position.y,this.size.x*0.5);
    this.p.fill(230,200);
    this.p.noStroke();
    this.p.circle(this.position.x+this.touchDir.x,this.position.y+this.touchDir.y,this.size.x*0.4);
  }

  private canFocus(t:Touch):boolean{
    const dx=t.touch.x-this.position.x;
    const dy=t.touch.y-this.position.y;
    const r=this.size.x*0.4;
    return dx*dx+dy*dy<=r*r;
  }

  private getDir(t:Touch){
    const d=new Vector(t.touch.x-this.position.x,t.touch.y-this.position.y);
    const r=this.size.x*0.25;
    return d.limit(r);
  }
}