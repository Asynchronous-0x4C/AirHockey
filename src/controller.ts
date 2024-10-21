import p5, { Vector } from "p5";
import { VirtualStick } from "./UI";

type p5touch={x:number,y:number,minX:number,minY:number,id:number};

export class Controller{
  touchList:Array<Touch>=[];
  pressedKeyCode:Array<number>=[];
  keyPress:boolean=false;
  p:p5;

  constructor(p:p5){
    this.p=p;
    const moveStick=new VirtualStick(p);
    moveStick.setBounds(new Vector(100,100),new Vector(100,100));
  }

  update(){
    this.touchList.forEach((t,i)=>{
      if(!t.update())this.touchList.splice(i,1);
    });
    this.p.touches.forEach((t:{}|p5touch)=>{
      let exist=false;
      this.touchList.forEach(l=>{
        if(l.id==(t as p5touch).id)exist=true;
      });
      if(!exist){
        this.touchList.push(new Touch(t as p5touch,this.p));
      }
    });
  }

  display(){
  }

  getTouchByID(id:number):Touch|null{
    let result=null;
    this.touchList.forEach(t=>{
      if(t.id===id)result=t;
    });
    return result;
  }

  pressed(code:number){
    this.pressedKeyCode.push(code);
  }

  released(code:number){
    this.pressedKeyCode=this.pressedKeyCode.filter(k=>!(k==code));
  }

  private binaryToAngle(dir:number){
    let angle=0;
    let mag=0;

    let horizonal=(dir&0b1100)>>2;
    horizonal=(horizonal==0b11?0b00:horizonal);
    let vertical=dir&0b0011;
    vertical=(vertical==0b11?0b00:vertical);

    dir=horizonal<<2|vertical;
    switch(dir){
      case 0b0010:angle=Math.PI*0.5; mag=1;break;
      case 0b0001:angle=Math.PI*1.5; mag=1;break;
      case 0b1000:angle=0;           mag=1;break;
      case 0b1010:angle=Math.PI*0.25;mag=1;break;
      case 0b1001:angle=Math.PI*1.75;mag=1;break;
      case 0b0100:angle=Math.PI;     mag=1;break;
      case 0b0110:angle=Math.PI*0.75;mag=1;break;
      case 0b0101:angle=Math.PI*1.25;mag=1;break;
    }

    return {angle:angle,mag:mag};
  }

  getMove(){
    let dir=0b0000;//x+,x-,y+,y-
    this.pressedKeyCode.forEach((k)=>{
      switch(k){
        case 87:
          dir|=0b0001;
          break;
        case 83:
          dir|=0b0010;
          break;
        case 68:
          dir|=0b1000;
          break;
        case 65:
          dir|=0b0100;
          break;
      }
    });

    return this.binaryToAngle(dir);
  }

  getAttack(){
    let dir=0b0000;//x+,x-,y+,y-
    this.pressedKeyCode.forEach((k)=>{
      switch(k){
        case 38:
          dir|=0b0001;
          break;
        case 40:
          dir|=0b0010;
          break;
        case 39:
          dir|=0b1000;
          break;
        case 37:
          dir|=0b0100;
          break;
      }
    });

    return this.binaryToAngle(dir);
  }
}

export class Touch{
  touch:p5touch;
  id:number=0;
  p:p5;
  press:boolean=true;

  constructor(t:p5touch,p:p5){
    this.touch=t;
    this.id=t.id;
    this.p=p;
  }

  update():boolean{
    this.press=false;
    let exist=false;
    this.p.touches.forEach((t:{}|p5touch)=>{
      if((t as p5touch).id===this.id){
        this.touch=t as p5touch;
        exist=true;
      }
    })
    return exist;
  }
}