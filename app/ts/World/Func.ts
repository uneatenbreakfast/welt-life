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
}