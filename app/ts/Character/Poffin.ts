import { IWorldObject, WorldTypes } from './Display/IWorldObject';
import { Settings } from '../Settings';
import { LoadedDisplaySprite } from './Display/DisplayCharacter';
export class Poffin extends LoadedDisplaySprite implements IWorldObject {
  public type: number;
  public id: number;

  private hp:number;

  constructor(){
    super("Poffin");

    this.type = WorldTypes.FOOD;
    this.id = Math.random() * 9999999999999;

  }

}
