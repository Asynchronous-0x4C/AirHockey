import p5, { Vector } from "p5";
import { controller, state, states } from "./sketch";

export class StateManager{
  state:State;

  constructor(state:State){
    this.state=state;
  }

  set(state:State){
    this.state=state;
  }

  display(){
    this.state.display();
  }

  update(){
    this.state.update();
  }
}

export class State{
  p:p5;

  constructor(p:p5){
    this.p=p;
  }

  init(){}

  display(){}

  update(){}
}

export class Start extends State{
  mode!: HTMLSelectElement;
  rule!:HTMLSelectElement;
  start!:HTMLButtonElement;
  wrapper!:HTMLDivElement;
  mode_options:Array<string>=["vs CPU","1 vs 1 Casual","1 vs 1 Normal"];
  rule_options:Array<string>=["30s","60s","5pt","10pt"];

  constructor(p:p5){
    super(p);
    this.mode=document.createElement("select");
    this.mode.classList.add("button-ui","select-ui");
    this.setOptions(this.mode,this.mode_options);
    this.rule=document.createElement("select");
    this.rule.classList.add("button-ui","select-ui");
    this.setOptions(this.rule,this.rule_options);
    this.start=document.createElement("button");
    this.start.textContent="Start";
    this.start.classList.add("button-ui");
    this.wrapper=document.createElement("div");
    this.wrapper.classList.add("dom-ui");
    this.wrapper.appendChild(this.mode);
    this.wrapper.appendChild(this.rule);
    this.wrapper.appendChild(this.start);
    document.body.appendChild(this.wrapper);
    this.start.addEventListener('click',()=>{
      this.wrapper.style.display="none";
      states.get("game")!.init();
      (states.get("game")!as Main).setState(this.mode.options[this.mode.selectedIndex].innerHTML,this.rule.options[this.rule.selectedIndex].innerHTML);
      state.set(states.get("game")!);
    });
    this.init();
  }

  init(){
    this.wrapper.style.display="flex";
  }

  private setOptions(s:HTMLSelectElement,o:Array<string>){
    o.forEach(op=>{
      const opt=document.createElement("option");
      opt.text=opt.value=op;
      s.appendChild(opt);
    })
  }

  display(): void {
    this.p.background(230);
    this.p.fill(30);
    this.p.textAlign("center");
    this.p.textSize(50);
    this.p.text("Air Hockey",this.p.width*0.5,50);
  }

  update(): void {
  }
}

export class Main extends State{
  mode: string="";
  rule: string="";
  type:"point"|"time"="point";
  ball:Ball|null=null;
  start_timer:number=3;
  timer:number=0;
  end_point:number=0;
  bars:Array<Bar>=[];

  constructor(p:p5){
    super(p);
    this.init();
  }

  init(){
    this.ball=new Ball(this.p);
    this.start_timer=3;
    this.bars=[];
  }

  setState(mode:string,rule:string){
    this.mode=mode;
    this.rule=rule;
    if(rule.endsWith("pt")){
      this.type="point";
      this.end_point=Number(rule.replace("pt",""));
    }
    if(rule.endsWith("s")){
      this.type="time";
      this.timer=Number(rule.replace("s",""));
    }
    switch(mode){
      case "vs CPU":this.bars.push(new Bar("player",100,this.p.height,this.p),new CPUBar(this.ball!,this.p.width-100,this.p.height,this.p));break;
      case "1 vs 1 Casual":this.bars.push(new Bar("player1",100,this.p.height,this.p),new Bar("player2",this.p.width-100,this.p.height,this.p));break;
      case "1 vs 1 Normal":this.bars.push(new Bar("player1",100,this.p.height*0.4,this.p),new Bar("player2",this.p.width-100,this.p.height*0.4,this.p));break;
    }
  }

  display(): void {
    this.p.background(230);
    this.ball!.display();
    this.bars.forEach(b=>b.display());
    this.p.fill(30);
    this.p.textAlign("center");
    this.p.textSize(50);
    switch(this.type){
      case "time":this.p.text(`${this.timer.toFixed(1)}s`,this.p.width*0.5,50);break;
      case "point":this.p.text(`${this.end_point} point`,this.p.width*0.5,50);break;
    }
    if(this.start_timer>0){
      this.p.text(Math.ceil(this.start_timer),this.p.width*0.5,this.p.height-80);
      const fract=this.p.fract(this.start_timer);
      this.p.noFill();
      this.p.stroke(30);
      this.p.strokeWeight(5);
      this.p.arc(this.p.width*0.5,this.p.height-100,100,100,-this.p.HALF_PI-this.p.TWO_PI*fract,-this.p.HALF_PI);
      this.p.strokeWeight(1);
    }
  }

