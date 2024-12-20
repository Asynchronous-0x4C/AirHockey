import p5, { Vector } from "p5";

export class Particle{
  position:Vector;
  vleocity:Vector;
  size:Vector;
  duration=0.25;
  isDead=false;
  p:p5;

  constructor(p:Vector,v:Vector,s:Vector,p5:p5){
    this.position=p;
    this.vleocity=v;
    this.size=s;
    this.p=p5;
  }

  update(){}

  display(){}
}

export class DamageParticle extends Particle{

  update(){
    this.duration-=1/this.p.frameRate();
    this.size.add(this.vleocity.x,this.vleocity.y);
    if(this.duration<=0)this.isDead=true;
  }

  display(): void {
    this.p.noStroke();
    this.p.fill(255,30,30,100*(this.duration/0.25));
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y);
  }
}

export class ColorParticle extends Particle{
  color:Vector=new Vector(0,0,0);

  constructor(p:Vector,v:Vector,s:Vector,p5:p5){
    super(p,v,s,p5);
    this.duration=Math.random()+1;
  }

  setColor(c:Vector){
    this.color=c;
  }

  update(){
    this.duration-=1/this.p.frameRate();
    this.position.add(this.vleocity);
    if(this.duration<=0)this.isDead=true;
  }

  display(): void {
    this.p.noStroke();
    this.p.fill(this.color.x,this.color.y,this.color.z,100*(this.duration/0.25));
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y);
  }
}