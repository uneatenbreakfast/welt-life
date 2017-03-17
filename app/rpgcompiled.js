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
},{"./Render/Renderer":16,"./Render/SpriteStorage":17}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PositionPoint_1 = require("../Models/PositionPoint");
var TextFormat_1 = require("../World/TextFormat");
var Func_1 = require("../World/Func");
var Brain_1 = require("../NeuralComponents/Brain");
var NeuralReader_1 = require("../NeuralComponents/NeuralReader");
var TargetMemoryObject_1 = require("./TargetMemoryObject");
var IWorldObject_1 = require("./Display/IWorldObject");
var Settings_1 = require("../Settings");
var Constants_1 = require("../Models/Constants");
var WorldObject_1 = require("./Display/WorldObject");
var Creature = (function (_super) {
    __extends(Creature, _super);
    function Creature(armature) {
        var _this = _super.call(this, armature) || this;
        // Creature knows about:
        _this.brain = new Brain_1.Brain();
        _this.memoryBank = new Array();
        // Stats
        _this.hp = 1000;
        _this.generation = 1;
        _this.walkSpeed = 2;
        _this.runSpeed = 5;
        _this.type = IWorldObject_1.WorldTypes.CREATURE;
        _this.id = Math.floor(Math.random() * 99999999999999);
        //
        _this.lastPositionPoint = new PositionPoint_1.PositionPoint(-1, -1, -1);
        _this.loadStats();
        return _this;
    }
    Creature.prototype.init = function () {
        // Only run after external variables on this are set
        this.move(Constants_1.OutputAction.STAND);
    };
    Creature.prototype.loadStats = function () {
        var txtStyle = new TextFormat_1.TextFormat();
        this.statTxt = new PIXI.Text("", txtStyle);
        ;
        this.statTxt.y = 0;
        this.GetSprite().addChild(this.statTxt);
    };
    Creature.prototype.updateStats = function () {
        var text = 'Gen:' + this.generation + '\n';
        text += 'HP:' + this.hp + '\n';
        this.statTxt.text = text;
    };
    Creature.prototype.tick = function () {
        this.think();
        this.age();
        this.updateStats();
    };
    Creature.prototype.age = function () {
        this.hp--;
        if (this.hp < 0) {
            this.removeWorldObject();
        }
    };
    Creature.prototype.getHp = function () {
        return this.hp;
    };
    Creature.prototype.reproduce = function () {
        this.hp += 1000;
        this.world.reproduce(this.brain, this);
    };
    Creature.prototype.addParentMemories = function (brainToAdd) {
        this.brain.addMemories(brainToAdd.getMemories());
    };
    Creature.prototype.move = function (action) {
        switch (action) {
            case Constants_1.OutputAction.LEFT:
                this.x -= this.runSpeed;
                this.scaleX(1);
                break;
            case Constants_1.OutputAction.RIGHT:
                this.x += this.runSpeed;
                this.scaleX(-1);
                break;
            case Constants_1.OutputAction.UP:
                this.y -= this.runSpeed;
                break;
            case Constants_1.OutputAction.DOWN:
                this.y += this.runSpeed;
                break;
            case Constants_1.OutputAction.STAND:
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
        var currentPosition = new PositionPoint_1.PositionPoint(Math.floor(this.x / Settings_1.Settings.gridSize), Math.floor(this.y / Settings_1.Settings.gridSize), -1);
        if (currentPosition.x != this.lastPositionPoint.x && currentPosition.y != this.lastPositionPoint.y) {
            currentPosition.z = this.world.updateObjectPosition(this, currentPosition, this.lastPositionPoint);
            this.lastPositionPoint = currentPosition;
        }
    };
    Creature.prototype.think = function () {
        var targetFromMemory = this.findTarget();
        if (targetFromMemory == null) {
            return;
        }
        targetFromMemory.recalculate(this);
        //--------
        var distanceToTarget = targetFromMemory.newDistance;
        var angleToTarget = targetFromMemory.angle;
        var inputs = [angleToTarget, IWorldObject_1.WorldTypes[targetFromMemory.targetObject.type]];
        var optionsForTheseInputs = this.brain.getBranchesBasedOnInput(inputs);
        // Pick option
        var chosenOption = Func_1.Func.Sample(optionsForTheseInputs);
        NeuralReader_1.NeuralReader.CarryOutAction(this, chosenOption, inputs, this.brain);
        targetFromMemory.expireOldCalculations();
    };
    Creature.prototype.findTarget = function () {
        var _this = this;
        var objs = this.world.getNearbyWorldObjects(this, this.lastPositionPoint);
        var randomSelectedObject = Func_1.Func.Sample(objs);
        if (randomSelectedObject.id == this.id) {
            // Tries to always get something other than itself.. only last option is itself
            objs.forEach(function (x) {
                if (x.id != _this.id) {
                    randomSelectedObject = x;
                    return;
                }
            });
        }
        // retrieve item from memoryBank
        var memory;
        this.memoryBank.forEach(function (mem) {
            if (mem.targetObject.id == randomSelectedObject.id) {
                memory = mem;
                return;
            }
        });
        if (memory == null) {
            memory = new TargetMemoryObject_1.TargetMemoryObject(randomSelectedObject);
        }
        return memory;
    };
    return Creature;
}(WorldObject_1.WorldObject));
exports.Creature = Creature;
},{"../Models/Constants":9,"../Models/PositionPoint":10,"../NeuralComponents/Brain":11,"../NeuralComponents/NeuralReader":14,"../Settings":18,"../World/Func":19,"../World/TextFormat":20,"./Display/IWorldObject":5,"./Display/WorldObject":6,"./TargetMemoryObject":8}],3:[function(require,module,exports){
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
        this._characterSprite = armatureDisplay;
        this._sprite = new PIXI.Sprite();
        this._sprite.addChild(this._characterSprite);
        this.scaleX(1);
        this.Animate("stand");
    };
    LoadedDisplaySprite.prototype.GetSprite = function () {
        return this._sprite;
    };
    LoadedDisplaySprite.prototype.scaleX = function (num) {
        this._characterSprite.scale.x = this.scaleSize * num;
        this._characterSprite.scale.y = this.scaleSize;
    };
    LoadedDisplaySprite.prototype.resize = function (num) {
        this.scaleSize = num;
        this.scaleX(1);
    };
    LoadedDisplaySprite.prototype.Animate = function (animationName) {
        if (this.currentAnimation != animationName) {
            this.currentAnimation = animationName;
            this._characterSprite.animation.play(animationName);
        }
    };
    Object.defineProperty(LoadedDisplaySprite.prototype, "x", {
        //
        get: function () {
            return this._x;
        },
        set: function (xx) {
            this._x = xx;
            this._sprite.x = this._x;
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
},{"../../Render/SpriteStorage":17}],5:[function(require,module,exports){
"use strict";
var WorldTypes;
(function (WorldTypes) {
    WorldTypes[WorldTypes["CREATURE"] = 0] = "CREATURE";
    WorldTypes[WorldTypes["FOOD"] = 1] = "FOOD";
})(WorldTypes = exports.WorldTypes || (exports.WorldTypes = {}));
},{}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WorldController_1 = require("../../World/WorldController");
var DisplayCharacter_1 = require("./DisplayCharacter");
var WorldObject = (function (_super) {
    __extends(WorldObject, _super);
    function WorldObject(armature) {
        var _this = _super.call(this, armature) || this;
        _this.world = WorldController_1.WorldController.getInstance();
        _this.markAsDeleted = false;
        return _this;
    }
    WorldObject.prototype.removeWorldObject = function () {
        this.markAsDeleted = true;
        this.world.removeWorldObject(this, this.lastPositionPoint);
    };
    return WorldObject;
}(DisplayCharacter_1.LoadedDisplaySprite));
exports.WorldObject = WorldObject;
},{"../../World/WorldController":21,"./DisplayCharacter":4}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PositionPoint_1 = require("../Models/PositionPoint");
var IWorldObject_1 = require("./Display/IWorldObject");
var Settings_1 = require("../Settings");
var WorldObject_1 = require("./Display/WorldObject");
var Poffin = (function (_super) {
    __extends(Poffin, _super);
    function Poffin() {
        var _this = _super.call(this, "Poffin") || this;
        _this.type = IWorldObject_1.WorldTypes.FOOD;
        _this.id = Math.floor(Math.random() * 99999999999999);
        return _this;
    }
    Poffin.prototype.init = function () {
        this.lastPositionPoint = new PositionPoint_1.PositionPoint(Math.floor(this.x / Settings_1.Settings.gridSize), Math.floor(this.y / Settings_1.Settings.gridSize), -1);
        this.lastPositionPoint.z = this.world.updateObjectPosition(this, this.lastPositionPoint, new PositionPoint_1.PositionPoint(-1, -1, -1));
    };
    return Poffin;
}(WorldObject_1.WorldObject));
exports.Poffin = Poffin;
},{"../Models/PositionPoint":10,"../Settings":18,"./Display/IWorldObject":5,"./Display/WorldObject":6}],8:[function(require,module,exports){
"use strict";
var TargetMemoryObject = (function () {
    function TargetMemoryObject(worldObj) {
        this.id = worldObj.id;
        this.targetObject = worldObj;
    }
    TargetMemoryObject.prototype.expireOldCalculations = function () {
        this.oldDisX = this.newDisX;
        this.oldDisY = this.newDisY;
        this.oldDistance = this.newDistance;
    };
    TargetMemoryObject.prototype.recalculate = function (creature) {
        this.newDisX = Math.abs(this.targetObject.x - creature.x);
        this.newDisY = Math.abs(this.targetObject.y - creature.y);
        this.newDistance = Math.sqrt(this.newDisX * this.newDisX + this.newDisY * this.newDisY);
        //calculate angle
        if (creature.x < this.targetObject.x && creature.y < this.targetObject.y) {
            // Left Top quadrant
            this.angle = 270 + this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }
        if (creature.x > this.targetObject.x && creature.y < this.targetObject.y) {
            // Right Top quadrant
            this.angle = 90 - this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }
        if (creature.x < this.targetObject.x && creature.y > this.targetObject.y) {
            // Left Down quadrant
            this.angle = 270 - this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }
        if (creature.x > this.targetObject.x && creature.y > this.targetObject.y) {
            // Right Down quadrant
            this.angle = 90 + this.radiansToDegrees(Math.atan(this.newDisY / this.newDisX));
        }
        if (this.newDisX == 0) {
            if (creature.y > this.targetObject.y) {
                // Char below memory object
                this.angle = 0;
            }
            else {
                this.angle = 180;
            }
        }
        if (this.newDisY == 0) {
            if (creature.x > this.targetObject.x) {
                // Char right of memory object
                this.angle = 270;
            }
            else {
                this.angle = 90;
            }
        }
        var baseSliceAngle = 36;
        this.angle = Math.floor(this.angle / baseSliceAngle) * baseSliceAngle;
        //console.log(this.angle, creature.y, this.targetObject.y, WorldTypes[this.targetObject.type], creature.id);
    };
    TargetMemoryObject.prototype.radiansToDegrees = function (radians) {
        return radians * 180 / Math.PI;
    };
    return TargetMemoryObject;
}());
exports.TargetMemoryObject = TargetMemoryObject;
},{}],9:[function(require,module,exports){
"use strict";
var OutputAction;
(function (OutputAction) {
    OutputAction[OutputAction["LEFT"] = 0] = "LEFT";
    OutputAction[OutputAction["RIGHT"] = 1] = "RIGHT";
    OutputAction[OutputAction["UP"] = 2] = "UP";
    OutputAction[OutputAction["DOWN"] = 3] = "DOWN";
    OutputAction[OutputAction["STAND"] = 4] = "STAND";
})(OutputAction = exports.OutputAction || (exports.OutputAction = {}));
},{}],10:[function(require,module,exports){
"use strict";
var PositionPoint = (function () {
    function PositionPoint(_x, _y, _z) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }
    return PositionPoint;
}());
exports.PositionPoint = PositionPoint;
},{}],11:[function(require,module,exports){
"use strict";
var Func_1 = require("../World/Func");
var NeuralBranch_1 = require("./NeuralBranch");
var NeuronMemory_1 = require("./NeuronMemory");
var Constants_1 = require("../Models/Constants");
var Brain = (function () {
    function Brain() {
        this.memory = new Array();
        this.greyMatter = new Array();
        this.usedInputVNeuralBranch = new Array();
        var availableActions = [Constants_1.OutputAction.LEFT, Constants_1.OutputAction.RIGHT, Constants_1.OutputAction.UP, Constants_1.OutputAction.DOWN, Constants_1.OutputAction.STAND];
        for (var i = 0; i < 20; i++) {
            var n = new NeuralBranch_1.NeuralBranch();
            n.generate(availableActions);
            this.greyMatter.push(n);
        }
    }
    Brain.prototype.getBranchesBasedOnInput = function (inputs) {
        var _this = this;
        var res = new Array();
        var inputsStr = inputs.join("-");
        if (this.usedInputVNeuralBranch[inputsStr] == null) {
            //console.log("inputs:", inputsStr);
            this.usedInputVNeuralBranch[inputsStr] = [];
        }
        this.memory.forEach(function (neuron) {
            if (neuron.hasInputs(inputs)) {
                res.push(neuron);
                _this.usedInputVNeuralBranch[inputsStr][neuron.neuralBranch.id] = true;
            }
        });
        res = res.concat(this.getSomeUnknownOptions(inputs, inputsStr));
        //res = res.sort((n1,n2) => n1.numberOfTimesUsed - n2.numberOfTimesUsed);
        return res;
    };
    Brain.prototype.getSomeUnknownOptions = function (inputs, inputsStr) {
        var maxOptions = 10;
        var res = new Array();
        for (var i = 0; i < maxOptions; i++) {
            var neuralOption = Func_1.Func.Sample(this.greyMatter);
            if (this.usedInputVNeuralBranch[inputsStr][neuralOption.id]) {
                continue;
            }
            var n = new NeuronMemory_1.NeuronMemory(inputs);
            n.neuralBranch = neuralOption;
            n.numberOfTimesUsed = 0;
            res.push(n);
        }
        return res;
    };
    Brain.prototype.remember = function (neu) {
        if (neu.numberOfTimesUsed == 1) {
            // First time used, so add to memory
            this.memory.push(neu);
        }
    };
    Brain.prototype.AddOptions = function (grey) {
        this.greyMatter = this.greyMatter.concat(grey);
    };
    Brain.prototype.addMemories = function (mem) {
        this.memory = this.memory.concat(mem);
    };
    Brain.prototype.getOptions = function () {
        return this.greyMatter;
    };
    Brain.prototype.getMemories = function () {
        return this.memory;
    };
    return Brain;
}());
exports.Brain = Brain;
},{"../Models/Constants":9,"../World/Func":19,"./NeuralBranch":13,"./NeuronMemory":15}],12:[function(require,module,exports){
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
},{"../World/Func":19}],13:[function(require,module,exports){
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
},{"../World/Func":19,"./NeuralActions":12}],14:[function(require,module,exports){
"use strict";
var NeuralActions_1 = require("./NeuralActions");
var NeuralReader = (function () {
    function NeuralReader() {
    }
    NeuralReader.CarryOutAction = function (cre, chosenOption, inputs, brain) {
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
        chosenOption.numberOfTimesUsed++;
        brain.remember(chosenOption);
    };
    return NeuralReader;
}());
exports.NeuralReader = NeuralReader;
},{"./NeuralActions":12}],15:[function(require,module,exports){
"use strict";
var NeuronMemory = (function () {
    function NeuronMemory(inputs) {
        var _this = this;
        this.inputs = [];
        inputs.forEach(function (input) {
            _this.inputs[input] = true;
        });
    }
    NeuronMemory.prototype.hasInputs = function (inputsQuery) {
        var _this = this;
        var r = true;
        inputsQuery.forEach(function (query) {
            if (_this.inputs[query] == null) {
                r = false;
                return;
            }
        });
        return r;
    };
    return NeuronMemory;
}());
exports.NeuronMemory = NeuronMemory;
},{}],16:[function(require,module,exports){
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
},{"../Settings":18,"../World/WorldController":21}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
"use strict";
var Settings = (function () {
    function Settings() {
    }
    Settings.initialize = function () {
        Settings.stageWidth = window.innerWidth;
        Settings.stageHeight = window.innerHeight;
        Settings.aspectRatio = 16 / 9;
        Settings.gridSize = 500;
        console.log("==== Initializing Settings");
    };
    return Settings;
}());
exports.Settings = Settings;
},{}],19:[function(require,module,exports){
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
    Func.GetIdIndex = function (array, item) {
        var res = -1;
        array.forEach(function (x, i) {
            if (x.id == item) {
                res = i;
                return;
            }
        });
        return res;
    };
    return Func;
}());
exports.Func = Func;
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
"use strict";
var CreatureStats_1 = require("../Character/CreatureStats");
var TextFormat_1 = require("./TextFormat");
var Func_1 = require("./Func");
var Settings_1 = require("../Settings");
var Poffin_1 = require("../Character/Poffin");
var Creature_1 = require("../Character/Creature");
var WorldController = (function () {
    function WorldController() {
        this.spawnAmount = 10;
        this.spawnTimerMax = 1000;
        this.spawnTimer = 1000;
        this.stage = new PIXI.Sprite();
        this.quadGridDisplayList = new Array();
        this.displayList = [];
        this.foodList = [];
        this.creatureList = [];
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
                var usedClick = false;
                vm.displayList.forEach(function (element) {
                    if (element.GetSprite().getBounds().contains(event.x, event.y)) {
                        usedClick = true;
                        return;
                    }
                });
                if (!usedClick) {
                    var food = vm.addFood();
                    food.x = Settings_1.Settings.stageWidth / 2;
                    food.y = Settings_1.Settings.stageHeight / 2;
                }
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
        for (var i = 0; i < this.spawnAmount; i++) {
            //this.addFood();
            this.addCreature();
        }
        var food = this.addFood();
        food.x = Settings_1.Settings.stageWidth / 2;
        food.y = Settings_1.Settings.stageHeight / 2;
        food.init();
    };
    WorldController.prototype.reproduce = function (brain, parent) {
        var child = this.addCreature();
        child.addParentMemories(brain);
        child.resize(0.3);
        child.generation = parent.generation + 1;
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
        pika.init();
        this.AddGameChild(pika);
        this.creatureList.push(pika);
        return pika;
    };
    WorldController.prototype.addFood = function () {
        var food = new Poffin_1.Poffin();
        food.x = Settings_1.Settings.stageWidth * Math.random();
        food.y = Settings_1.Settings.stageHeight * Math.random();
        food.init();
        this.AddGameChild(food);
        this.foodList.push(food);
        return food;
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
                        if (food.markAsDeleted) {
                            return;
                        }
                        cre.reproduce();
                        food.removeWorldObject();
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
    WorldController.prototype.getNearbyWorldObjects = function (currentCreature, currentPoint) {
        var nearbyObjects = new Array();
        for (var o = -1; o < 2; o++) {
            for (var i = -1; i < 2; i++) {
                if (this.quadGridDisplayList[this.minXGrid(currentPoint.x + i)]) {
                    if (this.quadGridDisplayList[this.minXGrid(currentPoint.x + i)][this.minYGrid(currentPoint.y + o)]) {
                        nearbyObjects = nearbyObjects.concat(this.quadGridDisplayList[this.minXGrid(currentPoint.x + i)][this.minYGrid(currentPoint.y + o)]);
                    }
                }
            }
        }
        return nearbyObjects;
    };
    WorldController.prototype.minXGrid = function (n) {
        if (n < 0) {
            n = 0;
        }
        else if (n > Math.floor(Settings_1.Settings.stageWidth / Settings_1.Settings.gridSize)) {
            n = Math.floor(Settings_1.Settings.stageWidth / Settings_1.Settings.gridSize);
        }
        return n;
    };
    WorldController.prototype.minYGrid = function (n) {
        if (n < 0) {
            n = 0;
        }
        else if (n > Math.floor(Settings_1.Settings.stageHeight / Settings_1.Settings.gridSize)) {
            n = Math.floor(Settings_1.Settings.stageHeight / Settings_1.Settings.gridSize);
        }
        return n;
    };
    WorldController.prototype.removeWorldObject = function (currentObject, lastPoint) {
        if (lastPoint.x > -1) {
            // remove the currentObject if it's still at the same place
            if (this.quadGridDisplayList[lastPoint.x][lastPoint.y][lastPoint.z]) {
                if (this.quadGridDisplayList[lastPoint.x][lastPoint.y][lastPoint.z].id == currentObject.id) {
                    this.quadGridDisplayList[lastPoint.x][lastPoint.y].splice(lastPoint.z, 1);
                    return;
                }
            }
            // Otherwise, look for it then delete it
            var newIndex = Func_1.Func.GetIdIndex(this.quadGridDisplayList[lastPoint.x][lastPoint.y], currentObject.id);
            this.quadGridDisplayList[lastPoint.x][lastPoint.y].splice(newIndex, 1);
        }
    };
    WorldController.prototype.updateObjectPosition = function (currentObject, currentPoint, lastPoint) {
        // Ignore creature's first position
        this.removeWorldObject(currentObject, lastPoint);
        // Create Arrays if empty
        if (this.quadGridDisplayList[currentPoint.x] == null) {
            this.quadGridDisplayList[currentPoint.x] = [];
        }
        if (this.quadGridDisplayList[currentPoint.x][currentPoint.y] == null) {
            this.quadGridDisplayList[currentPoint.x][currentPoint.y] = [];
        }
        // Push creature to list
        this.quadGridDisplayList[currentPoint.x][currentPoint.y].push(currentObject);
        return this.quadGridDisplayList[currentPoint.x][currentPoint.y].length - 1;
    };
    return WorldController;
}());
exports.WorldController = WorldController;
},{"../Character/Creature":2,"../Character/CreatureStats":3,"../Character/Poffin":7,"../Settings":18,"./Func":19,"./TextFormat":20}],22:[function(require,module,exports){
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
},{"./AssetLoader":1,"./Render/Renderer":16,"./Settings":18,"./World/WorldController":21}]},{},[22])
//# sourceMappingURL=rpgcompiled.js.map