  update(): void {
    if(this.start_timer>0){
      this.start_timer-=1/this.p.frameRate();
      if(this.start_timer<=0){
        this.ball!.move=true;
      }
    }else{
      switch(this.type){
        case "time":this.timer-=1/this.p.frameRate();if(this.timer<=0){this.timer=0;this.end();}break;
        case "point":this.bars.forEach(b=>{if(b.point>=this.end_point)this.end();});break;
      }
    }
    this.ball?.update();
    this.bars.forEach(b=>b.update());
    this.ball?.collision(this.bars);
  }

  private end(){
    this.ball!.move=false;
    let winner=null;
    let highest_point=0;
    switch(this.type){
      case "time":this.bars.forEach(b=>{if(b.point>highest_point){winner=b.name;highest_point=b.point;}else if(b.point==highest_point){winner=null;}});break;
      case "point":this.bars.forEach(b=>{if(b.point==this.end_point)winner=b.name;});break;
    }
    if(winner==null){
      alert("draw");
    }else{
      alert(`${winner} is the winner.`);
    }
    state.set(states.get("start")!);
    states.get("start")!.init();
  }
}

export class Bar{
  name:string="";
  id:number=-1;
  left:boolean=false;
  position:Vector=new Vector(0,0);
  size:Vector=new Vector(10,200);
  velocity=new Vector(0,0);
  point:number=0;
  dz:DamageZone;
  p:p5;

  constructor(name:string,x:number,dzh:number,p:p5){
    this.name=name;
    this.left=x<p.width*0.5;
    this.position.set(x,p.height*0.5);
    this.dz=new DamageZone(dzh,this.left,p);
    this.p=p;
  }

  update(){
    if(this.id==-1){
      controller.touchList.forEach(t=>{
        if(t.press&&((this.left&&t.touch.x<this.p.width*0.5)||(!this.left&&t.touch.x>=this.p.width*0.5))){
          this.id=t.id;
        }
      })
    }else{
      const touch=controller.getTouchByID(this.id);
      if(touch!=null){
        this.velocity.y=touch.touch.y-this.position.y;
        this.position.y=touch.touch.y;
      }else{
        this.velocity.y=0;
        this.id=-1;
      }
    }
    if(this.left){
      if(controller.pressedKeyCode.includes(87))this.position.y-=12;
      if(controller.pressedKeyCode.includes(83))this.position.y+=12;
    }else{
      if(controller.pressedKeyCode.includes(38))this.position.y-=12;
      if(controller.pressedKeyCode.includes(40))this.position.y+=12;
    }
    this.position.y=this.p.constrain(this.position.y,this.size.y*0.5,this.p.height-this.size.y*0.5);
  }

  display(){
    this.dz.display();
    this.p.noStroke();
    this.p.fill(30);
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y);
    if(this.left){
      this.p.textAlign("left");
    }else{
      this.p.textAlign("right");
    }
    this.p.textSize(20);
    this.p.text(`${this.name}:${this.point}pt`,this.position.x,20);
  }
}

class DamageZone{
  position:Vector;
  size:Vector;
  p:p5;

  constructor(h:number,left:boolean,p:p5){
    this.position=new Vector(left?0:p.width,p.height*0.5);
    this.size=new Vector(5,h);
    this.p=p;
  }

  update(){}

  display(){
    this.p.noStroke();
    this.p.fill(255,30,30);
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y);
  }
}

export class Ball{
  position:Vector=new Vector(0,0);
  velocity:Vector=new Vector(0,0);
  move:boolean=false;
  radius:number=20;
  p:p5;

  constructor(p:p5){
    this.p=p;
    this.position.set(p.width*0.5,p.height*0.5);
    this.velocity.set((Math.random()+7),0).rotate(Math.random()<0.5?p.random(-p.QUARTER_PI,p.QUARTER_PI):p.random(p.PI-p.QUARTER_PI,p.PI+p.QUARTER_PI));
  }

