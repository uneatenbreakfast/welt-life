import { NeuralBranch } from './NeuralBranch';
export class NeuronMemory{
    public inputs:any[];
    public numberOfTimesUsed:number;
    public neuralBranch:NeuralBranch;

    constructor(inputs:any[]){
        this.inputs = [];
        inputs.forEach(input => {
            this.inputs[input] = true;
        });
    }

    public hasInputs(inputsQuery:Array<any>):boolean{
        var r = true;
    
        inputsQuery.forEach(query=>{
            if(this.inputs[query] == null){
                r = false;
                return;
            }
        });
    
        return r;
    }
}