import { Func } from '../World/Func';
import { NeuralBranch } from './NeuralBranch';
import { NeuronMemory } from "./NeuronMemory";
import { OutputAction } from "../Models/Constants";
export class Brain{
    private memory:Array<NeuronMemory>;
    private greyMatter:Array<NeuralBranch>;
    private usedInputVNeuralBranch:Array<Array<boolean>>;

    constructor(){
        this.memory = new Array<NeuronMemory>();
        this.greyMatter = new Array<NeuralBranch>();
        this.usedInputVNeuralBranch = new Array<Array<boolean>>();

        var availableActions = [OutputAction.LEFT, OutputAction.RIGHT, OutputAction.UP, OutputAction.DOWN,OutputAction.STAND];

        for(var i=0; i < 20; i++){
            var n = new NeuralBranch();
            n.generate(availableActions);
            this.greyMatter.push(n);
        }
    }

    public getBranchesBasedOnInput(inputs:Array<any>):Array<NeuronMemory>{
        var res = new Array<NeuronMemory>();

        var inputsStr = inputs.join("-");

        if(this.usedInputVNeuralBranch[inputsStr] == null){
            //console.log("inputs:", inputsStr);
            this.usedInputVNeuralBranch[inputsStr] = [];
        }
        
        this.memory.forEach(neuron => {
            if(neuron.hasInputs(inputs)){
                res.push(neuron);
                this.usedInputVNeuralBranch[inputsStr][neuron.neuralBranch.id] = true;
            }
        });

        res = res.concat(this.getSomeUnknownOptions(inputs, inputsStr));
        //res = res.sort((n1,n2) => n1.numberOfTimesUsed - n2.numberOfTimesUsed);
        return res;
    }

    private getSomeUnknownOptions(inputs:Array<any>, inputsStr:string):Array<NeuronMemory>{
        var maxOptions = 10;
        var res = new Array<NeuronMemory>();
        
        for(var i=0; i< maxOptions; i++){
            var neuralOption = Func.Sample(this.greyMatter);

            if(this.usedInputVNeuralBranch[inputsStr][neuralOption.id]){
                continue;
            }

            var n = new NeuronMemory(inputs);
            n.neuralBranch = neuralOption;
            n.numberOfTimesUsed = 0;

            res.push(n);
        }

        return res;        
    }

    public remember(neu:NeuronMemory):void{
        if(neu.numberOfTimesUsed == 1){
            // First time used, so add to memory
            this.memory.push(neu); 
        }
    }

    public AddOptions(grey:Array<NeuralBranch>):void{
        this.greyMatter = this.greyMatter.concat(grey);
    }
     public addMemories(mem:Array<NeuronMemory>):void{
        this.memory = this.memory.concat(mem);
    }

    public getOptions():Array<NeuralBranch>{
        return this.greyMatter;
    }

    public getMemories():Array<NeuronMemory>{
        return this.memory;
    }
}