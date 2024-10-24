import p5, { Vector } from "p5";
import { controller, setLoop, state, states } from "./sketch";
import { DamageParticle, Particle } from "./particle";

let cpu_level="Level 1";
let left_cpu_level="Level 1";
let right_cpu_level="Level 1";

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
  level!: HTMLSelectElement;
  rule!:HTMLSelectElement;
  start!:HTMLButtonElement;
  wrapper!:HTMLDivElement;
  level_box!:HTMLDivElement;
  double_level_box!:HTMLDivElement;
  pause!:HTMLButtonElement;
  mode_options:Array<string>=["vs CPU Casual","vs CPU Normal","1 vs 1 Casual","1 vs 1 Normal","Arcade","CPU vs CPU"];
  level_options:Array<string>=["Level 1","Level 2"];
  rule_options:Array<string>=["30s","60s","5pt","10pt"];

  constructor(p:p5){
    super(p);
    this.mode=document.getElementById("mode")!as HTMLSelectElement;
    this.setOptions(this.mode,this.mode_options);
    this.level=document.getElementById("cpu-level")!as HTMLSelectElement;
    this.setOptions(this.level,this.level_options);
    const left_level=document.getElementById("left-cpu-level")!as HTMLSelectElement;
    this.setOptions(left_level,this.level_options);
    const right_level=document.getElementById("right-cpu-level")!as HTMLSelectElement;
    this.setOptions(right_level,this.level_options);
    this.rule=document.getElementById("rule")!as HTMLSelectElement;
    this.setOptions(this.rule,this.rule_options);
    this.start=document.getElementById("start-button")!as HTMLButtonElement;
    this.pause=document.getElementById("pause")!as HTMLButtonElement;
    this.wrapper=document.getElementById("wrapper")!as HTMLDivElement;
    this.level_box=document.getElementById("level-box")!as HTMLDivElement;
    this.double_level_box=document.getElementById("double-level-box")!as HTMLDivElement;
    this.start.addEventListener('click',()=>{
      this.wrapper.style.display="none";
      cpu_level=this.getString(this.level);
      left_cpu_level=this.getString(left_level);
      right_cpu_level=this.getString(right_level);
      if(this.getString(this.mode)=="Arcade"){
        states.get("arcade")!.init();
        state.set(states.get("arcade")!);
      }else{
        states.get("game")!.init();
        (states.get("game")!as Main).setState(this.getString(this.mode),this.getString(this.rule));
        state.set(states.get("game")!);
      }
    });
    this.pause.addEventListener('click',()=>{
      const bg=document.getElementById("pause-bg")!;
      if(bg.style.display=="none"){
        setLoop(false);
        bg.style.display="block";
      }else{
        setLoop(true);
        bg.style.display="none";
      }
    });
    document.getElementById("back")!.addEventListener('click',()=>{
      state.set(states.get("start")!);
      states.get("start")!.init();
      const bg=document.getElementById("pause-bg")!;
      bg.style.display="none";
      setLoop(true);
    })
    this.mode.addEventListener('change',()=>{
      this.initVisibility();
    });
    this.init();
  }

  init(){
    this.wrapper.style.display="flex";
    this.initVisibility();
  }

  private initVisibility(){
    const selected=this.getString(this.mode);
    this.level_box.style.display=selected.includes("vs CPU ")?"flex":"none";
    this.double_level_box.style.display=selected.includes("CPU vs CPU")?"flex":"none";
    this.rule.style.display=selected.includes("Arcade")?"none":"inline-block";
    document.getElementById("pause-bg")!.style.display="none";
  }

  private getString(s:HTMLSelectElement){
    return s.options[s.selectedIndex].innerHTML;
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
  particles:Array<Particle>=[];

  constructor(p:p5){
    super(p);
    this.init();
  }

  init(){
    this.ball=new Ball(this,this.p);
    this.start_timer=3;
    this.bars=[];
    this.particles=[];
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
      case "vs CPU Casual":this.bars.push(new Bar("player",100,this.p.height,this.p),new CPUBar(this.ball!,this.p.width-100,this.p.height,this.p));break;
      case "vs CPU Normal":this.bars.push(new Bar("player",100,this.p.height*0.4,this.p),new CPUBar(this.ball!,this.p.width-100,this.p.height*0.4,this.p));break;
      case "1 vs 1 Casual":this.bars.push(new Bar("player1",100,this.p.height,this.p),new Bar("player2",this.p.width-100,this.p.height,this.p));break;
      case "1 vs 1 Normal":this.bars.push(new Bar("player1",100,this.p.height*0.4,this.p),new Bar("player2",this.p.width-100,this.p.height*0.4,this.p));break;
      case "CPU vs CPU":this.bars.push(new CPUBar(this.ball!,100,this.p.height,this.p,left_cpu_level),new CPUBar(this.ball!,this.p.width-100,this.p.height,this.p,right_cpu_level));break;
    }
  }

  display(): void {
    this.p.background(230);
    this.particles.forEach(p=>{
      p.display();
    })
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
    this.particles.forEach(p=>{
      p.update();
      if(p.isDead)this.particles.splice(this.particles.indexOf(p),1);
    })
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
        const temp=this.position.y;
        this.position.y=touch.touch.y;
        this.position.y=this.p.constrain(this.position.y,this.size.y*0.5,this.p.height-this.size.y*0.5);
        this.velocity.y=this.position.y-temp;
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
  parent:Main;
  p:p5;

  constructor(parent:Main,p:p5){
    this.p=p;
    this.parent=parent;
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
      const hit=this.roundRectReaction(pos,b.size.x*0.5,b.size.y*0.5,this.radius);
      if(hit.hit){
        this.velocity.reflect(hit.normal);
        this.velocity.y*=0.9;
        this.velocity.y+=b.velocity.y*0.35;
        this.velocity.y+=(Math.random()-0.5)*3;
        this.velocity.x*=1.15;
      }
      const dpos=this.position.copy().sub(b.dz.position);
      const dhit=this.roundRectReaction(dpos,b.dz.size.x*0.5,b.dz.size.y*0.5,this.radius);
      if(dhit.hit){
        this.parent.particles.push(new DamageParticle(new Vector(b.left?0:this.p.width,this.position.y),new Vector(5,5),new Vector(0,0),this.p));
        const left=this.position.x<this.p.width*0.5;
        bars.forEach(b=>{
          if(b.left!=left)b.point++;
        });
        const m=this.velocity.mag();
        this.velocity.setMag(Math.max(7,m*0.75));
      }
    });
    this.velocity.x=Math.max(Math.abs(this.velocity.y)*0.75,Math.abs(this.velocity.x))*Math.sign(this.velocity.x);
    this.velocity.limit(this.radius*2.1);
  }

  length(x:number,y:number){
    return Math.sqrt(x*x+y*y);
  }

  roundRectDist(p:Vector,x:number,y:number,radius:number) {
    const dx=Math.abs(p.x)-x;
    const dy=Math.abs(p.y)-y;
    return Math.min(Math.max(dx, dy), 0.0) + this.length(Math.max(dx,0.0),Math.max(dy,0.0))- radius;
  }

  roundRectReaction(p:Vector,x:number,y:number,radius:number){
    let delta=1e-5;
    let d=this.roundRectDist(p,x,y,radius);
    if(d<=0){
      const dx=this.roundRectDist(p.copy().add(delta,0),x,y,radius)-this.roundRectDist(p.copy().add(-delta,0),x,y,radius);
      const dy=this.roundRectDist(p.copy().add(0,delta),x,y,radius)-this.roundRectDist(p.copy().add(0,-delta),x,y,radius);
      const n=new Vector(dx,dy).normalize();
      return {hit:true,normal:n.mult(-d)};
    }else{
      return {hit:false,normal:new Vector(0,0)};
    }
  }
}

