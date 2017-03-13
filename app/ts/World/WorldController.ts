import { CreatureStats } from '../Character/CreatureStats';
import { TextFormat } from './TextFormat';
import { Brain } from '../NeuralComponents/Brain';
import { Func } from './Func';
import { Settings } from '../Settings';
import { Poffin } from '../Character/Poffin';
import { Creature } from '../Character/Creature';
import { LoadedDisplaySprite } from '../Character/Display/DisplayCharacter';
export class WorldController{
    
    static _singleton:WorldController;
    private stage:PIXI.Sprite;
    private displayList:LoadedDisplaySprite[];
    private foodList:Poffin[];
    private creatureList:Creature[];

    private spawnTimerMax:number;
    private spawnTimer:number;
    private worldBillBoard:PIXI.Text;
    private bestCreature:Creature;
    private bestStats:CreatureStats;

    constructor(){
        this.stage = new PIXI.Sprite();

        this.displayList = [];
        this.foodList = [];
        this.creatureList = [];

        this.spawnTimer = 5100;
        this.spawnTimerMax = 5100;

        this.addInformation();
        this.bestStats = new CreatureStats();
        this.clickHandlers();
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

    private clickHandlers():void{
        var vm = this;
        document.body.addEventListener('click', function(event:any){
            if(event.path[0].tagName == "CANVAS"){
                // Only clicks that hit the canvas directly will be let through
                vm.displayList.forEach(element => {
                    if((element as any).GetSprite().getBounds().contains(event.x, event.y)){

                        console.log(element);

                        return;
                    }    
                });
                //
            }
        });
        
    }

    private addInformation():void{
        var normStyle = new TextFormat();

        this.worldBillBoard = new PIXI.Text("", normStyle);
        this.worldBillBoard.x = 20;
        this.worldBillBoard.y = 20;
        //this.worldBillBoard.height = 200;

        this.stage.addChild(this.worldBillBoard);
    }
    private updateWorldBillBoard():void{
        var txt = "Best HP: "+ this.bestStats.HP;
        this.worldBillBoard.text = txt;
    }

    public trackCreature(cre:Creature):void{
        if(this.bestCreature == null){
            this.bestCreature = cre;
            
        }

        if(cre.getHp() > this.bestStats.HP){
            this.bestCreature = cre;
            this.bestStats.HP = cre.getHp();
        }
    }

    public spawn():void{
        for(var i=0; i<10; i++){
            this.addCreature();
            this.addFood();
        }
    }

    public reproduce(brain:Brain, parent:Creature):void{
        var child = this.addCreature();
        child.addBrain(brain);
        child.resize(0.3);
        child.x = parent.x + 20;

        this.trackCreature(parent);
    }

    public AddGameChild(char:LoadedDisplaySprite):void{
        this.stage.addChild(char.GetSprite());
        this.displayList.push(char);
    }

    private addCreature():Creature{
        var pika = new Creature("PikaCreature");
        pika.x = Settings.stageWidth * Math.random();
        pika.y = Settings.stageHeight * Math.random();
        this.AddGameChild(pika);
        this.creatureList.push(pika);

        return pika;
    }

    private addFood():void{
        var food = new Poffin();
        food.x = Settings.stageWidth * Math.random();
        food.y = Settings.stageHeight * Math.random();
        this.AddGameChild(food);
        this.foodList.push(food);
    }

    public tickTock():void{
        // Sort Z-Index
        this.stage.children.sort(function(obj1, obj2) {
            return obj1.position.y - obj2.position.y;
        });

        // Run all Objects
        for( let char of this.displayList){
            char.tick();
        }

        // Is food Eaten
        for( let food of this.foodList){
            if(food.markAsDeleted){
                continue;
            }
            this.creatureList.forEach(cre=>{
                if(Math.abs(cre.x - food.x) < 20){
                    if(Math.abs(cre.y - food.y) < 20){
                        cre.reproduce();
                        food.eaten();
                    }
                }
            });
        }

        // Clear deleted objects
         for( let disobj of this.displayList){
            if(disobj.markAsDeleted){
                this.stage.removeChild(disobj.GetSprite());

                Func.RemoveItem(this.displayList, disobj);
                Func.RemoveItem(this.creatureList, disobj);
                Func.RemoveItem(this.foodList, disobj);
            }
        }



        // Run world clock
        this.spawnTimer--;
        if(this.spawnTimer <= 0){
            this.spawnTimer = this.spawnTimerMax;
            this.spawn();
        }

        // worldBillBoard
        this.updateWorldBillBoard();
    }

    public getWorldObjects():any[]{
        return this.displayList;
    }
}