import { Func } from '../World/Func';
import { Brain } from '../NeuralComponents/Brain';
import { NeuralBranch } from '../NeuralComponents/NeuralBranch';
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
  private brain:Brain;

  private _world:WorldController;

  constructor(armature:string){
    super(armature);

    // Creature knows about:
    this._world = WorldController.getInstance();
    this.brain = new Brain();
    this.memoryBank = new Array<TargetMemoryObject>();

    // Stats
    this.hp = 1000;
    this.walkSpeed = 2;
    this.runSpeed = 5;
    this.type = WorldTypes.CREATURE;
    this.id = Math.floor(Math.random() * 99999999999999);
  }

  public tick():void{
    this.think();
    this.age();
  }

  private age():void{
    this.hp--;
    if(this.hp < 0){
        this.markAsDeleted = true;
    }
  }

  public getHp():number{
    return this.hp;
  }

  public reproduce():void{
    this.hp += 1000;
    this._world.reproduce(this.brain, this);
  }

  public addParentMemories(brainToAdd:Brain):void{
    this.brain.addMemories(brainToAdd.getMemories())
  }

  public move(action:string):void{
     switch(action){
          case "left":
              this.x -= this.runSpeed;
              this.scaleX(1);
              break;
          case "right":
              this.x += this.runSpeed;
              this.scaleX(-1);
              break;
          case "up":
              this.y -= this.runSpeed;
              break;
          case "down":
              this.y += this.runSpeed;
              break;
          case "stand":
              break;
          default:
              console.log("Invalid Action:", action);
      }


      if(this.x < 0){
        this.x = Settings.stageWidth;
      }else if(this.x > Settings.stageWidth){
        this.x = 0;
      }
      if(this.y < 0 ){
        this.y = Settings.stageHeight;
      }else if(this.y > Settings.stageHeight){
        this.y = 0;
      }

  }

  private think():void {
    var targetFromMemory = this.findTarget();
    targetFromMemory.recalculate(this)
    //--------
    var distanceToTarget:number = targetFromMemory.newDistance;
    var angleToTarget:number = targetFromMemory.angle;

    var inputs = [angleToTarget, WorldTypes[targetFromMemory.worldObject.type]];

    var optionsForTheseInputs = this.brain.getBranchesBasedOnInput(inputs);
    // Pick option
    var chosenOption = Func.Sample(optionsForTheseInputs);

    NeuralReader.CarryOutAction(this, chosenOption, inputs, this.brain);

    targetFromMemory.expireOldCalculations();
  }

  private findTarget():TargetMemoryObject{
    var firstWorldObject:IWorldObject;
    var objs = this._world.getWorldObjects() as IWorldObject[];
    objs.forEach(element => {
        firstWorldObject = element;
    });

    // retrieve item from memoryBank
    var memory:TargetMemoryObject;
    this.memoryBank.forEach(element => {
      element.id = firstWorldObject.id;
      memory = element;
      return;
    });

    if(memory == null){
      memory = new TargetMemoryObject(firstWorldObject);
    }

    return memory;
  }

}