export class CPUBar extends Bar{
  ball:Ball;
  cooltime:number=0;
  target:number=0;
  lim:number=0.065;
  smash:boolean=false;
  dir:number=1;
  level:number=1;

  constructor(b:Ball,x:number,dzh:number,p:p5,level?:string){
    super("CPU",x,dzh,p);
    this.ball=b;
    this.target=this.position.y;
    if(level){
      this.level=Number(level.replace("Level ",""));
    }else{
      this.level=Number(cpu_level.replace("Level ",""));
    }
  }

  update(){
    this.cooltime-=1/this.p.frameRate();
    if((this.left&&this.ball.velocity.x<0)||(!this.left&&this.ball.velocity.x>0)){
      if(this.cooltime<=0){
        if((this.left&&this.ball.position.x<this.position.x)||(!this.left&&this.ball.position.x>this.position.x)){
          this.target+=-this.ball.velocity.y*this.dir;
        }else{
          this.cooltime=0.5-Math.abs(this.ball.velocity.x)*0.1;
          if(this.level>1){
            this.target=this.ball.position.y+(Math.random()-0.5)*this.ball.velocity.mag()+Math.sign(this.ball.velocity.y)*this.size.y*(this.smash?1.2:0);
            const dist=Math.abs(this.position.x-this.ball.position.x)-Math.random()*10-5;
            const vx=Math.abs(this.ball.velocity.x);
            if(!this.smash&&dist<vx*vx*0.5){
              this.smash=true;
            }
          }else{
            this.target=this.ball.position.y+(Math.random()-0.5)*this.ball.velocity.mag();
          }
        }
      }
    }else{
      this.smash=false;
      this.lim=0.065;
      this.dir=Math.sign(Math.random()-0.5);
    }
    const tempy=this.position.y;
    this.position.y+=(this.target-this.position.y)*this.lim;
    this.position.y=this.p.constrain(this.position.y,this.size.y*0.5,this.p.height-this.size.y*0.5);
    this.target=this.p.constrain(this.target,this.size.y*0.5,this.p.height-this.size.y*0.5);
    this.velocity.y=(this.position.y-tempy)*0.5;
  }
}