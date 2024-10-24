import p5, { Vector } from "p5";
import { Bar, State } from "./classes";
import { Bullet, Enemy, NormalEnemy, Params } from "./enemies";
import { Particle } from "./particle";
import stage from "./stage.json";

const classes=new Map(Object.entries({
  NormalEnemy
}));

export class Arcade extends State{
  player!:ArcadeBar;
  core!:Core;
  bullets:Array<Bullet>=[];
  enemies:Array<Enemy>=[];
  particles:Array<Particle>=[];
  timer:number=0;
  data!:Object;
  keys:string[]=[];

  constructor(p:p5){
    super(p);
  }

  init(){
    this.player=new ArcadeBar("player",100,this.p);
    this.core=new Core(new Vector(40,this.p.height*0.5),new Vector(30,80),10,this.p);
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
          this.enemies.push(this.getInstance(classes.get(o.name)!,new Vector(this.p.width+200,this.p.height*Number(o.param.y)/100),o.param,this.p));
        });
        this.keys.splice(this.keys.indexOf(s),1);
      }
    })
    this.player.update();
    this.core.update();
    this.bullets.forEach(b=>b.update());
    this.enemies.forEach(b=>b.update());
    this.particles.forEach(b=>b.update());
  }

  display(){
    this.p.background(230);
    this.particles.forEach(b=>b.display());
    this.enemies.forEach(b=>b.display());
    this.player.display();
    this.core.display();
    this.bullets.forEach(b=>b.display());
  }

  private getInstance(t:new (pos:Vector,param:Params,p:p5)=>Enemy,pos:Vector,param: Params,p:p5){
    return new t(pos,param,p)
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
}