import { Poffin } from '../Character/Poffin';
import { Creature } from '../Character/Creature';
import { LoadedDisplaySprite } from '../Character/Display/DisplayCharacter';
export class WorldController{
    
    static _singleton:WorldController;
    private stage:PIXI.Sprite;
    private displayList:any[];

    constructor(){
        this.stage = new PIXI.Sprite();

        this.displayList = [];
    }
    public static getInstance():WorldController{
        if(this._singleton == null){
        this._singleton = new WorldController();
        }
        return this._singleton;
    }

    public getDisplaySprite():PIXI.Sprite{
        return this.stage;
    }

    public spawn():void{
        var pika = new Creature("PikaCreature");
        pika.x = 250;
        pika.y = 150;
        this.AddGameChild(pika);

        var food = new Poffin();
        food.x =  200;
        food.y = 200;

        this.AddGameChild(food);
    }

    public AddGameChild(char:LoadedDisplaySprite):void{
        this.stage.addChild(char.GetSprite());
        this.displayList.push(char);
    }

    public tickTock():void{
      this.stage.children.sort(function(obj1, obj2) {
        return obj1.position.y - obj2.position.y;
      });

      for( let char of this.displayList){
          char.tick();
      }
    }

    public getWorldObjects():any[]{
        return this.displayList;
    }
}