import { NeuralBranch } from './NeuralBranch';
export class NeuronRating{
    public inputs:number[];
    public value:number; // 0 - 1 for a set  of given inputs
    public neuralBranch:NeuralBranch;
}