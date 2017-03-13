import { SpriteStorage } from '../../Render/SpriteStorage';
import { Renderer } from '../../Render/Renderer';

export class LoadedDisplaySprite{
  private _x:number;
  private _y:number;
  private _z:number;

  private _wrender:Renderer;
  private _sprite:dragonBones.PixiArmatureDisplay;

  private spriteStorage:SpriteStorage;
  private dragonFactory:dragonBones.PixiFactory;

  private scaleSize:number;
  private currentAnimation:string;
  public markAsDeleted:boolean;


  constructor(armature:string) {
    this.spriteStorage = new SpriteStorage();
    this.dragonFactory = this.spriteStorage.getPixiFactory();
    this.scaleSize = 0.4;
    this.markAsDeleted = false;

    var char = this.spriteStorage.getSpriteData("hero_data");
    if(char != null){
      this.addCharacter(armature);
    }
  }

  private addCharacter(armature:string):void{
    var armatureDisplay:dragonBones.PixiArmatureDisplay = this.dragonFactory.buildArmatureDisplay(armature);
    this._sprite = armatureDisplay;

    this.scaleX(1);
    this.Animate("stand");
  }

  public GetSprite (): dragonBones.PixiArmatureDisplay{
      return this._sprite;
  }

  public scaleX(num:number):void{
    this._sprite.scale.x = this.scaleSize * num;
    this._sprite.scale.y = this.scaleSize;
  }

  public resize(num:number):void{
    this.scaleSize = num;
    this.scaleX(1);
  }

 public Animate(animationName:string):void{
    if(this.currentAnimation != animationName){
      this.currentAnimation = animationName;
      this._sprite.animation.play(animationName);
    }
  }
  //
  get x():number {
     return this._x;
  }
  set x(xx:number) {
     this._x = xx;

     try {
       this._sprite.x = this._x;
    } catch(e) {
      console.log(e.stack);
    }

  }
  //
  get y():number {
     return this._y;
  }
  set y(yy:number) {
     this._y = yy;
     this._sprite.y = this._y;
  }

  //
  get z():number {
     return this._z;
  }
  set z(zz:number) {
     this._z = zz;
  }
  //

  public tick():void{
  }
}
