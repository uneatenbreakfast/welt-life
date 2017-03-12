import { IWorldObject } from './Display/IWorldObject';
export class TargetMemoryObject{
    public id:number;
    public worldObject:IWorldObject;

    public oldDisX:number;
    public oldDisY:number;
    public oldDistance:number;

    public newDisX:number;
    public newDisY:number;
    public newDistance:number;
    public angle:number; // (from brainobject's perspective)



    constructor(worldObj:IWorldObject){
        this.id = worldObj.id;
        this.worldObject = worldObj;
    }

    expireOldCalculations():void{
         this.oldDisX = this.newDisX;
         this.oldDisY = this.newDisY;
         this.oldDistance = this.newDistance;
    }

    recalculate(brainobject:IWorldObject):void{
        this.newDisX = Math.abs(this.worldObject.x - brainobject.x);
        this.newDisY = Math.abs(this.worldObject.y - brainobject.y);
        this.newDistance = Math.sqrt(this.newDisX*this.newDisX + this.newDisY*this.newDisY);
    

        //calculate angle
        if(brainobject.x > this.worldObject.x && brainobject.y > this.worldObject.y){
            // Left Top quadrant
            this.angle = 360 - this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }

        if(brainobject.x < this.worldObject.x && brainobject.y > this.worldObject.y){
            // Right Top quadrant
            this.angle = this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }

        if(brainobject.x > this.worldObject.x && brainobject.y < this.worldObject.y){
            // Left Down quadrant
            this.angle = 270 - this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }

        if(brainobject.x < this.worldObject.x && brainobject.y < this.worldObject.y){
            // Right Down quadrant
            this.angle = 90 +this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }

        if(this.newDisX == 0){
            if(brainobject.y > this.worldObject.y){
                // Char below memory object
                this.angle = 0;
            }else {
                this.angle = 180;
            }
        }  if(this.newDisY == 0){
            if(brainobject.x > this.worldObject.x){
                // Char right of memory object
                this.angle = 270;
            }else {
                this.angle = 90;
            }
        }
        
    }

    radiansToDegrees(radians:number){
        return radians * 180 / Math.PI;
    }

    
}