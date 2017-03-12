import { ActionTypes, NeuralActions } from './NeuralActions';
export class NeuralBranch{
    public id:number;
    
    private actions:NeuralActions[];
    constructor(){
        this.id = Math.random() * 9999999999999999999999999999;

        this.actions = new Array<NeuralActions>();
    }
    generate(availableActions){
        var vals = [36,72,108,144,180,216,252,288,324,360];

        this.actions.push(new NeuralActions(ActionTypes.INPUT));
        this.actions.push(new NeuralActions(NeuralActions.getComparator()));
        this.actions.push(new NeuralActions(ActionTypes.COMPARED_TO_VAL, vals[Math.random() * vals.length]));
        this.actions.push(new NeuralActions(ActionTypes.DO_ACTION, availableActions[Math.random() * availableActions.length]));
    }
}