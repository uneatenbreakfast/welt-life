import { IWorldObject } from '../Character/Display/IWorldObject';
export class Func{
    public static Sample<T> (array:Array<T>):T {
        return array[Math.floor(Math.random()*array.length)];
    }

    public static RemoveItem<T>(array:Array<T>, item:T):void{
        var index = array.indexOf(item, 0);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    public static RemoveWorldObject(array:Array<IWorldObject>, item:IWorldObject):void{
        var index = Func.GetIdIndex(array, item.id);
        if (index > -1) {
            array.splice(index, 1);
        }
    }


    public static GetIdIndex(array:Array<IWorldObject>, item:number):number{
        var res = -1;
        array.forEach((x, i) => {
            if(x.id == item){
                res = i;
                return;
            }
        })
        return res;
    }
}