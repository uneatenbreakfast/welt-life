import { WorldController } from '../../World/WorldController';
import { SpriteStorage } from '../../Render/SpriteStorage';
import { Renderer } from '../../Render/Renderer';

export interface IWorldObject{
  id:number;
  type:WorldTypes;
  x:number;
  y:number;
  world:WorldController;
  markAsDeleted:boolean;

  tick();
}

export enum WorldTypes{
  CREATURE ,
  FOOD 
}