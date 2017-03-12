import { WorldController } from '../World/WorldController';
import { Settings } from '../Settings';
import { LoadedDisplaySprite } from '../Character/Display/DisplayCharacter';

declare var FPSMeter:any;

export class Renderer {
  private static _singleton:Renderer;
  private _stage:PIXI.Container;
  private _renderer;
  private worldController:WorldController;
  private fpsmeter:any;

  public static getInstance():Renderer{
    if(this._singleton == null){
      this._singleton = new Renderer();
    }
    return this._singleton;
  }

  public getRender():any{
    return this._renderer;
  }

  constructor() {
    // Variable Initialization
    this._stage = new PIXI.Container();
    this._stage.hitArea = new PIXI.Rectangle(0, 0, Settings.stageWidth, Settings.stageHeight);
    this._renderer = PIXI.autoDetectRenderer(Settings.stageWidth, Settings.stageHeight, {
        backgroundColor: 0x65C25D,
        antialias: true
    });

    // Add FPS Meter
    this.fpsmeter = new FPSMeter();
    
    // Add PIXI container to the HTML page
    document.body.appendChild(this._renderer.view);

    // Set references
    this.worldController = WorldController.getInstance();

    // Game Ticker
    requestAnimationFrame(this.RefreshDisplay);
  }

  public RefreshDisplay = () :void => {
      this.worldController.tickTock();

      this._renderer.render(this._stage); // render the stage
      this.fpsmeter.tick();               // fps ticker

      requestAnimationFrame(this.RefreshDisplay);
  }


  public AddAnySprite(char:any):void{
    this._stage.addChild(char);
  }

}
