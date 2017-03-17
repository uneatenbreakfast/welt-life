import { WorldController } from '../World/WorldController';
import { PositionPoint } from '../Models/PositionPoint';
import { IWorldObject, WorldTypes } from './Display/IWorldObject';
import { Settings } from '../Settings';
import { LoadedDisplaySprite } from './Display/DisplayCharacter';
import { WorldObject } from "./Display/WorldObject";
export class Poffin extends WorldObject{
  public type: number;
  public id: number;

  private hp:number;

  constructor(){
    super("Poffin");


    this.type = WorldTypes.FOOD;
    this.id = Math.floor(Math.random() * 99999999999999);
  }

  public init():void{
    this.lastPositionPoint = new PositionPoint(
                                Math.floor(this.x/Settings.gridSize),
                                Math.floor(this.y/Settings.gridSize), -1);
    this.lastPositionPoint.z = this.world.updateObjectPosition(this, this.lastPositionPoint, new PositionPoint(-1,-1,-1));
  }
}
