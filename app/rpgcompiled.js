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
},{"./Render/Renderer":13,"./Render/SpriteStorage":14}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Func_1 = require("../World/Func");
var Brain_1 = require("../NeuralComponents/Brain");
var NeuralBranch_1 = require("../NeuralComponents/NeuralBranch");
var NeuralReader_1 = require("../NeuralComponents/NeuralReader");
var TargetMemoryObject_1 = require("./TargetMemoryObject");
var IWorldObject_1 = require("./Display/IWorldObject");
var WorldController_1 = require("../World/WorldController");
var Settings_1 = require("../Settings");
var DisplayCharacter_1 = require("./Display/DisplayCharacter");
var Creature = (function (_super) {
    __extends(Creature, _super);
    function Creature(armature) {
        var _this = _super.call(this, armature) || this;
        // Creature knows about:
        _this._world = WorldController_1.WorldController.getInstance();
        _this.brain = new Brain_1.Brain();
        _this.memoryBank = new Array();
        _this.greyMatter = new Array();
        var availableActions = ["left", "right", "up", "down", "stand"];
        for (var i = 0; i < 20; i++) {
            var n = new NeuralBranch_1.NeuralBranch();
            n.generate(availableActions);
            _this.greyMatter.push(n);
        }
        _this.brain.AddOptions(_this.greyMatter);
        // Stats
        _this.hp = 1000;
        _this.walkSpeed = 2;
        _this.runSpeed = 5;
        _this.type = IWorldObject_1.WorldTypes.CREATURE;
        _this.id = Math.floor(Math.random() * 99999999999999);
        return _this;
    }
    Creature.prototype.tick = function () {
        this.think();
        this.age();
    };
    Creature.prototype.age = function () {
        this.hp--;
        if (this.hp < 0) {
            this.markAsDeleted = true;
        }
    };
    Creature.prototype.getHp = function () {
        return this.hp;
    };
    Creature.prototype.reproduce = function () {
        this.hp += 1000;
        this._world.reproduce(this.brain, this);
    };
    Creature.prototype.addBrain = function (brainToAdd) {
        this.brain.AddOptions(brainToAdd.getOptions());
    };
    Creature.prototype.move = function (action) {
        switch (action) {
            case "left":
                this.x -= this.runSpeed;
                this.scaleX(1);
                break;
            case "right":
                this.x += this.runSpeed;
                this.scaleX(-1);
                break;
            case "up":
                this.y -= this.runSpeed;
                break;
            case "down":
                this.y += this.runSpeed;
                break;
            case "stand":
                break;
            default:
                console.log("Invalid Action:", action);
        }
        if (this.x < 0) {
            this.x = Settings_1.Settings.stageWidth;
        }
        else if (this.x > Settings_1.Settings.stageWidth) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = Settings_1.Settings.stageHeight;
        }
        else if (this.y > Settings_1.Settings.stageHeight) {
            this.y = 0;
        }
    };
    Creature.prototype.think = function () {
        var targetFromMemory = this.findTarget();
        targetFromMemory.recalculate(this);
        //--------
        var distanceToTarget = targetFromMemory.newDistance;
        var angleToTarget = targetFromMemory.angle;
        var inputs = [angleToTarget, targetFromMemory.worldObject.type];
        var optionsForTheseInputs = this.brain.getBranchesBasedOnInput(inputs);
        // Pick option
        var chosenOption = Func_1.Func.Sample(optionsForTheseInputs); // need to favour higher values
        NeuralReader_1.NeuralReader.CarryOutAction(this, chosenOption, inputs);
        chosenOption.value++;
        this.brain.remember(chosenOption);
        //
        // pick GA Tree based on value and randomness - based on given inputs 
        // 
        // check if it's any closer to target (need to come up with memory for running away from targets)
        // reassign fit value
        //--------
        targetFromMemory.expireOldCalculations();
    };
    Creature.prototype.findTarget = function () {
        var firstWorldObject;
        var objs = this._world.getWorldObjects();
        objs.forEach(function (element) {
            firstWorldObject = element;
        });
        // retrieve item from memoryBank
        var memory;
        this.memoryBank.forEach(function (element) {
            element.id = firstWorldObject.id;
            memory = element;
            return;
        });
        if (memory == null) {
            memory = new TargetMemoryObject_1.TargetMemoryObject(firstWorldObject);
        }
        return memory;
    };
    return Creature;
}(DisplayCharacter_1.LoadedDisplaySprite));
exports.Creature = Creature;
},{"../NeuralComponents/Brain":8,"../NeuralComponents/NeuralBranch":10,"../NeuralComponents/NeuralReader":11,"../Settings":15,"../World/Func":16,"../World/WorldController":18,"./Display/DisplayCharacter":4,"./Display/IWorldObject":5,"./TargetMemoryObject":7}],3:[function(require,module,exports){
"use strict";
var CreatureStats = (function () {
    function CreatureStats() {
        this.HP = 0;
    }
    return CreatureStats;
}());
exports.CreatureStats = CreatureStats;
},{}],4:[function(require,module,exports){
"use strict";
var SpriteStorage_1 = require("../../Render/SpriteStorage");
var LoadedDisplaySprite = (function () {
    function LoadedDisplaySprite(armature) {
        this.spriteStorage = new SpriteStorage_1.SpriteStorage();
        this.dragonFactory = this.spriteStorage.getPixiFactory();
        this.scaleSize = 0.4;
        this.markAsDeleted = false;
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
    LoadedDisplaySprite.prototype.resize = function (num) {
        this.scaleSize = num;
        this.scaleX(1);
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
},{"../../Render/SpriteStorage":14}],5:[function(require,module,exports){
"use strict";
var WorldTypes;
(function (WorldTypes) {
    WorldTypes[WorldTypes["CREATURE"] = 1] = "CREATURE";
    WorldTypes[WorldTypes["FOOD"] = 2] = "FOOD";
})(WorldTypes = exports.WorldTypes || (exports.WorldTypes = {}));
},{}],6:[function(require,module,exports){
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
        _this.markAsDeleted = false;
        _this.type = IWorldObject_1.WorldTypes.FOOD;
        _this.id = Math.floor(Math.random() * 99999999999999);
        return _this;
    }
    Poffin.prototype.eaten = function () {
        this.markAsDeleted = true;
    };
    return Poffin;
}(DisplayCharacter_1.LoadedDisplaySprite));
exports.Poffin = Poffin;
},{"./Display/DisplayCharacter":4,"./Display/IWorldObject":5}],7:[function(require,module,exports){
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
        var baseSliceAngle = 36;
        this.angle = Math.floor(this.angle / baseSliceAngle) * baseSliceAngle;
    };
    TargetMemoryObject.prototype.radiansToDegrees = function (radians) {
        return radians * 180 / Math.PI;
    };
    return TargetMemoryObject;
}());
exports.TargetMemoryObject = TargetMemoryObject;
},{}],8:[function(require,module,exports){
"use strict";
var Func_1 = require("../World/Func");
var NeuronRating_1 = require("./NeuronRating");
var Brain = (function () {
    function Brain() {
        this.memory = new Array();
        this.greyMatter = new Array();
    }
    Brain.prototype.getBranchesBasedOnInput = function (inputs) {
        var res = new Array();
        var usedNeurons = [];
        this.memory.forEach(function (neuron) {
            if (neuron.hasInputs(inputs)) {
                res.push(neuron);
                usedNeurons[neuron.neuralBranch.id] = true;
            }
        });
        res = res.concat(this.getSomeUnknownOptions(inputs, usedNeurons));
        res = res.sort(function (n1, n2) { return n1.value - n2.value; });
        return res;
    };
    Brain.prototype.getSomeUnknownOptions = function (inputs, usedNeurons) {
        var maxOptions = 10;
        var res = new Array();
        for (var i = 0; i < maxOptions; i++) {
            var neuralOption = Func_1.Func.Sample(this.greyMatter);
            if (usedNeurons[neuralOption.id] == true) {
                continue;
            }
            usedNeurons[neuralOption.id] = true;
            var n = new NeuronRating_1.NeuronRating();
            n.inputs = inputs;
            n.neuralBranch = neuralOption;
            n.value = 0;
            res.push(n);
        }
        return res;
    };
    Brain.prototype.remember = function (neu) {
        this.memory.push(neu);
    };
    Brain.prototype.AddOptions = function (grey) {
        this.greyMatter = this.greyMatter.concat(grey);
    };
    Brain.prototype.getOptions = function () {
        return this.greyMatter;
    };
    return Brain;
}());
exports.Brain = Brain;
},{"../World/Func":16,"./NeuronRating":12}],9:[function(require,module,exports){
"use strict";
var Func_1 = require("../World/Func");
var NeuralActions = (function () {
    function NeuralActions(act, val) {
        this.action = act;
        this.valToCompare = val;
    }
    NeuralActions.getComparator = function () {
        var conjuctions = [ActionTypes.LESS_THAN, ActionTypes.GREATER_THAN, ActionTypes.EQUAL_TO];
        return Func_1.Func.Sample(conjuctions);
    };
    return NeuralActions;
}());
exports.NeuralActions = NeuralActions;
var ActionTypes;
(function (ActionTypes) {
    ActionTypes[ActionTypes["INPUT"] = 0] = "INPUT";
    ActionTypes[ActionTypes["COMPARED_TO_VAL"] = 1] = "COMPARED_TO_VAL";
    ActionTypes[ActionTypes["DO_ACTION"] = 2] = "DO_ACTION";
    // Comparators
    ActionTypes[ActionTypes["LESS_THAN"] = 3] = "LESS_THAN";
    ActionTypes[ActionTypes["GREATER_THAN"] = 4] = "GREATER_THAN";
    ActionTypes[ActionTypes["EQUAL_TO"] = 5] = "EQUAL_TO";
    //Conjuction
    ActionTypes[ActionTypes["AND"] = 6] = "AND";
    ActionTypes[ActionTypes["OR"] = 7] = "OR";
})(ActionTypes = exports.ActionTypes || (exports.ActionTypes = {}));
},{"../World/Func":16}],10:[function(require,module,exports){
"use strict";
var Func_1 = require("../World/Func");
var NeuralActions_1 = require("./NeuralActions");
var NeuralBranch = (function () {
    function NeuralBranch() {
        this.id = Math.floor(Math.random() * 99999999999999);
        this.actions = new Array();
    }
    NeuralBranch.prototype.generate = function (availableActions) {
        var vals = [36, 72, 108, 144, 180, 216, 252, 288, 324, 360];
        this.actions.push(new NeuralActions_1.NeuralActions(NeuralActions_1.ActionTypes.INPUT));
        this.actions.push(new NeuralActions_1.NeuralActions(NeuralActions_1.NeuralActions.getComparator()));
        this.actions.push(new NeuralActions_1.NeuralActions(NeuralActions_1.ActionTypes.COMPARED_TO_VAL, Func_1.Func.Sample(vals)));
        this.actions.push(new NeuralActions_1.NeuralActions(NeuralActions_1.ActionTypes.DO_ACTION, Func_1.Func.Sample(availableActions)));
    };
    return NeuralBranch;
}());
exports.NeuralBranch = NeuralBranch;
},{"../World/Func":16,"./NeuralActions":9}],11:[function(require,module,exports){
"use strict";
var NeuralActions_1 = require("./NeuralActions");
var NeuralReader = (function () {
    function NeuralReader() {
    }
    NeuralReader.CarryOutAction = function (cre, chosenOption, inputs) {
        var res = "";
        chosenOption.neuralBranch.actions.forEach(function (action) {
            switch (action.action) {
                case NeuralActions_1.ActionTypes.INPUT:
                    res += inputs[0];
                    break;
                case NeuralActions_1.ActionTypes.COMPARED_TO_VAL:
                    res += action.valToCompare;
                    break;
                case NeuralActions_1.ActionTypes.DO_ACTION:
                    try {
                        var r = eval(res);
                        if (r) {
                            cre.move(action.valToCompare);
                        }
                    }
                    catch (e) {
                        console.log("Invalid Eval", res, e);
                    }
                    break;
                case NeuralActions_1.ActionTypes.LESS_THAN:
                    res += "<";
                    break;
                case NeuralActions_1.ActionTypes.GREATER_THAN:
                    res += ">";
                    break;
                case NeuralActions_1.ActionTypes.EQUAL_TO:
                    res += "==";
                    break;
            }
        });
    };
    return NeuralReader;
}());
exports.NeuralReader = NeuralReader;
},{"./NeuralActions":9}],12:[function(require,module,exports){
"use strict";
var NeuronRating = (function () {
    function NeuronRating() {
    }
    NeuronRating.prototype.hasInputs = function (inputsQuery) {
        var r = true;
        this.inputs.forEach(function (input) {
            inputsQuery.forEach(function (query) {
                if (input != query) {
                    r = false;
                    return;
                }
            });
        });
        return r;
    };
    return NeuronRating;
}());
exports.NeuronRating = NeuronRating;
},{}],13:[function(require,module,exports){
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
},{"../Settings":15,"../World/WorldController":18}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
"use strict";
var Func = (function () {
    function Func() {
    }
    Func.Sample = function (array) {
        return array[Math.floor(Math.random() * array.length)];
    };
    Func.RemoveItem = function (array, item) {
        var index = array.indexOf(item, 0);
        if (index > -1) {
            array.splice(index, 1);
        }
    };
    return Func;
}());
exports.Func = Func;
},{}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TextFormat = (function (_super) {
    __extends(TextFormat, _super);
    function TextFormat() {
        var _this = _super.call(this) || this;
        //this.fontFamily = "Roboto Condensed";//"Roboto";
        _this.fontSize = 15;
        _this.wordWrap = true;
        return _this;
    }
    return TextFormat;
}(PIXI.TextStyle));
exports.TextFormat = TextFormat;
},{}],18:[function(require,module,exports){
"use strict";
var CreatureStats_1 = require("../Character/CreatureStats");
var TextFormat_1 = require("./TextFormat");
var Func_1 = require("./Func");
var Settings_1 = require("../Settings");
var Poffin_1 = require("../Character/Poffin");
var Creature_1 = require("../Character/Creature");
var WorldController = (function () {
    function WorldController() {
        this.stage = new PIXI.Sprite();
        this.displayList = [];
        this.foodList = [];
        this.creatureList = [];
        this.spawnTimer = 5100;
        this.spawnTimerMax = 5100;
        this.addInformation();
        this.bestStats = new CreatureStats_1.CreatureStats();
        this.clickHandlers();
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
    WorldController.prototype.clickHandlers = function () {
        var vm = this;
        document.body.addEventListener('click', function (event) {
            if (event.path[0].tagName == "CANVAS") {
                // Only clicks that hit the canvas directly will be let through
                vm.displayList.forEach(function (element) {
                    if (element.GetSprite().getBounds().contains(event.x, event.y)) {
                        console.log(element);
                        return;
                    }
                });
            }
        });
    };
    WorldController.prototype.addInformation = function () {
        var normStyle = new TextFormat_1.TextFormat();
        this.worldBillBoard = new PIXI.Text("", normStyle);
        this.worldBillBoard.x = 20;
        this.worldBillBoard.y = 20;
        //this.worldBillBoard.height = 200;
        this.stage.addChild(this.worldBillBoard);
    };
    WorldController.prototype.updateWorldBillBoard = function () {
        var txt = "Best HP: " + this.bestStats.HP;
        this.worldBillBoard.text = txt;
    };
    WorldController.prototype.trackCreature = function (cre) {
        if (this.bestCreature == null) {
            this.bestCreature = cre;
        }
        if (cre.getHp() > this.bestStats.HP) {
            this.bestCreature = cre;
            this.bestStats.HP = cre.getHp();
        }
    };
    WorldController.prototype.spawn = function () {
        for (var i = 0; i < 10; i++) {
            this.addCreature();
            this.addFood();
        }
    };
    WorldController.prototype.reproduce = function (brain, parent) {
        var child = this.addCreature();
        child.addBrain(brain);
        child.resize(0.3);
        child.x = parent.x + 20;
        this.trackCreature(parent);
    };
    WorldController.prototype.AddGameChild = function (char) {
        this.stage.addChild(char.GetSprite());
        this.displayList.push(char);
    };
    WorldController.prototype.addCreature = function () {
        var pika = new Creature_1.Creature("PikaCreature");
        pika.x = Settings_1.Settings.stageWidth * Math.random();
        pika.y = Settings_1.Settings.stageHeight * Math.random();
        this.AddGameChild(pika);
        this.creatureList.push(pika);
        return pika;
    };
    WorldController.prototype.addFood = function () {
        var food = new Poffin_1.Poffin();
        food.x = Settings_1.Settings.stageWidth * Math.random();
        food.y = Settings_1.Settings.stageHeight * Math.random();
        this.AddGameChild(food);
        this.foodList.push(food);
    };
    WorldController.prototype.tickTock = function () {
        // Sort Z-Index
        this.stage.children.sort(function (obj1, obj2) {
            return obj1.position.y - obj2.position.y;
        });
        // Run all Objects
        for (var _i = 0, _a = this.displayList; _i < _a.length; _i++) {
            var char = _a[_i];
            char.tick();
        }
        var _loop_1 = function (food) {
            if (food.markAsDeleted) {
                return "continue";
            }
            this_1.creatureList.forEach(function (cre) {
                if (Math.abs(cre.x - food.x) < 20) {
                    if (Math.abs(cre.y - food.y) < 20) {
                        cre.reproduce();
                        food.eaten();
                    }
                }
            });
        };
        var this_1 = this;
        // Is food Eaten
        for (var _b = 0, _c = this.foodList; _b < _c.length; _b++) {
            var food = _c[_b];
            _loop_1(food);
        }
        // Clear deleted objects
        for (var _d = 0, _e = this.displayList; _d < _e.length; _d++) {
            var disobj = _e[_d];
            if (disobj.markAsDeleted) {
                this.stage.removeChild(disobj.GetSprite());
                Func_1.Func.RemoveItem(this.displayList, disobj);
                Func_1.Func.RemoveItem(this.creatureList, disobj);
                Func_1.Func.RemoveItem(this.foodList, disobj);
            }
        }
        // Run world clock
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnTimerMax;
            this.spawn();
        }
        // worldBillBoard
        this.updateWorldBillBoard();
    };
    WorldController.prototype.getWorldObjects = function () {
        return this.displayList;
    };
    return WorldController;
}());
exports.WorldController = WorldController;
},{"../Character/Creature":2,"../Character/CreatureStats":3,"../Character/Poffin":6,"../Settings":15,"./Func":16,"./TextFormat":17}],19:[function(require,module,exports){
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
},{"./AssetLoader":1,"./Render/Renderer":13,"./Settings":15,"./World/WorldController":18}]},{},[19])
//# sourceMappingURL=rpgcompiled.js.map
