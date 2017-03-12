package gui{
	import flash.display.MovieClip;
	import flash.events.MouseEvent;
	import flash.events.EventDispatcher;
	import flash.events.Event;
	
	public class groupedButtons extends MovieClip{
		public var group:Array;
		public var seld:Boolean = false;
		public var value:String;
		
		public function groupedButtons():void{
			buttonMode = true;
			
			addEventListener(MouseEvent.MOUSE_OVER,glow);
			addEventListener(MouseEvent.MOUSE_OUT,dull);
			addEventListener(MouseEvent.CLICK,selc);
		}

		private function glow(e:MouseEvent):void{
			if(!seld){
				alpha = .5;
			}
		}
		private function dull(e:MouseEvent):void{
			if(!seld){
				alpha = .3;
			}
		}
		public function setOn():void{
			alpha = 1;
			seld = true;
			if(group!=null){
				group["path"][group["variablex"]] = this.value;
				for(var i:int=0;i<group.length;i++){
					if(group[i] != this){
						group[i].seld = false;
						group[i].alpha = .3;
					}
				}
			}
			dispatchEvent(new Event("Clicked"));
		}
		private function selc(e:MouseEvent):void{
			setOn();
		}
	}
}