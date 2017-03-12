import { NeuralReader } from '../NeuralComponents/NeuralReader';
import { TargetMemoryObject } from './TargetMemoryObject';
import { IWorldObject, WorldTypes } from './Display/IWorldObject';
import { WorldController } from '../World/WorldController';
import { Poffin } from './Poffin';
import { Settings } from '../Settings';
import { LoadedDisplaySprite } from './Display/DisplayCharacter';
export class Creature extends LoadedDisplaySprite implements IWorldObject {
  public id: number;
  public type: WorldTypes;
  

  private hp:number;
  private memoryBank:TargetMemoryObject[];

  private walkSpeed:number;
  private runSpeed:number;

  private _world:WorldController;

  constructor(armature:string){
    super(armature);

    // Creature knows about:
    this._world = WorldController.getInstance();
    this.memoryBank = new Array<TargetMemoryObject>();

    // Stats
    this.walkSpeed = 2;
    this.runSpeed = 5;
    this.type = WorldTypes.CREATURE;
    this.id = Math.random() * 9999999999999;
  }

  public tick():void{
    this.think();
  }

  private think():void {
    var targetFromMemory = this.findTarget();
    targetFromMemory.recalculate(this)
    //--------
    var distanceToTarget:number = targetFromMemory.newDistance;
    var angleToTarget:number = targetFromMemory.angle;

    var inputs = [distanceToTarget, angleToTarget];

    var availableActions = ["left","right","up","down","stand"];

    inputs.forEach(input => {
      availableActions.forEach(action=>{
        NeuralReader.Read();
      })
    });
    //--------
    targetFromMemory.expireOldCalculations();
  }

  private findTarget():TargetMemoryObject{
    var firstFoodItem:IWorldObject;
    var objs = this._world.getWorldObjects() as IWorldObject[];
    objs.forEach(element => {
      if(element.type == WorldTypes.FOOD){
        firstFoodItem = element;
        return;
      }
    });

    // retrieve item from memoryBank
    var memory:TargetMemoryObject;
    this.memoryBank.forEach(element => {
      element.id = firstFoodItem.id;
      memory = element;
      return;
    });
    if(memory == null){
      memory = new TargetMemoryObject(firstFoodItem);
    }
    return memory;
  }

}