import { Renderer } from './Render/Renderer';
import { SpriteStorage } from './Render/SpriteStorage';

declare var FontFaceObserver:any;

export class AssetLoader {
  private numberLoaded:number;
  private numberToLoad:number;
  private _func:any;

  constructor(func:any) {
    this.numberLoaded = 0;
    this.numberToLoad = 0;
    this._func = func;
  }

  public load():void{
    this.loadFonts();
    this.loadCharacters();
  }

  //-----------------------

  private loadComplete():void{
    this.numberLoaded++;
    if(this.numberLoaded == this.numberToLoad){
      // Loading complete
      this._func();
    }
  }
  //-----------------------

  public addRenderedTexture():void{

    var wrend = Renderer.getInstance();
    var spriteStorage:SpriteStorage = new SpriteStorage();

    var redstripstex = PIXI.Texture.fromImage('images/redimage.png');
    var sprite1 = new PIXI.Sprite(redstripstex);

    var rt = PIXI.RenderTexture.create(305,20);
    wrend.getRender().render(sprite1, rt);

    spriteStorage.addRawTexture("reddot", rt);
  }

   private loadFonts():void{
    var font = new FontFaceObserver('Roboto Condensed', {
    });

    font.load().then(function () {
      console.log('Font is available');
    }, function () {
      console.log('Font is not available');
    });
  }


  private loadCharacters():void{
    var vm = this;
    var spriteStorage:SpriteStorage = new SpriteStorage();
    var dragonFactory:dragonBones.PixiFactory = spriteStorage.getPixiFactory();
    this.numberToLoad++;

    PIXI.loader
       .add("hero_data",          "images/creatures/creatures_ske.json")
       .add("hero_texture_data",  "images/creatures/creatures_tex.json")
       .add("hero_texture",       "images/creatures/creatures_tex.png");

    PIXI.loader.once("complete", function (loader, object) {
      var dragonData = dragonFactory.parseDragonBonesData(object["hero_data"].data);
      dragonFactory.parseTextureAtlasData(object["hero_texture_data"].data, object["hero_texture"].texture);

      if (dragonData) {
        spriteStorage.addSprite("hero_data", dragonData);
        vm.loadComplete();
      }
    },  this);
    PIXI.loader.load();
  }
}
