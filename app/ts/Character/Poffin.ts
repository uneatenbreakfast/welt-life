import { IWorldObject, WorldTypes } from './Display/IWorldObject';
import { Settings } from '../Settings';
import { LoadedDisplaySprite } from './Display/DisplayCharacter';
export class Poffin extends LoadedDisplaySprite implements IWorldObject {
  public type: number;
  public id: number;

  private hp:number;

  constructor(){
    super("Poffin");

    this.markAsDeleted = false;
    this.type = WorldTypes.FOOD;
    this.id = Math.floor(Math.random() * 99999999999999);

  }

  public eaten():void{
    this.markAsDeleted = true;
  }

}
