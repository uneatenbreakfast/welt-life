import { Renderer } from './Renderer';
export class SpriteStorage {

  private static _singleton:SpriteStorage;
  
  private _store:dragonBones.DragonBonesData[];
  public _textureStore:PIXI.Sprite[];

  private _renderReadyTextureStore:PIXI.RenderTexture[]
  private _renderReadySpriteStore:PIXI.Sprite[]

  private _pixiFactory:dragonBones.PixiFactory;
  private num:Number;

  constructor() {
    if (!SpriteStorage._singleton) {
          SpriteStorage._singleton = this;
          this.init();
    }
    return SpriteStorage._singleton;
  }

  private init():void{
    this._store = [];
    this._textureStore = [];
    this._renderReadyTextureStore = [];
    this._renderReadySpriteStore = [];
    
    this.num = Math.random();
  }

  public getPixiFactory(): dragonBones.PixiFactory {
    if(this._pixiFactory == null){
      this._pixiFactory = new dragonBones.PixiFactory();
    }
    return this._pixiFactory;
  }

  //-----------------------
  public addSprite(spriteName:string, dragonData:dragonBones.DragonBonesData):void {
    this._store[spriteName] = dragonData;
  }

  public getSpriteData(spriteName:string):dragonBones.DragonBonesData{
    return this._store[spriteName];
  }

  //-----------------------
  public addRawTexture(textName:string, texture:PIXI.RenderTexture):void{
      var sp = new PIXI.Sprite(texture);
      this._textureStore[textName] = sp;
  }




  public getSprite(textureName:string):PIXI.Sprite{
    return this._textureStore[textureName]; //returns clothing sprite
  }



  //-----------------------
}