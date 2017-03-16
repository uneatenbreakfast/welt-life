import { Brain } from './Brain';
import { ActionTypes, NeuralActions } from './NeuralActions';
import { Creature } from '../Character/Creature';
import { NeuronMemory } from "./NeuronMemory";
export class NeuralReader{
    public static CarryOutAction(cre:Creature, chosenOption:NeuronMemory, inputs:Array<any>, brain:Brain):void{

        var res = "";
        chosenOption.neuralBranch.actions.forEach(action => {
            switch(action.action){
                case ActionTypes.INPUT:
                    res += inputs[0];
                    break;
                case ActionTypes.COMPARED_TO_VAL:
                    res += action.valToCompare;
                    break;
                case ActionTypes.DO_ACTION:
                    try{
                        var r = eval(res);
                        if(r){
                            cre.move(action.valToCompare);
                        }
                    }catch(e){
                        console.log("Invalid Eval", res, e);
                    }
                    
                    break;
                case ActionTypes.LESS_THAN:
                    res += "<";
                    break;
                case ActionTypes.GREATER_THAN:
                    res += ">";
                    break;
                case ActionTypes.EQUAL_TO:
                    res += "==";
                    break;
            }
        });


        chosenOption.numberOfTimesUsed++;
        brain.remember(chosenOption);
    }
}