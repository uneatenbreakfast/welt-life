export class Settings {
    public static stageWidth:number;
    public static stageHeight:number;
    public static aspectRatio:number;


    public static initialize():void{
        Settings.stageWidth = window.innerWidth;
        Settings.stageHeight = window.innerHeight;
        Settings.aspectRatio = 16/9;


        console.log("==== Initializing Settings")
    }
}
