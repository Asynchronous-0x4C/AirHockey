import p5, { Vector } from "p5";
import { Bar } from "./classes";
import { roundRectReaction } from "./sketch";
import { Core } from "./arcade";
import { ColorParticle, Particle } from "./particle";

export type Params={duration?:number,x:string,y:string};
type InternalParams={duration?:number,x:number,y:number};

export abstract class Enemy{
  position:Vector;
  size:Vector;
  params:InternalParams;
  health:number=2;
  isDead=false;
  bullets:Array<Bullet>;
  cooltime:number=1;
  p:p5;

  constructor(pos:Vector,s:Vector,param:Params,p:p5,bullets:Array<Bullet>){
    this.position=pos;
    this.size=s;
    this.params={duration:param.duration,x:p.width-Number(param.x),y:p.height*Number(param.y)/100};
    this.bullets=bullets;
    this.p=p;
  }

  abstract update():void;

  abstract display():void;

  abstract shot():void;

  damage(_b:Bullet){
    this.health--;
    if(this.health<=0)this.isDead=true;
  }
}

export class NormalEnemy extends Enemy{
  constructor(pos:Vector,param:Params,p:p5,bullets:Array<Bullet>){
    super(pos,new Vector(40,40),param,p,bullets);
  }

  update(){
    this.position.x+=(this.params.x-this.position.x)*0.3;
    if(this.cooltime<=0){
      this.shot();
      this.cooltime=1.5;
    }
    this.cooltime-=1/this.p.frameRate();
  }

  display(){
    this.p.noStroke();
    this.p.fill(230,80,80);
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y,5);
  }

  shot(){
    const dir=this.p.PI+(Math.random()-0.5)*this.p.QUARTER_PI;
    const b=new Bullet(this,this.position.copy().add(new Vector(this.size.x*0.5,0).rotate(dir)),new Vector(8,0).rotate(dir),5,this.p);
    this.bullets.push(b);
  }
}

export class RoundEnemy extends NormalEnemy{
  constructor(pos:Vector,param:Params,p:p5,bullets:Array<Bullet>){
    super(pos,param,p,bullets);
    this.health=3;
  }

  update(){
    this.position.x+=(this.params.x-this.position.x)*0.3;
    if(this.cooltime<=0){
      this.shot();
      this.cooltime=2.2;
    }
    this.cooltime-=1/this.p.frameRate();
  }

  display(){
    this.p.noStroke();
    this.p.fill(230,120,80);
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y,5);
  }

  shot(){
    for(let i=0;i<6;i++){
      const dir=this.p.PI*i/3+(Math.random()-0.5)*0.2;
      const b=new Bullet(this,this.position.copy().add(new Vector(this.size.x*0.5,0).rotate(dir)),new Vector(8,0).rotate(dir),5,this.p);
      this.bullets.push(b);
    }
  }
}

export class Bullet{
  parent:Enemy;
  position:Vector=new Vector(0,0);
  velocity:Vector=new Vector(0,0);
  radius:number=20;
  isMine=false;
  isDead=false;
  p:p5;

  constructor(parent:Enemy,pos:Vector,vel:Vector,rad:number,p:p5){
    this.parent=parent;
    this.position=pos;
    this.velocity=vel;
    this.radius=rad;
    this.p=p;
  }

  update(){
    this.position.add(this.velocity);
  }

  display(){
    this.p.noStroke();
    this.p.fill(30,0,0);
    this.p.circle(this.position.x,this.position.y,this.radius*2);
  }

  collision(bar:Bar,core:Core){
    if(this.position.x-this.radius<=0){
      this.velocity.x=-this.velocity.x;
    }else if(this.p.width<=this.position.x+this.radius){
      this.isDead=true;
    }
    if(this.position.y-this.radius<=0||this.p.height<=this.position.y+this.radius){
      this.velocity.y=-this.velocity.y;
    }
    if(this.isMine&&!this.parent.isDead){
      const hit=roundRectReaction(this.parent.position.copy().sub(this.position),this.parent.size.x*0.5,this.parent.size.y*0.5,this.radius);
      if(hit.hit){
        this.isDead=true;
        this.parent.damage(this);
      }
    }else{
      const hit=roundRectReaction(bar.position.copy().sub(this.position),bar.size.x*0.5,bar.size.y*0.5,this.radius);
      if(hit.hit){
        const d=new Vector(1,0).dot(hit.normal);
        if(d<-0.5){
          this.velocity=this.parent.position.copy().sub(this.position).limit(15);
          this.isMine=true;
        }else{
          this.velocity.reflect(hit.normal);
        }
      }
      const chit=roundRectReaction(core.position.copy().sub(this.position),core.size.x*0.5,core.size.y*0.5,this.radius);
      if(chit.hit){
        core.hit(this);
        this.isDead=true;
      }
    }
  }
}

export class EnemyDeadParticle{
  particles:Array<Particle>=[];
  isDead=false;

  constructor(e:Enemy,p:p5){
    const count=e.size.x*e.size.y/100;
    for(let i=0;i<count;i++){
      const pos=e.position.copy().add(p.random(-e.size.x*0.5,e.size.x*0.5),p.random(-e.size.y*0.5,e.size.y*0.5));
      const angle=Math.random()*p.TWO_PI;
      this.particles.push(new ColorParticle(pos,new Vector(p.random(2,4),0).rotate(angle),new Vector(5,5),p));
    }
  }

  update(){
    this.particles.forEach(p=>{
      p.update();
      if(p.isDead)this.particles.splice(this.particles.indexOf(p),1);
    });
    if(this.particles.length==0)this.isDead=true;
  }

  display(){
    this.particles.forEach(p=>p.display());
  }
}