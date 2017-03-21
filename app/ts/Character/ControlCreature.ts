import { Brain } from '../NeuralComponents/Brain';
import { OutputAction } from '../Models/Constants';
import { NeuralBranch } from '../NeuralComponents/NeuralBranch';
import { NeuronMemory } from '../NeuralComponents/NeuronMemory';
import { NeuralReader } from '../NeuralComponents/NeuralReader';
import { Creature } from './Creature';
export class ControlCreature extends Creature{
   constructor(armature:string){
        super(armature);

    }

    protected think():void {
        // Pick option
        var chosenOption = new NeuronMemory([0]);

        var availableActions = [OutputAction.LEFT, OutputAction.RIGHT, OutputAction.UP, OutputAction.DOWN,OutputAction.STAND];
        
        chosenOption.neuralBranch = new NeuralBranch();
        chosenOption.neuralBranch.controlGenerate(availableActions);

        NeuralReader.CarryOutAction(this, chosenOption, [0], this.brain);

  }

  public reproduce():void{
    this.hp += 1000;
    this.world.reproduceControl(this.brain, this);
  }
}