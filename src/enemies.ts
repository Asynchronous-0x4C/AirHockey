import p5, { Vector } from "p5";
import { Ball } from "./classes";

export type Params={duration?:number,x:string,y:string};
type InternalParams={duration?:number,x:number,y:number};

export abstract class Enemy{
  position:Vector;
  size:Vector;
  params:InternalParams;
  p:p5;

  constructor(pos:Vector,s:Vector,param:Params,p:p5){
    this.position=pos;
    this.size=s;
    this.params={duration:param.duration,x:p.width-Number(param.x),y:p.height*Number(param.y)/100};
    this.p=p;
  }

  abstract update():void;

  abstract display():void;

  abstract shot():void;
}

export class NormalEnemy extends Enemy{
  constructor(pos:Vector,param:Params,p:p5){
    super(pos,new Vector(40,40),param,p);
  }

  update(){
    this.position.x+=(this.params.x-this.position.x)*0.3;
  }

  display(){
    this.p.noStroke();
    this.p.fill(230,80,80);
    this.p.rectMode("center");
    this.p.rect(this.position.x,this.position.y,this.size.x,this.size.y,5);
  }

  shot(){

  }
}

export class Bullet extends Ball{}