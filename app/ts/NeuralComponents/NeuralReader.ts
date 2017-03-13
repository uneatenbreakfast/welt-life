import { ActionTypes, NeuralActions } from './NeuralActions';
import { NeuronRating } from './NeuronRating';
import { Creature } from '../Character/Creature';
export class NeuralReader{
    public static CarryOutAction(cre:Creature, chosenOption:NeuronRating, inputs:Array<any>):void{

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
    }
}