import { NeuralBranch } from './NeuralBranch';
export class NeuronRating{
    public inputs:number[];
    public value:number; // 0 - 1 for a set  of given inputs
    public neuralBranch:NeuralBranch;

    public hasInputs(inputsQuery:Array<any>):boolean{
        var r = true;
        this.inputs.forEach(input => {
            inputsQuery.forEach(query=>{
                if(input != query){
                    r = false;
                    return;
                }
            })
        });
        return r;
    }
}