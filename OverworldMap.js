class OverworldMap {
    constructor(config) {
        this.gameObjects = config.gameObjects;
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = false;
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(this.lowerImage, 
            utils.withGrid(10.5) - cameraPerson.x, 
            utils.withGrid(6) - cameraPerson.y
            );
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(this.upperImage, 
            utils.withGrid(10.5) - cameraPerson.x, 
            utils.withGrid(6) - cameraPerson.y
            );
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x, y} = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {
            let object = this.gameObjects[key];
            object.id = key;
            //TODO: determine if this object should actually 
            //mount (e.g. if player pick up a key, next time 
            //when map is rendered the key should not be mounted 
            //anymore)
            object.mount(this);            
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;
        
        //Start a loop of async events
        //await each one
        for(let i=0; i<events.length; i++){
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })
            await eventHandler.init();
        }

        this.isCutscenePlaying = false;

        //Reset NPCs to do their idle behavior after cutscene is finished!
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
    }

    addWall(x, y) {
        this.walls[`${x},${y}`] = true;
    }

    removeWall(x, y) {
        delete this.walls[`${x},${y}`];
    }

    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY); //remove the wall
        const {x,y} = utils.nextPosition(wasX, wasY, direction); //get the enw position's coordinates
        this.addWall(x,y); //add the new wall
    }
}

//Object of all of the maps in our game.
window.OverworldMaps = {
    IntroRoom: {
        upperSrc: "./images/maps/introroomUpper.png",
        lowerSrc: "./images/maps/introroomLower.png",
        gameObjects: {
            hero: new Person({
                x: utils.withGrid(5),
                y: utils.withGrid(6),
                isPlayerControlled: true
            }),
            npcA: new Person({
                x: utils.withGrid(7), 
                y: utils.withGrid(9),
                src: "./images/characters/people/npc1.png",
                behaviorLoop: [
                    {type: "stand", direction: "left", time: 800},
                    {type: "stand", direction: "up", time: 800},
                    {type: "stand", direction: "right", time: 1200},
                    {type: "stand", direction: "up", time: 300},
                ]
            }),
            npcB: new Person({
                x: utils.withGrid(3),
                y: utils.withGrid(7),
                src: "./images/characters/people/npc2.png",
                behaviorLoop: [
                    {type: "walk", direction: "left"},
                    {type: "stand", direction: "up", time: 800},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "down"},
                ]
            })
        },
        walls: {
            //Dynamic key, e.g. evaluate to "16, 16": true
            [utils.asGridCoord(7, 6)]: true, 
            [utils.asGridCoord(8, 6)]: true,
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(8, 7)]: true,

            [utils.asGridCoord(1, 3)]: true, 
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 4)]: true, 
            [utils.asGridCoord(4, 4)]: true, 
            [utils.asGridCoord(5, 3)]: true, 
            [utils.asGridCoord(6, 3)]: true, 
            [utils.asGridCoord(6, 4)]: true, 
            [utils.asGridCoord(8, 3)]: true, 
            [utils.asGridCoord(8, 4)]: true, 
            [utils.asGridCoord(9, 3)]: true, 
            [utils.asGridCoord(10, 3)]: true, 
        }
    },
    MainStreet: {
        upperSrc: "./images/maps/mainstreetUpper.png",
        lowerSrc: "./images/maps/mainstreetLower.png",
        gameObjects: {
            hero: new Person({
                x: utils.withGrid(15),
                y: utils.withGrid(10),
                isPlayerControlled: true
            }),
            npcA: new Person({
                x: utils.withGrid(16), 
                y: utils.withGrid(9),
                src: "./images/characters/people/npc2.png",
                behaviorLoop: [
                    {type: "stand", direction: "right", time: 800},
                    {type: "stand", direction: "down", time: 1200},
                ]
            }),
            npcB: new Person({
                x: utils.withGrid(17),
                y: utils.withGrid(10),
                src: "./images/characters/people/npc3.png",
                behaviorLoop: [
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "down"},
                ]
            })
        }
    },
}