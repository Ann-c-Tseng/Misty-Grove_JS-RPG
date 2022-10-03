class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.gameObjects = config.gameObjects;
        this.cutsceneSpaces = config.cutsceneSpaces || {};

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

    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x}, ${object.y}` === `${nextCoords.x}, ${nextCoords.y}`
        });
        //Check first if we don't have another cutscene playing already.
        //If not, & we match with a defined object (e.g. Person), and
        //the person has an action/talking list that is not empty, start action cutscene.
        if (!this.isCutscenePlaying && match && match.talking.length){
            this.startCutscene(match.talking[0].events);
        }
        // console.log({match});
    }

    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
        //Check first if we don't have another cutscene playing already.
        //If not, & we match with the grid square coordinate,
        //start the footstep triggered cutscene.
        if(!this.isCutscenePlaying && match) {
            this.startCutscene(match[0].events);
        }
        // console.log({match});
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
                    {type: "stand", direction: "down", time: 800},
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Hi there, welcome to Misty Grove!", faceHero: "npcA"},
                            {type: "textMessage", text: "My name is Greg and I'm the sheriff in these parts. You must be the new ranger in town..."},
                            {type: "textMessage", text: "Misty Grove is special, we have a lot of magical critters that we are tasked to protect."},
                            {type: "textMessage", text: "However, lately there has been a terrible incident..."},
                            {type: "textMessage", text: "Maximus the Circus Master has captured all our Misty Critters!"},
                            {type: "textMessage", text: "Recruit, I am tasking you to handle this situation and bring the critters home!"},  
                        ]
                    },
                ]
            }),
            npcB: new Person({
                x: utils.withGrid(8),
                y: utils.withGrid(5),
                src: "./images/characters/people/npc2.png",
                behaviorLoop: [
                    {type: "stand", direction: "down"},
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Hello, I'm Rosa. I'm a ranger here in Misty Grove.", faceHero: "npcB"},
                            {type: "textMessage", text: "Are you the new recruit? You should talk to Greg over there to get your task."},
                            {who: "hero", type: "stand", direction: "down", time: 400},
                            {type: "textMessage", text: "Yep! That's the guy down there!"},
                        ]
                    },
                ]
            })
        },
        walls: {
            //Grid number within room that has a wall. I.e. (col, row)
            [utils.asGridCoord(7, 6)]: true, 
            [utils.asGridCoord(8, 6)]: true,
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(8, 7)]: true,

            [utils.asGridCoord(1, 3)]: true, 
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 3)]: true, 
            [utils.asGridCoord(4, 3)]: true, 
            [utils.asGridCoord(5, 3)]: true, 
            [utils.asGridCoord(6, 4)]: true, 
            [utils.asGridCoord(7, 4)]: true, 
            [utils.asGridCoord(8, 4)]: true, 
            [utils.asGridCoord(9, 3)]: true, 
            [utils.asGridCoord(10, 3)]: true, 

            //left wall of room
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 9)]: true,

            //right wall of room
            [utils.asGridCoord(11, 4)]: true,
            [utils.asGridCoord(11, 5)]: true,
            [utils.asGridCoord(11, 6)]: true,
            [utils.asGridCoord(11, 7)]: true,
            [utils.asGridCoord(11, 8)]: true,
            [utils.asGridCoord(11, 9)]: true,

            //bottom wall/exit-side of room
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(5, 11)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(10, 10)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(6,5)]: [
                {
                    events: [
                        {who: "npcB", type: "stand", direction: "left"},
                        {type: "textMessage", text: "Hey ranger! Meet Sheriff Greg down there!"},
                        {who: "hero", type: "walk", direction: "left"},
                        {who: "hero", type: "walk", direction: "down"},
                    ]
                }
            ],
            [utils.asGridCoord(5,10)]: [
                {
                    events: [
                        {type: "changeMap", map: "MainStreet"}
                    ]
                }
            ]
        }
    },
    MainStreet: {
        upperSrc: "./images/maps/mainstreetUpper.png",
        lowerSrc: "./images/maps/mainstreetLower.png",
        gameObjects: {
            hero: new Person({
                x: utils.withGrid(5),
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
        },
        walls: {
            //Todo: set up barriers for main street
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5,9)]: [
                {
                    events: [
                        {type: "changeMap", map: "IntroRoom"},
                    ]
                }
            ]
        }
    },
}