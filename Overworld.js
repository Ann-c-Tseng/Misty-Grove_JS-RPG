class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d"); //Allows us to later access many 2d canvas methods
        this.map = null;
    }

    //Game loop to redraw images 60 frames each second to update screen consistently.
    startGameLoop() {
        const step = () => {

            //Clear off the entire canvas prior to each frame being drawn in each step
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            //Establish the camera perosn
            const cameraPerson = this.map.gameObjects.hero;
            
            //Update all objects
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                })
            })

            //Draw lower image of map
            this.map.drawLowerImage(this.ctx, cameraPerson);

            //Draw each game object between the upper and lower layers of map
            //Before drawing them to the screen, sort lower y-values to the front of array.
            //Thus drawing more northern sprites before the southern sprites
            Object.values(this.map.gameObjects).sort((a,b) => {
                return a.y - b.y;
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson);
            })

            //Draw lower image of map
            this.map.drawUpperImage(this.ctx, cameraPerson);

            if(!this.map.isPaused) {
                requestAnimationFrame(() => {
                    step();
                })
            }
        }
        step(); //step calling step again when a new frame starts.
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            //Check if there is a person here to talk to (constant check, no need to unbind)
            this.map.checkForActionCutscene();
        })
        new KeyPressListener("Escape", () => {
            if(!this.map.isCutscenePlaying) {
                this.map.startCutscene([
                    {type: "pause"}
                ])
            }
        })
    }

    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if(e.detail.whoId == "hero") {
                //console.log("Hero has moved to a new position");

                //Hero's position has changed, check overworld map to see if
                //any footstep cutscene should trigger here.
                this.map.checkForFootstepCutscene();
            }
        })
    }

    startMap(mapConfig, heroInitialState=null) {
        //Create new instance of overworld map, passing in the requested map.
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();

        if(heroInitialState) {
            this.map.gameObjects.hero.x = heroInitialState.x;
            this.map.gameObjects.hero.y = heroInitialState.y;
            this.map.gameObjects.hero.direction = heroInitialState.direction;
        }

        this.progress.mapId = mapConfig.id;
        this.progress.startingHeroX = this.map.gameObjects.hero.x;
        this.progress.startingHeroY = this.map.gameObjects.hero.y;
        this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
    }

    async init() {

        const container = document.querySelector(".game-container");

        //Create a new progress tracker
        this.progress = new Progress();

        //Show title screen
        this.titleScreen = new TitleScreen({
            progress: this.progress
        })
        const useSaveFile = await this.titleScreen.init(container);

        //Potentially load saved data
        let initialHeroState = null;
        if(useSaveFile) {
            this.progress.load();
            initialHeroState = {
                x: this.progress.startingHeroX,
                y: this.progress.startingHeroY,
                direction: this.progress.startingHeroDirection,
            }
        }

        //Load the HUD
        this.hud = new Hud();
        this.hud.init(container);

        //Starting first game map
        this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

        //Create controls
        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        //return "up", "down", "left", "right" depending on which key is held down respectively. 
        //Otherwise return undefined if no key is held right now.
        this.directionInput.direction; 

        //Game starts now...
        this.startGameLoop();

        // this.map.startCutscene([
        //     {type: "battle", enemyId: "enemy2"},
        //     // {type: "changeMap", map: "IntroRoom"},
        //     // {type: "textMessage", text: "This is the very first message!"},
        // ])
    }
}