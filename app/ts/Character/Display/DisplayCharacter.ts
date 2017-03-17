import { SpriteStorage } from '../../Render/SpriteStorage';
import { Renderer } from '../../Render/Renderer';

export class LoadedDisplaySprite{
  private _x:number;
  private _y:number;
  private _z:number;

  private _wrender:Renderer;
  private _sprite:PIXI.Sprite;
  private _characterSprite:dragonBones.PixiArmatureDisplay;

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
    this._characterSprite = armatureDisplay;
    
    this._sprite = new PIXI.Sprite();
    this._sprite.addChild(this._characterSprite);

    this.scaleX(1);
    this.Animate("stand");
  }

  public GetSprite ():PIXI.Sprite{
      return this._sprite;
  }

  public scaleX(num:number):void{
    this._characterSprite.scale.x = this.scaleSize * num;
    this._characterSprite.scale.y = this.scaleSize;
  }

  public resize(num:number):void{
    this.scaleSize = num;
    this.scaleX(1);
  }

 public Animate(animationName:string):void{
    if(this.currentAnimation != animationName){
      this.currentAnimation = animationName;
      this._characterSprite.animation.play(animationName);
    }
  }
  //
  get x():number {
     return this._x;
  }
  set x(xx:number) {
     this._x = xx;
    this._sprite.x = this._x;
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
