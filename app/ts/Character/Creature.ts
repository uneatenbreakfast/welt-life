import { PositionPoint } from '../Models/PositionPoint';
import { TextFormat } from '../World/TextFormat';
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
import { OutputAction } from "../Models/Constants";
import { WorldObject } from "./Display/WorldObject";

export class Creature extends WorldObject{
  public id: number;
  public type: WorldTypes;
  private statTxt:PIXI.Text;

  // Stats
  public generation:number;
  private hp:number;
  private walkSpeed:number;
  private runSpeed:number;

  // 
  private memoryBank:TargetMemoryObject[];
  private brain:Brain;

  constructor(armature:string){
    super(armature);

    // Creature knows about:
    this.brain = new Brain();
    this.memoryBank = new Array<TargetMemoryObject>();

    // Stats
    this.hp = 1000;
    this.generation = 1;
    this.walkSpeed = 2;
    this.runSpeed = 5;
    this.type = WorldTypes.CREATURE;
    this.id = Math.floor(Math.random() * 99999999999999);

    //
    this.lastPositionPoint = new PositionPoint(-1,-1,-1);
    this.loadStats();
  }

  public init():void{
    // Only run after external variables on this are set
    this.move(OutputAction.STAND);
  }

  private loadStats():void{
    var txtStyle = new TextFormat();

    this.statTxt = new PIXI.Text("", txtStyle);;
    this.statTxt.y = 0;
    this.GetSprite().addChild(this.statTxt);
  }

  private updateStats():void{
    var text = 'Gen:'+ this.generation +'\n';
    text += 'HP:'+ this.hp +'\n';

    this.statTxt.text = text;
  }

  public tick():void{
    this.think();
    this.age();
    this.updateStats();
  }

  private age():void{
    this.hp--;
    if(this.hp < 0){
        this.removeWorldObject();
    }
  }

  public getHp():number{
    return this.hp;
  }

  public reproduce():void{
    this.hp += 1000;
    this.world.reproduce(this.brain, this);
  }

  public addParentMemories(brainToAdd:Brain):void{
    this.brain.addMemories(brainToAdd.getMemories())
  }

  public move(action:OutputAction):void{
     switch(action){
          case OutputAction.LEFT:
              this.x -= this.runSpeed;
              this.scaleX(1);
              break;
          case OutputAction.RIGHT:
              this.x += this.runSpeed;
              this.scaleX(-1);
              break;
          case OutputAction.UP:
              this.y -= this.runSpeed;
              break;
          case OutputAction.DOWN:
              this.y += this.runSpeed;
              break;
          case OutputAction.STAND:
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

      var currentPosition = new PositionPoint(
                                  Math.floor(this.x/Settings.gridSize),
                                  Math.floor(this.y/Settings.gridSize), -1);

      if(currentPosition.x != this.lastPositionPoint.x && currentPosition.y != this.lastPositionPoint.y){
        currentPosition.z = this.world.updateObjectPosition(this, currentPosition, this.lastPositionPoint);
        this.lastPositionPoint = currentPosition;
      }
  }

  private think():void {
    var targetFromMemory = this.findTarget();
    if(targetFromMemory == null){
      return;
    }
    targetFromMemory.recalculate(this)
    //--------
    var distanceToTarget:number = targetFromMemory.newDistance;
    var angleToTarget:number = targetFromMemory.angle;

    var inputs = [angleToTarget, WorldTypes[targetFromMemory.targetObject.type]];

    var optionsForTheseInputs = this.brain.getBranchesBasedOnInput(inputs);
    // Pick option
    var chosenOption = Func.Sample(optionsForTheseInputs);

    NeuralReader.CarryOutAction(this, chosenOption, inputs, this.brain);

    targetFromMemory.expireOldCalculations();
  }

  private findTarget():TargetMemoryObject{
    var objs = this.world.getNearbyWorldObjects(this, this.lastPositionPoint) as IWorldObject[];
   
    var randomSelectedObject = Func.Sample(objs);
    if(randomSelectedObject.id == this.id){
      // Tries to always get something other than itself.. only last option is itself
      objs.forEach(x => {
        if(x.id != this.id){
          randomSelectedObject = x;
          return;
        }
      })
    }
      
    // retrieve item from memoryBank
    var memory:TargetMemoryObject;
    this.memoryBank.forEach(mem => {
      if(mem.targetObject.id == randomSelectedObject.id){
        memory = mem;
        return;
      }
    });

    if(memory == null){
      memory = new TargetMemoryObject(randomSelectedObject);
    }
    return memory;
  }
}