  update(){
    if(this.move){
      this.position.add(this.velocity);
    }
  }

  display(){
    this.p.push();
    this.p.translate(this.position.x,this.position.y);
    this.p.noStroke();
    this.p.fill(30);
    this.p.circle(0,0,this.radius*2);
    if(!this.move){
      this.p.fill(230,30,30);
      const mag=this.radius+5;
      const angle=-this.velocity.angleBetween(new Vector(1,0));
      this.p.triangle(Math.cos(angle-0.2)*mag,Math.sin(angle-0.2)*mag,Math.cos(angle+0.2)*mag,Math.sin(angle+0.2)*mag,Math.cos(angle)*mag*1.2,Math.sin(angle)*mag*1.2);
    }
    this.p.pop();
  }

  collision(bars:Bar[]){
    if(!this.move)return;
    if(this.position.y-this.radius<=0||this.position.y+this.radius>=this.p.height){
      if(this.velocity.y>0){
        this.position.y=this.p.height-this.radius;
      }else if(this.velocity.y<0){
        this.position.y=this.radius;
      }
      this.velocity.y=-this.velocity.y;
      this.velocity.x+=(Math.random()-0.5)*3;
    }
    if(this.position.x-this.radius<=0||this.position.x+this.radius>=this.p.width){
      if(this.velocity.x>0){
        this.position.x=this.p.width-this.radius;
      }else if(this.velocity.x<0){
        this.position.x=this.radius;
      }
      this.velocity.x=-this.velocity.x;
    }
    bars.forEach(b=>{
      const pos=this.position.copy().sub(b.position);
      const hit=this.roundRectDistFunc(pos,b.size.x*0.5,b.size.y*0.5,this.radius);
      if(hit){
        this.velocity.x=-this.velocity.x;
        this.velocity.y+=this.p.constrain(b.velocity.y*0.35,-Math.abs(this.velocity.x),Math.abs(this.velocity.x));
        this.velocity.y+=(Math.random()-0.5)*3;
        const m=this.velocity.mag();
        this.velocity.setMag(m*1.15);
      }
      const dpos=this.position.copy().sub(b.dz.position);
      const dhit=this.roundRectDistFunc(dpos,b.dz.size.x*0.5,b.dz.size.y*0.5,this.radius);
      if(dhit){
        const left=this.position.x<this.p.width*0.5;
        bars.forEach(b=>{
          if(b.left!=left)b.point++;
        });
        const m=this.velocity.mag();
        this.velocity.setMag(Math.max(7,m*0.75));
      }
    });
    this.velocity.limit(this.radius*1.9);
    this.velocity.x=Math.sign(this.velocity.x)*Math.max(3,Math.abs(this.velocity.x));
    this.velocity.limit(this.radius*1.9);
  }

  length(x:number,y:number){
    return Math.sqrt(x*x+y*y);
  }

  roundRectDistFunc(p:Vector,x:number,y:number,radius:number){
    const dx=Math.abs(p.x)-x;
    const dy=Math.abs(p.y)-y;
    return Math.min(Math.max(dx, dy), 0.0) + this.length(Math.max(dx,0.0),Math.max(dy,0.0))- radius<=0;
  }
}

export class CPUBar extends Bar{
  ball:Ball;
  cooltime:number=0;
  target:number=0;
  lim:number=12;

  constructor(b:Ball,x:number,dzh:number,p:p5){
    super("CPU",x,dzh,p);
    this.ball=b;
    this.target=this.position.y;
  }

  update(){
    this.cooltime-=1/this.p.frameRate();
    if((this.left&&this.ball.velocity.x<0)||(!this.left&&this.ball.velocity.x>0)){
      if(this.cooltime<=0){
        if((this.left&&this.ball.position.x<this.position.x)||(!this.left&&this.ball.position.x>this.position.x)){

        }else{
          this.target=this.ball.position.y+(Math.random()-0.5)*this.ball.velocity.mag();
          this.cooltime=0.5-Math.abs(this.ball.velocity.x)*0.1;
        }
      }
    }
    this.position.y+=(this.target-this.position.y)*0.065;
    this.position.y=this.p.constrain(this.position.y,this.size.y*0.5,this.p.height-this.size.y*0.5);
  }
}