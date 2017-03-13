import { Func } from '../World/Func';
import { NeuralBranch } from './NeuralBranch';
import { NeuronRating } from './NeuronRating';
export class Brain{
    private memory:Array<NeuronRating>;
    private greyMatter:Array<NeuralBranch>;

    constructor(){
        this.memory = new Array<NeuronRating>();
        this.greyMatter = new Array<NeuralBranch>();
    }

    public getBranchesBasedOnInput(inputs:Array<any>):Array<NeuronRating>{
        var res = new Array<NeuronRating>();

        var usedNeurons = [];
        this.memory.forEach(neuron => {
            if(neuron.hasInputs(inputs)){
                res.push(neuron);

                usedNeurons[neuron.neuralBranch.id] = true;
            }
        });

        res = res.concat(this.getSomeUnknownOptions(inputs, usedNeurons));
        res = res.sort((n1,n2) => n1.value - n2.value);
        return res;
    }

    private getSomeUnknownOptions(inputs:Array<any>, usedNeurons:Array<boolean>):Array<NeuronRating>{
        var maxOptions = 10;
        var res = new Array<NeuronRating>();
        for(var i=0; i< maxOptions; i++){
            var neuralOption = Func.Sample(this.greyMatter);

            if(usedNeurons[neuralOption.id]==true){
                continue;
            }
            usedNeurons[neuralOption.id] = true;

            var n = new NeuronRating();
            n.inputs = inputs;
            n.neuralBranch = neuralOption;
            n.value = 0;

            res.push(n);
        }

        return res;        
    }

    public remember(neu:NeuronRating):void{
        this.memory.push(neu);
    }

    public AddOptions(grey:Array<NeuralBranch>):void{
        this.greyMatter = this.greyMatter.concat(grey);
    }

    public getOptions():Array<NeuralBranch>{
        return this.greyMatter;
    }
}