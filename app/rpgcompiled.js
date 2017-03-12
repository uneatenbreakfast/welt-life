(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Renderer_1 = require("./Render/Renderer");
var SpriteStorage_1 = require("./Render/SpriteStorage");
var AssetLoader = (function () {
    function AssetLoader(func) {
        this.numberLoaded = 0;
        this.numberToLoad = 0;
        this._func = func;
    }
    AssetLoader.prototype.load = function () {
        this.loadFonts();
        this.loadCharacters();
    };
    //-----------------------
    AssetLoader.prototype.loadComplete = function () {
        this.numberLoaded++;
        if (this.numberLoaded == this.numberToLoad) {
            // Loading complete
            this._func();
        }
    };
    //-----------------------
    AssetLoader.prototype.addRenderedTexture = function () {
        var wrend = Renderer_1.Renderer.getInstance();
        var spriteStorage = new SpriteStorage_1.SpriteStorage();
        var redstripstex = PIXI.Texture.fromImage('images/redimage.png');
        var sprite1 = new PIXI.Sprite(redstripstex);
        var rt = PIXI.RenderTexture.create(305, 20);
        wrend.getRender().render(sprite1, rt);
        spriteStorage.addRawTexture("reddot", rt);
    };
    AssetLoader.prototype.loadFonts = function () {
        var font = new FontFaceObserver('Roboto Condensed', {});
        font.load().then(function () {
            console.log('Font is available');
        }, function () {
            console.log('Font is not available');
        });
    };
    AssetLoader.prototype.loadCharacters = function () {
        var vm = this;
        var spriteStorage = new SpriteStorage_1.SpriteStorage();
        var dragonFactory = spriteStorage.getPixiFactory();
        this.numberToLoad++;
        PIXI.loader
            .add("hero_data", "images/creatures/creatures_ske.json")
            .add("hero_texture_data", "images/creatures/creatures_tex.json")
            .add("hero_texture", "images/creatures/creatures_tex.png");
        PIXI.loader.once("complete", function (loader, object) {
            var dragonData = dragonFactory.parseDragonBonesData(object["hero_data"].data);
            dragonFactory.parseTextureAtlasData(object["hero_texture_data"].data, object["hero_texture"].texture);
            if (dragonData) {
                spriteStorage.addSprite("hero_data", dragonData);
                vm.loadComplete();
            }
        }, this);
        PIXI.loader.load();
    };
    return AssetLoader;
}());
exports.AssetLoader = AssetLoader;
},{"./Render/Renderer":8,"./Render/SpriteStorage":9}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var NeuralReader_1 = require("../NeuralComponents/NeuralReader");
var TargetMemoryObject_1 = require("./TargetMemoryObject");
var IWorldObject_1 = require("./Display/IWorldObject");
var WorldController_1 = require("../World/WorldController");
var DisplayCharacter_1 = require("./Display/DisplayCharacter");
var Creature = (function (_super) {
    __extends(Creature, _super);
    function Creature(armature) {
        var _this = _super.call(this, armature) || this;
        // Creature knows about:
        _this._world = WorldController_1.WorldController.getInstance();
        _this.memoryBank = new Array();
        // Stats
        _this.walkSpeed = 2;
        _this.runSpeed = 5;
        _this.type = IWorldObject_1.WorldTypes.CREATURE;
        _this.id = Math.random() * 9999999999999;
        return _this;
    }
    Creature.prototype.tick = function () {
        this.think();
    };
    Creature.prototype.think = function () {
        var targetFromMemory = this.findTarget();
        targetFromMemory.recalculate(this);
        //--------
        var distanceToTarget = targetFromMemory.newDistance;
        var angleToTarget = targetFromMemory.angle;
        var inputs = [distanceToTarget, angleToTarget];
        var availableActions = ["left", "right", "up", "down", "stand"];
        inputs.forEach(function (input) {
            availableActions.forEach(function (action) {
                NeuralReader_1.NeuralReader.Read();
            });
        });
        //--------
        targetFromMemory.expireOldCalculations();
    };
    Creature.prototype.findTarget = function () {
        var firstFoodItem;
        var objs = this._world.getWorldObjects();
        objs.forEach(function (element) {
            if (element.type == IWorldObject_1.WorldTypes.FOOD) {
                firstFoodItem = element;
                return;
            }
        });
        // retrieve item from memoryBank
        var memory;
        this.memoryBank.forEach(function (element) {
            element.id = firstFoodItem.id;
            memory = element;
            return;
        });
        if (memory == null) {
            memory = new TargetMemoryObject_1.TargetMemoryObject(firstFoodItem);
        }
        return memory;
    };
    return Creature;
}(DisplayCharacter_1.LoadedDisplaySprite));
exports.Creature = Creature;
},{"../NeuralComponents/NeuralReader":7,"../World/WorldController":11,"./Display/DisplayCharacter":3,"./Display/IWorldObject":4,"./TargetMemoryObject":6}],3:[function(require,module,exports){
"use strict";
var SpriteStorage_1 = require("../../Render/SpriteStorage");
var LoadedDisplaySprite = (function () {
    function LoadedDisplaySprite(armature) {
        this.spriteStorage = new SpriteStorage_1.SpriteStorage();
        this.dragonFactory = this.spriteStorage.getPixiFactory();
        this.scaleSize = 0.4;
        var char = this.spriteStorage.getSpriteData("hero_data");
        if (char != null) {
            this.addCharacter(armature);
        }
    }
    LoadedDisplaySprite.prototype.addCharacter = function (armature) {
        var armatureDisplay = this.dragonFactory.buildArmatureDisplay(armature);
        this._sprite = armatureDisplay;
        this.scaleX(1);
        this.Animate("stand");
    };
    LoadedDisplaySprite.prototype.GetSprite = function () {
        return this._sprite;
    };
    LoadedDisplaySprite.prototype.scaleX = function (num) {
        this._sprite.scale.x = this.scaleSize * num;
        this._sprite.scale.y = this.scaleSize;
    };
    LoadedDisplaySprite.prototype.Animate = function (animationName) {
        if (this.currentAnimation != animationName) {
            this.currentAnimation = animationName;
            this._sprite.animation.play(animationName);
        }
    };
    Object.defineProperty(LoadedDisplaySprite.prototype, "x", {
        //
        get: function () {
            return this._x;
        },
        set: function (xx) {
            this._x = xx;
            try {
                this._sprite.x = this._x;
            }
            catch (e) {
                console.log(e.stack);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoadedDisplaySprite.prototype, "y", {
        //
        get: function () {
            return this._y;
        },
        set: function (yy) {
            this._y = yy;
            this._sprite.y = this._y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoadedDisplaySprite.prototype, "z", {
        //
        get: function () {
            return this._z;
        },
        set: function (zz) {
            this._z = zz;
        },
        enumerable: true,
        configurable: true
    });
    //
    LoadedDisplaySprite.prototype.tick = function () {
    };
    return LoadedDisplaySprite;
}());
exports.LoadedDisplaySprite = LoadedDisplaySprite;
},{"../../Render/SpriteStorage":9}],4:[function(require,module,exports){
"use strict";
var WorldTypes;
(function (WorldTypes) {
    WorldTypes[WorldTypes["CREATURE"] = 1] = "CREATURE";
    WorldTypes[WorldTypes["FOOD"] = 2] = "FOOD";
})(WorldTypes = exports.WorldTypes || (exports.WorldTypes = {}));
},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IWorldObject_1 = require("./Display/IWorldObject");
var DisplayCharacter_1 = require("./Display/DisplayCharacter");
var Poffin = (function (_super) {
    __extends(Poffin, _super);
    function Poffin() {
        var _this = _super.call(this, "Poffin") || this;
        _this.type = IWorldObject_1.WorldTypes.FOOD;
        _this.id = Math.random() * 9999999999999;
        return _this;
    }
    return Poffin;
}(DisplayCharacter_1.LoadedDisplaySprite));
exports.Poffin = Poffin;
},{"./Display/DisplayCharacter":3,"./Display/IWorldObject":4}],6:[function(require,module,exports){
"use strict";
var TargetMemoryObject = (function () {
    function TargetMemoryObject(worldObj) {
        this.id = worldObj.id;
        this.worldObject = worldObj;
    }
    TargetMemoryObject.prototype.expireOldCalculations = function () {
        this.oldDisX = this.newDisX;
        this.oldDisY = this.newDisY;
        this.oldDistance = this.newDistance;
    };
    TargetMemoryObject.prototype.recalculate = function (brainobject) {
        this.newDisX = Math.abs(this.worldObject.x - brainobject.x);
        this.newDisY = Math.abs(this.worldObject.y - brainobject.y);
        this.newDistance = Math.sqrt(this.newDisX * this.newDisX + this.newDisY * this.newDisY);
        //calculate angle
        if (brainobject.x > this.worldObject.x && brainobject.y > this.worldObject.y) {
            // Left Top quadrant
            this.angle = 360 - this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }
        if (brainobject.x < this.worldObject.x && brainobject.y > this.worldObject.y) {
            // Right Top quadrant
            this.angle = this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }
        if (brainobject.x > this.worldObject.x && brainobject.y < this.worldObject.y) {
            // Left Down quadrant
            this.angle = 270 - this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }
        if (brainobject.x < this.worldObject.x && brainobject.y < this.worldObject.y) {
            // Right Down quadrant
            this.angle = 90 + this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }
        if (this.newDisX == 0) {
            if (brainobject.y > this.worldObject.y) {
                // Char below memory object
                this.angle = 0;
            }
            else {
                this.angle = 180;
            }
        }
        if (this.newDisY == 0) {
            if (brainobject.x > this.worldObject.x) {
                // Char right of memory object
                this.angle = 270;
            }
            else {
                this.angle = 90;
            }
        }
    };
    TargetMemoryObject.prototype.radiansToDegrees = function (radians) {
        return radians * 180 / Math.PI;
    };
    return TargetMemoryObject;
}());
exports.TargetMemoryObject = TargetMemoryObject;
},{}],7:[function(require,module,exports){
"use strict";
var NeuralReader = (function () {
    function NeuralReader() {
    }
    NeuralReader.Read = function () {
        return 1;
    };
    return NeuralReader;
}());
exports.NeuralReader = NeuralReader;
},{}],8:[function(require,module,exports){
"use strict";
var WorldController_1 = require("../World/WorldController");
var Settings_1 = require("../Settings");
var Renderer = (function () {
    function Renderer() {
        var _this = this;
        this.RefreshDisplay = function () {
            _this.worldController.tickTock();
            _this._renderer.render(_this._stage); // render the stage
            _this.fpsmeter.tick(); // fps ticker
            requestAnimationFrame(_this.RefreshDisplay);
        };
        // Variable Initialization
        this._stage = new PIXI.Container();
        this._stage.hitArea = new PIXI.Rectangle(0, 0, Settings_1.Settings.stageWidth, Settings_1.Settings.stageHeight);
        this._renderer = PIXI.autoDetectRenderer(Settings_1.Settings.stageWidth, Settings_1.Settings.stageHeight, {
            backgroundColor: 0x65C25D,
            antialias: true
        });
        // Add FPS Meter
        this.fpsmeter = new FPSMeter();
        // Add PIXI container to the HTML page
        document.body.appendChild(this._renderer.view);
        // Set references
        this.worldController = WorldController_1.WorldController.getInstance();
        // Game Ticker
        requestAnimationFrame(this.RefreshDisplay);
    }
    Renderer.getInstance = function () {
        if (this._singleton == null) {
            this._singleton = new Renderer();
        }
        return this._singleton;
    };
    Renderer.prototype.getRender = function () {
        return this._renderer;
    };
    Renderer.prototype.AddAnySprite = function (char) {
        this._stage.addChild(char);
    };
    return Renderer;
}());
exports.Renderer = Renderer;
},{"../Settings":10,"../World/WorldController":11}],9:[function(require,module,exports){
"use strict";
var SpriteStorage = (function () {
    function SpriteStorage() {
        if (!SpriteStorage._singleton) {
            SpriteStorage._singleton = this;
            this.init();
        }
        return SpriteStorage._singleton;
    }
    SpriteStorage.prototype.init = function () {
        this._store = [];
        this._textureStore = [];
        this._renderReadyTextureStore = [];
        this._renderReadySpriteStore = [];
        this.num = Math.random();
    };
    SpriteStorage.prototype.getPixiFactory = function () {
        if (this._pixiFactory == null) {
            this._pixiFactory = new dragonBones.PixiFactory();
        }
        return this._pixiFactory;
    };
    //-----------------------
    SpriteStorage.prototype.addSprite = function (spriteName, dragonData) {
        this._store[spriteName] = dragonData;
    };
    SpriteStorage.prototype.getSpriteData = function (spriteName) {
        return this._store[spriteName];
    };
    //-----------------------
    SpriteStorage.prototype.addRawTexture = function (textName, texture) {
        var sp = new PIXI.Sprite(texture);
        this._textureStore[textName] = sp;
    };
    SpriteStorage.prototype.getSprite = function (textureName) {
        return this._textureStore[textureName]; //returns clothing sprite
    };
    return SpriteStorage;
}());
exports.SpriteStorage = SpriteStorage;
},{}],10:[function(require,module,exports){
"use strict";
var Settings = (function () {
    function Settings() {
    }
    Settings.initialize = function () {
        Settings.stageWidth = window.innerWidth;
        Settings.stageHeight = window.innerHeight;
        Settings.aspectRatio = 16 / 9;
        console.log("==== Initializing Settings");
    };
    return Settings;
}());
exports.Settings = Settings;
},{}],11:[function(require,module,exports){
"use strict";
var Poffin_1 = require("../Character/Poffin");
var Creature_1 = require("../Character/Creature");
var WorldController = (function () {
    function WorldController() {
        this.stage = new PIXI.Sprite();
        this.displayList = [];
    }
    WorldController.getInstance = function () {
        if (this._singleton == null) {
            this._singleton = new WorldController();
        }
        return this._singleton;
    };
    WorldController.prototype.getDisplaySprite = function () {
        return this.stage;
    };
    WorldController.prototype.spawn = function () {
        var pika = new Creature_1.Creature("PikaCreature");
        pika.x = 250;
        pika.y = 150;
        this.AddGameChild(pika);
        var food = new Poffin_1.Poffin();
        food.x = 200;
        food.y = 200;
        this.AddGameChild(food);
    };
    WorldController.prototype.AddGameChild = function (char) {
        this.stage.addChild(char.GetSprite());
        this.displayList.push(char);
    };
    WorldController.prototype.tickTock = function () {
        this.stage.children.sort(function (obj1, obj2) {
            return obj1.position.y - obj2.position.y;
        });
        for (var _i = 0, _a = this.displayList; _i < _a.length; _i++) {
            var char = _a[_i];
            char.tick();
        }
    };
    WorldController.prototype.getWorldObjects = function () {
        return this.displayList;
    };
    return WorldController;
}());
exports.WorldController = WorldController;
},{"../Character/Creature":2,"../Character/Poffin":5}],12:[function(require,module,exports){
"use strict";
var Settings_1 = require("./Settings");
var WorldController_1 = require("./World/WorldController");
var AssetLoader_1 = require("./AssetLoader");
var Renderer_1 = require("./Render/Renderer");
var RPG = (function () {
    /*
    -------------------------------------------
    ----------  TO DO LIST --------------------
    -------------------------------------------
    - Get different facial expressions shown
    - Tiling system
    - Camera system
  
    -------------------------------------------
    ----------  Notes -------------------------
    -------------------------------------------
    - 32 bit / 360 dpi
    */
    function RPG() {
        console.log("%c========== Game Start ==========", "background: #222; color: #bada55;");
        var loader = new AssetLoader_1.AssetLoader(this.loadEngine);
        loader.load();
    }
    RPG.prototype.loadEngine = function () {
        // Note: 'this' here is in the context of AssetLoader still
        Settings_1.Settings.initialize();
        this.rendererController = Renderer_1.Renderer.getInstance();
        this.worldController = WorldController_1.WorldController.getInstance();
        this.worldController.spawn();
        this.rendererController.AddAnySprite(this.worldController.getDisplaySprite());
    };
    return RPG;
}());
// Game Start ----------
new RPG();
//----------------------
},{"./AssetLoader":1,"./Render/Renderer":8,"./Settings":10,"./World/WorldController":11}]},{},[12])
//# sourceMappingURL=rpgcompiled.js.map
