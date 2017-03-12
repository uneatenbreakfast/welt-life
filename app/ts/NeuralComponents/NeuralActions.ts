export class NeuralActions{
    public action:ActionTypes;
    public valToCompare:any;
    constructor(act:ActionTypes, val?:any){
        this.action = act;
        this.valToCompare = val;
    }

    static getComparator():ActionTypes{
        var conjuctions = [ActionTypes.LESS_THAN, ActionTypes.GREATER_THAN, ActionTypes.EQUAL_TO]
        return conjuctions[Math.random() * conjuctions.length];
    }
}


export enum ActionTypes{
    INPUT,
    COMPARED_TO_VAL,
    DO_ACTION,

    // Comparators
    LESS_THAN,
    GREATER_THAN,
    EQUAL_TO,

    //Conjuction
    AND,
    OR
}