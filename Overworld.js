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

    init() {
        //Create new instance of overworld map, passing in the requested map.
        this.map = new OverworldMap(window.OverworldMaps.IntroRoom);
        this.map.mountObjects();

        this.directionInput = new DirectionInput();
        this.directionInput.init();

        //return "up", "down", "left", "right" depending on which key is held down respectively. 
        //Otherwise return undefined if no key is held right now.
        this.directionInput.direction; 

        this.startGameLoop();
        this.map.startCutscene([
            {type: "textMessage", text: "Hi there!"},
            // {who: "hero", type: "walk", direction: "down"},
            // {who: "hero", type: "walk", direction: "down"},
            // {who: "npcA", type: "walk", direction: "left"},
            // {who: "npcA", type: "walk", direction: "left"},
            // {who: "npcA", type: "stand", direction: "up", time: 800},
        ])
    }
}