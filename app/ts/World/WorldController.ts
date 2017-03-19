import { WorldObject } from '../Character/Display/WorldObject';
import { PositionPoint } from '../Models/PositionPoint';
import { IWorldObject } from '../Character/Display/IWorldObject';
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
    private displayList:WorldObject[];
    private quadGridDisplayList:Array<Array<Array<IWorldObject>>>;
    private foodList:Poffin[];
    private creatureList:Creature[];

    private spawnAmount:number = 5;
    private spawnTimerMax:number = 1000;
    private spawnTimer:number = 1000;
    private worldBillBoard:PIXI.Text;
    private bestCreature:Creature;
    private bestStats:CreatureStats;

    private overworldNumObjects:number;

    constructor(){
        this.stage = new PIXI.Sprite();

        this.quadGridDisplayList = new Array<Array<Array<IWorldObject>>>();
        this.displayList = [];
        this.foodList = [];
        this.creatureList = [];

        this.addInformation();
        this.bestStats = new CreatureStats();
        this.clickHandlers();
        this.overworldNumObjects = 0;
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
                var usedClick = false;
                vm.displayList.forEach(element => {
                    if((element as any).GetSprite().getBounds().contains(event.x, event.y)){
                        usedClick = true;
                        return;
                    }    
                });

                if(!usedClick){
                    var food = vm.addFood();
                    food.x = Settings.stageWidth / 2;
                    food.y = Settings.stageHeight / 2;
                }
                //
            }
        });
        
    }

     public tickTock():void{
        // Sort Z-Index
        this.stage.children.sort(function(obj1, obj2) {
            return obj1.position.y - obj2.position.y;
        });

        // Run all Objects
        for( var char of this.displayList){
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
                        if(food.markAsDeleted){
                            return;
                        }
                        cre.reproduce();
                        food.removeWorldObject();
                    }
                }
            });
        }

        var tempDisplayList = this.displayList.slice(0);
        for( var disobj of tempDisplayList){
            if(disobj.markAsDeleted){
                this.stage.removeChild(disobj.GetSprite());

                Func.RemoveWorldObject(this.displayList, disobj);
                Func.RemoveWorldObject(this.creatureList, disobj);
                Func.RemoveWorldObject(this.foodList, disobj);
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
        for(var i=0; i< this.spawnAmount; i++){
            //this.addFood();
            

            this.addCreature();

        }

         var food = this.addFood();
        food.x = Settings.stageWidth / 2;
        food.y = Settings.stageHeight / 2;
        food.init();
    }

    public reproduce(brain:Brain, parent:Creature):void{
        var child = this.addCreature();
        child.addParentMemories(brain);
        child.resize(0.3);
        child.generation = parent.generation + 1;
        child.x = parent.x + 20;

        this.trackCreature(parent);
    }

    public AddGameChild(char:WorldObject):void{
        this.stage.addChild(char.GetSprite());
        this.displayList.push(char);
    }

    private addCreature():Creature{
        var pika = new Creature("PikaCreature");
        pika.x = Settings.stageWidth * Math.random();
        pika.y = Settings.stageHeight * Math.random();
        pika.init();
        this.AddGameChild(pika);
        this.creatureList.push(pika);

        return pika;
    }

    private addFood():Poffin{
        var food = new Poffin();
        food.x = Settings.stageWidth * Math.random();
        food.y = Settings.stageHeight * Math.random();
        food.init();
        this.AddGameChild(food);
        this.foodList.push(food);

        return food;
    }

    public getNearbyWorldObjects(currentCreature:IWorldObject, currentPoint:PositionPoint):any[]{
        var nearbyObjects:Array<IWorldObject> = new Array<IWorldObject>();

        for(var o:number=-1;o<2; o++){
            for(var i:number=-1;i<2; i++){
                if(this.quadGridDisplayList[this.minXGrid(currentPoint.x+i)])
                {
                    if(this.quadGridDisplayList[this.minXGrid(currentPoint.x+i)][this.minYGrid(currentPoint.y+o)]){
                        nearbyObjects = nearbyObjects.concat( this.quadGridDisplayList[this.minXGrid(currentPoint.x+i)][this.minYGrid(currentPoint.y+o)] );
                    }
                }
            }
        }        
        return nearbyObjects;
    }

    private minXGrid(n:number):number{
        if(n < 0){
            n = 0;
        }else if(n > Math.floor(Settings.stageWidth/Settings.gridSize)){
            n = Math.floor(Settings.stageWidth/Settings.gridSize);
        }
        return n;
    }

    private minYGrid(n:number):number{
        if(n < 0){
            n = 0;
        }else if(n > Math.floor(Settings.stageHeight/Settings.gridSize)){
            n = Math.floor(Settings.stageHeight/Settings.gridSize);
        }
        return n;
    }

    public removeWorldObject(currentObject:IWorldObject, lastPoint:PositionPoint):void{
        if(lastPoint.x > -1){
            var newIndex = Func.GetIdIndex(this.quadGridDisplayList[lastPoint.x][lastPoint.y], currentObject.id);
            this.quadGridDisplayList[lastPoint.x][lastPoint.y].splice(newIndex, 1);
        }
    } 

    public updateObjectPosition(currentObject:IWorldObject, currentPoint:PositionPoint, lastPoint:PositionPoint):number{
        this.removeWorldObject(currentObject, lastPoint);
        
        // Create Arrays if empty
        if(this.quadGridDisplayList[currentPoint.x] == null){
            this.quadGridDisplayList[currentPoint.x] = [];
        }
        if(this.quadGridDisplayList[currentPoint.x][currentPoint.y] == null){
            this.quadGridDisplayList[currentPoint.x][currentPoint.y] = [];
        }

        // Push creature to list
        this.quadGridDisplayList[currentPoint.x][currentPoint.y].push(currentObject);
        return this.quadGridDisplayList[currentPoint.x][currentPoint.y].length - 1;
    }
}