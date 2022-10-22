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

            requestAnimationFrame(() => {
                step();
            })
        }
        step(); //step calling step again when a new frame starts.
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            //Check if there is a person here to talk to (constant check, no need to unbind)
            this.map.checkForActionCutscene();
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

    startMap(mapConfig) {
        //Create new instance of overworld map, passing in the requested map.
        this.map = new OverworldMap(mapConfig);
        this.map.overworld = this;
        this.map.mountObjects();
    }

    init() {
        this.startMap(window.OverworldMaps.IntroRoom);

        this.bindActionInput();
        this.bindHeroPositionCheck();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        //return "up", "down", "left", "right" depending on which key is held down respectively. 
        //Otherwise return undefined if no key is held right now.
        this.directionInput.direction; 

        this.startGameLoop();

        // this.map.startCutscene([
        //     {type: "battle", enemyId: "enemy2"},
        //     // {type: "changeMap", map: "IntroRoom"},
        //     // {type: "textMessage", text: "This is the very first message!"},
        // ])
    }
}