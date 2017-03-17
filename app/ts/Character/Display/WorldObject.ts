import { PositionPoint } from '../../Models/PositionPoint';
import { WorldController } from '../../World/WorldController';
import { LoadedDisplaySprite } from './DisplayCharacter';
import { IWorldObject, WorldTypes } from './IWorldObject';
export class WorldObject extends LoadedDisplaySprite implements IWorldObject {
    public id: number;
    public type: WorldTypes;
    public markAsDeleted:boolean;

    public world:WorldController;
    protected lastPositionPoint:PositionPoint;


    constructor(armature:string){
        super(armature);

        this.world = WorldController.getInstance();
        this.markAsDeleted = false;
    }

    public removeWorldObject():void{
        this.markAsDeleted = true;
        this.world.removeWorldObject(this, this.lastPositionPoint);
    }
}