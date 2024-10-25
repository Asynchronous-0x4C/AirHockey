import p5, { Vector } from "p5";
import { Bar, State } from "./classes";
import { Bullet, Enemy, EnemyDeadParticle, NormalEnemy, Params, RoundEnemy } from "./enemies";
import { Particle } from "./particle";
import stage from "./stage.json";
import { state, states } from "./sketch";

const classes=new Map(Object.entries({
  NormalEnemy,RoundEnemy
}));

export class Arcade extends State{
  player!:ArcadeBar;
  core!:Core;
  bullets:Array<Bullet>=[];
  enemies:Array<Enemy>=[];
  particles:Array<Particle|EnemyDeadParticle>=[];
  timer:number=0;
  data!:Object;
  keys:string[]=[];

  constructor(p:p5){
    super(p);
  }

  init(){
    this.player=new ArcadeBar("player",100,this.p);
    this.core=new Core(new Vector(0,this.p.height*0.5),new Vector(10,240),10,this.p);
    this.bullets=[];
    this.enemies=[];
    this.particles=[];
    this.timer=0;
    this.data=stage;
    this.keys=Object.keys(this.data);
  }

  update(){
    this.timer+=1/this.p.frameRate();
    this.keys.forEach(s=>{
      if(Number(s)<=this.timer){
        (this.data as typeof stage)[s as keyof typeof stage].forEach(o=>{
          this.enemies.push(this.getInstance(classes.get(o.name)!,new Vector(this.p.width+200,this.p.height*Number(o.param.y)/100),o.param,this.p,this.bullets));
        });
        this.keys.splice(this.keys.indexOf(s),1);
      }
    })
    this.player.update();
    this.core.update();
    this.bullets.forEach(b=>{
      b.update();
      if(b.isDead)this.bullets.splice(this.bullets.indexOf(b),1);
    });
    this.enemies.forEach(e=>{
      e.update();
      if(e.isDead){
        this.particles.push(new EnemyDeadParticle(e,this.p));
        this.enemies.splice(this.enemies.indexOf(e),1);
      }
    });
    this.particles.forEach(p=>{
      p.update();
      if(p.isDead)this.particles.splice(this.particles.indexOf(p),1);
    });
    this.bullets.forEach(b=>b.collision(this.player,this.core));
    if(this.core.isDead){
      alert("Game Over.");
      state.set(states.get("start")!);
      states.get("start")!.init();
    }
  }

  display(){
    this.p.background(230);
    this.particles.forEach(b=>b.display());
    this.enemies.forEach(b=>b.display());
    this.player.display();
    this.core.display();
    this.bullets.forEach(b=>b.display());
    this.p.fill(30);
    this.p.textAlign("center");
    this.p.textSize(50);
    this.p.text(`${this.timer.toFixed(2)}s`,this.p.width*0.5,50);
    this.p.textSize(20);
    this.p.text(`Health: ${this.core.health}`,this.p.width*0.5,80);
  }

  private getInstance(t:new (pos:Vector,param:Params,p:p5,bullets:Array<Bullet>)=>Enemy,pos:Vector,param: Params,p:p5,bullets:Array<Bullet>){
    return new t(pos,param,p,bullets);
  }
}

export class ArcadeBar extends Bar{
  constructor(name:string,x:number,p:p5){
    super(name,x,0,p);
  }

  display(){
    this.dz.display();
    this.p.noStroke();
    this.p.fill(30);
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y);
  }
}

export class Core{
  position:Vector;
  size:Vector;
  health:number;
  isDead=false;
  p:p5;

  constructor(pos:Vector,s:Vector,h:number,p:p5){
    this.position=pos;
    this.size=s;
    this.health=h;
    this.p=p;
  }

  update(){}

  display(){
    this.p.noStroke();
    this.p.fill(50,50,255);
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y);
  }

  hit(_b:Bullet){
    this.health--;
    if(this.health<=0)this.isDead=true;
  }
}