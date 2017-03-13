import { Func } from '../World/Func';
import { ActionTypes, NeuralActions } from './NeuralActions';
export class NeuralBranch{
    public id:number;

    public actions:NeuralActions[];
    constructor(){
        this.id = Math.floor(Math.random() * 99999999999999);

        this.actions = new Array<NeuralActions>();
    }
    generate(availableActions){
        var vals = [36,72,108,144,180,216,252,288,324,360];

        this.actions.push(new NeuralActions(ActionTypes.INPUT));
        this.actions.push(new NeuralActions(NeuralActions.getComparator()));
        this.actions.push(new NeuralActions(ActionTypes.COMPARED_TO_VAL, Func.Sample(vals)));
        this.actions.push(new NeuralActions(ActionTypes.DO_ACTION, Func.Sample(availableActions)));
    }
}