import { SpriteStorage } from '../../Render/SpriteStorage';
import { Renderer } from '../../Render/Renderer';

export interface IWorldObject{
  id:number;
  type:WorldTypes;
  x:number;
  y:number;
}

export enum WorldTypes{
  CREATURE = 1,
  FOOD = 2
}