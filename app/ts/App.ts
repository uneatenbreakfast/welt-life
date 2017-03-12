import { Settings } from './Settings';
import { WorldController } from './World/WorldController';
import { AssetLoader } from './AssetLoader';
import { Renderer } from './Render/Renderer';

class RPG {

  private rendererController:Renderer;
  private worldController:WorldController;
  
  /*
  -------------------------------------------
  ----------  TO DO LIST --------------------
  -------------------------------------------
  - Get different facial expressions shown
  - Tiling system
  - Camera system

  -------------------------------------------
  ----------  Notes -------------------------
  -------------------------------------------
  - 32 bit / 360 dpi
  */

  constructor() {
    console.log("%c========== Game Start ==========","background: #222; color: #bada55;");
    var loader:AssetLoader = new AssetLoader(this.loadEngine);
    loader.load();
  }

  private loadEngine ():void{
    // Note: 'this' here is in the context of AssetLoader still
    Settings.initialize();
    this.rendererController = Renderer.getInstance();
    this.worldController    = WorldController.getInstance();

    this.worldController.spawn();
    this.rendererController.AddAnySprite(this.worldController.getDisplaySprite());
  }
}

// Game Start ----------
new RPG();
//----------------------
