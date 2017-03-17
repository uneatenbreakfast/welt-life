import { IWorldObject, WorldTypes } from './Display/IWorldObject';
export class TargetMemoryObject{
    public id:number;
    public targetObject:IWorldObject;

    public oldDisX:number;
    public oldDisY:number;
    public oldDistance:number;

    public newDisX:number;
    public newDisY:number;
    public newDistance:number;
    public angle:number; // (from brainobject's perspective)



    constructor(worldObj:IWorldObject){
        this.id = worldObj.id;
        this.targetObject = worldObj;
    }

    expireOldCalculations():void{
         this.oldDisX = this.newDisX;
         this.oldDisY = this.newDisY;
         this.oldDistance = this.newDistance;
    }

    recalculate(creature:IWorldObject):void{
        this.newDisX = Math.abs(this.targetObject.x - creature.x);
        this.newDisY = Math.abs(this.targetObject.y - creature.y);
        this.newDistance = Math.sqrt(this.newDisX*this.newDisX + this.newDisY*this.newDisY);
    

        //calculate angle
        if(creature.x < this.targetObject.x && creature.y < this.targetObject.y){
            // Left Top quadrant
            this.angle = 270 + this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }

        if(creature.x > this.targetObject.x && creature.y < this.targetObject.y){
            // Right Top quadrant
            this.angle = 90 -this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }

        if(creature.x < this.targetObject.x && creature.y > this.targetObject.y){
            // Left Down quadrant
            this.angle = 270 - this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }

        if(creature.x > this.targetObject.x && creature.y > this.targetObject.y){
            // Right Down quadrant
            this.angle = 90 + this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }

        if(this.newDisX == 0){
            if(creature.y > this.targetObject.y){
                // Char below memory object
                this.angle = 0;
            }else {
                this.angle = 180;
            }
        }  if(this.newDisY == 0){
            if(creature.x > this.targetObject.x){
                // Char right of memory object
                this.angle = 270;
            }else {
                this.angle = 90;
            }
        }

        var baseSliceAngle = 36;


        this.angle = Math.floor(this.angle  / baseSliceAngle) * baseSliceAngle;

        //console.log(this.angle, creature.y, this.targetObject.y, WorldTypes[this.targetObject.type], creature.id);
        
    }

    radiansToDegrees(radians:number){
        return radians * 180 / Math.PI;
    }

    
}