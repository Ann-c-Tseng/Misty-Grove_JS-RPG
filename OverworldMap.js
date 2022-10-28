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
        this.isPaused = false;
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
            const result = await eventHandler.init();
            if(result === "LOST_BATTLE") {
                break;
            }
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
            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })
            
            relevantScenario && this.startCutscene(relevantScenario.events);
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
        id: "IntroRoom",
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
                            {type: "addStoryFlag", flag: "TALKED_TO_GREG"}
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
                        {type: "textMessage", text: "Hey ranger! Did you meet Sheriff Greg yet?", faceHero: "npcB"},
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
        id: "MainStreet",
        upperSrc: "./images/maps/mainstreetUpper.png",
        lowerSrc: "./images/maps/mainstreetLower.png",
        gameObjects: {
            hero: new Person({
                x: utils.withGrid(19),
                y: utils.withGrid(10),
                isPlayerControlled: true
            }),
            npcA: new Person({
                x: utils.withGrid(30),
                y: utils.withGrid(11),
                src: "./images/characters/people/npc3.png",
                behaviorLoop: [
                    {type: "stand", direction: "left", time: 700},
                ],
                talking: [
                    {
                        required: ["DEFEATED_BETH"],
                        events: [
                            {type: "textMessage", text: "You're no weakling, kid!"},
                            {type: "textMessage", text: "Good luck at the Circus! It's up that path..."},
                        ]
                    },
                    {
                        required: ["TALKED_TO_GREG"],
                        events: [
                            {type: "textMessage", text: "I'm Ranger Beth, and I'm here to train you before you head off!", faceHero: "npcA"},
                            {type: "textMessage", text: "I'm gonna throw you into a Mushroom battle now..."},
                            {type: "textMessage", text: "Don't worry, I'll go easy on you!"},
                            {type: "textMessage", text: "So let's see what you're made of!"},
                            {type: "battle", enemyId: "enemy2"},  
                            {type: "addStoryFlag", flag: "DEFEATED_BETH"}, //IF player has won battle, then continue messages below
                            {type: "textMessage", text: "Wow! Not Bad!"},
                            {type: "textMessage", text: "I think you're ready to head off to the circus! Good luck!"},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "You should talk to our sherrif, Greg!", faceHero: "npcA"},
                            {type: "textMessage", text: "He's in the cabin over there..."},
                        ]
                    }
                ]
            }),
            mushroomPot: new MushroomPot({
                x: utils.withGrid(15),
                y: utils.withGrid(12),
                storyFlag: "USED_PLANT_POT",
                mushrooms: ["g002", "r001"],
            })
        },
        walls: {
            //Cabin walls
            [utils.asGridCoord(18, 9)]: true, //Left lower wall
            [utils.asGridCoord(18, 8)]: true, //Left upper wall
            [utils.asGridCoord(20, 9)]: true, //Left lower wall
            [utils.asGridCoord(20, 8)]: true, //Left upper wall

            //Forest trees
            [utils.asGridCoord(4, 6)]: true,
            [utils.asGridCoord(5, 6)]: true,
            [utils.asGridCoord(6, 6)]: true,
            [utils.asGridCoord(7, 6)]: true,
            [utils.asGridCoord(8, 6)]: true,
            [utils.asGridCoord(9, 6)]: true,
            [utils.asGridCoord(10, 6)]: true,
            [utils.asGridCoord(11, 6)]: true,
            [utils.asGridCoord(12, 6)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(14, 6)]: true,
            [utils.asGridCoord(15, 6)]: true,
            [utils.asGridCoord(16, 6)]: true,
            [utils.asGridCoord(17, 6)]: true,
            [utils.asGridCoord(18, 6)]: true,
            [utils.asGridCoord(19, 6)]: true,
            [utils.asGridCoord(20, 6)]: true,
            [utils.asGridCoord(21, 6)]: true,
            [utils.asGridCoord(22, 6)]: true,
            [utils.asGridCoord(23, 6)]: true,
            [utils.asGridCoord(24, 6)]: true,

            [utils.asGridCoord(26, 6)]: true,
            [utils.asGridCoord(27, 6)]: true,
            [utils.asGridCoord(28, 6)]: true,
            [utils.asGridCoord(29, 6)]: true,
            [utils.asGridCoord(30, 6)]: true,
            [utils.asGridCoord(31, 6)]: true,
            [utils.asGridCoord(32, 6)]: true,
            [utils.asGridCoord(33, 6)]: true,

            //Cliff Walls
            [utils.asGridCoord(4, 15)]: true,
            [utils.asGridCoord(5, 15)]: true,
            [utils.asGridCoord(6, 15)]: true,
            [utils.asGridCoord(7, 15)]: true,
            [utils.asGridCoord(8, 15)]: true,
            [utils.asGridCoord(9, 15)]: true,
            [utils.asGridCoord(10, 15)]: true,
            [utils.asGridCoord(11, 15)]: true,
            [utils.asGridCoord(12, 15)]: true,
            [utils.asGridCoord(13, 15)]: true,
            [utils.asGridCoord(14, 15)]: true,
            [utils.asGridCoord(15, 15)]: true,
            [utils.asGridCoord(16, 15)]: true,
            [utils.asGridCoord(17, 15)]: true,
            [utils.asGridCoord(18, 15)]: true,
            [utils.asGridCoord(19, 15)]: true,
            [utils.asGridCoord(20, 15)]: true,
            [utils.asGridCoord(21, 15)]: true,
            [utils.asGridCoord(22, 15)]: true,
            [utils.asGridCoord(23, 15)]: true,
            [utils.asGridCoord(24, 15)]: true,
            [utils.asGridCoord(25, 15)]: true,
            [utils.asGridCoord(26, 15)]: true,
            [utils.asGridCoord(27, 15)]: true,
            [utils.asGridCoord(28, 15)]: true,
            [utils.asGridCoord(29, 15)]: true,
            [utils.asGridCoord(30, 15)]: true,
            [utils.asGridCoord(31, 15)]: true,
            [utils.asGridCoord(32, 15)]: true,
            [utils.asGridCoord(33, 15)]: true,

            //Zone bounding walls
            [utils.asGridCoord(4, 7)]: true,
            [utils.asGridCoord(4, 8)]: true,
            [utils.asGridCoord(4, 9)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(4, 11)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(4, 13)]: true,
            [utils.asGridCoord(4, 14)]: true,
            [utils.asGridCoord(33, 7)]: true,
            [utils.asGridCoord(33, 8)]: true,
            [utils.asGridCoord(33, 9)]: true,
            [utils.asGridCoord(33, 10)]: true,
            [utils.asGridCoord(33, 11)]: true,
            [utils.asGridCoord(33, 12)]: true,
            [utils.asGridCoord(33, 13)]: true,
            [utils.asGridCoord(33, 14)]: true,

            //Flower garden walls
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(6, 11)]: true,
            [utils.asGridCoord(6, 12)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(7, 11)]: true,
            [utils.asGridCoord(7, 12)]: true,

            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(9, 11)]: true,
            [utils.asGridCoord(9, 12)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(10, 11)]: true,
            [utils.asGridCoord(10, 12)]: true,

            [utils.asGridCoord(12, 10)]: true,
            [utils.asGridCoord(12, 11)]: true,
            [utils.asGridCoord(12, 12)]: true,
            [utils.asGridCoord(13, 10)]: true,
            [utils.asGridCoord(13, 11)]: true,
            [utils.asGridCoord(13, 12)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(19,9)]: [
                {
                    events: [
                        {type: "changeMap", map: "IntroRoom"},
                    ]
                }
            ],
            [utils.asGridCoord(25,5)]: [
                {
                    events: [
                        {type: "changeMap", map: "Circus"}
                    ]
                }
            ]
        }
    },
    Circus: {
        id: "Circus",
        upperSrc: "./images/maps/circusUpper.png",
        lowerSrc: "./images/maps/circusLower.png",
        gameObjects: {
            hero: new Person({
                x: utils.withGrid(25),
                y: utils.withGrid(17),
                isPlayerControlled: true
            }),
            npcA: new Person({
                x: utils.withGrid(20),
                y: utils.withGrid(11),
                src: "./images/characters/people/enemyboss.png",
                behaviorLoop: [
                    {type: "stand", direction: "down"},
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Go away I'm busy...", faceHero: "npcA"},
                        ]
                    },
                ]
            })
        },
        walls: {
            //Circus walls
            [utils.asGridCoord(17, 10)]: true, 
            [utils.asGridCoord(17, 9)]: true, 
            [utils.asGridCoord(17, 8)]: true, 
            [utils.asGridCoord(18, 10)]: true, 
            [utils.asGridCoord(18, 9)]: true, 
            [utils.asGridCoord(18, 8)]: true, 
            [utils.asGridCoord(19, 10)]: true, 
            [utils.asGridCoord(19, 9)]: true, 
            [utils.asGridCoord(19, 8)]: true, 
            [utils.asGridCoord(20, 10)]: true, 
            [utils.asGridCoord(20, 9)]: true,
            [utils.asGridCoord(20, 8)]: true, 
            [utils.asGridCoord(21, 10)]: true, 
            [utils.asGridCoord(21, 9)]: true,
            [utils.asGridCoord(21, 8)]: true, 

            //Forest trees
            [utils.asGridCoord(4, 6)]: true,
            [utils.asGridCoord(5, 6)]: true,
            [utils.asGridCoord(6, 6)]: true,
            [utils.asGridCoord(7, 6)]: true,
            [utils.asGridCoord(8, 6)]: true,
            [utils.asGridCoord(9, 6)]: true,
            [utils.asGridCoord(10, 6)]: true,
            [utils.asGridCoord(11, 6)]: true,
            [utils.asGridCoord(12, 6)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(14, 6)]: true,
            [utils.asGridCoord(15, 6)]: true,
            [utils.asGridCoord(16, 6)]: true,
            [utils.asGridCoord(17, 6)]: true,
            [utils.asGridCoord(18, 6)]: true,
            [utils.asGridCoord(19, 6)]: true,
            [utils.asGridCoord(20, 6)]: true,
            [utils.asGridCoord(21, 6)]: true,
            [utils.asGridCoord(22, 6)]: true,
            [utils.asGridCoord(23, 6)]: true,
            [utils.asGridCoord(24, 6)]: true,

            [utils.asGridCoord(26, 6)]: true,
            [utils.asGridCoord(27, 6)]: true,
            [utils.asGridCoord(28, 6)]: true,
            [utils.asGridCoord(29, 6)]: true,
            [utils.asGridCoord(30, 6)]: true,
            [utils.asGridCoord(31, 6)]: true,
            [utils.asGridCoord(32, 6)]: true,
            [utils.asGridCoord(33, 6)]: true,

            //Lower Forest Walls
            [utils.asGridCoord(4, 18)]: true,
            [utils.asGridCoord(5, 18)]: true,
            [utils.asGridCoord(6, 18)]: true,
            [utils.asGridCoord(7, 18)]: true,
            [utils.asGridCoord(8, 18)]: true,
            [utils.asGridCoord(9, 18)]: true,
            [utils.asGridCoord(10, 18)]: true,
            [utils.asGridCoord(11, 18)]: true,
            [utils.asGridCoord(12, 18)]: true,
            [utils.asGridCoord(13, 18)]: true,
            [utils.asGridCoord(14, 18)]: true,
            [utils.asGridCoord(15, 18)]: true,
            [utils.asGridCoord(16, 18)]: true,
            [utils.asGridCoord(17, 18)]: true,
            [utils.asGridCoord(18, 18)]: true,
            [utils.asGridCoord(19, 18)]: true,
            [utils.asGridCoord(20, 18)]: true,
            [utils.asGridCoord(21, 18)]: true,
            [utils.asGridCoord(22, 18)]: true,
            [utils.asGridCoord(23, 18)]: true,
            [utils.asGridCoord(24, 18)]: true,

            [utils.asGridCoord(26, 18)]: true,
            [utils.asGridCoord(27, 18)]: true,
            [utils.asGridCoord(28, 18)]: true,
            [utils.asGridCoord(29, 18)]: true,
            [utils.asGridCoord(30, 18)]: true,
            [utils.asGridCoord(31, 18)]: true,
            [utils.asGridCoord(32, 18)]: true,
            [utils.asGridCoord(33, 18)]: true,

            //Zone bounding walls
            [utils.asGridCoord(4, 7)]: true,
            [utils.asGridCoord(4, 8)]: true,
            [utils.asGridCoord(4, 9)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(4, 11)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(4, 13)]: true,
            [utils.asGridCoord(4, 14)]: true,
            [utils.asGridCoord(4, 15)]: true,
            [utils.asGridCoord(4, 16)]: true,
            [utils.asGridCoord(4, 17)]: true,
            [utils.asGridCoord(4, 18)]: true,
            [utils.asGridCoord(33, 7)]: true,
            [utils.asGridCoord(33, 8)]: true,
            [utils.asGridCoord(33, 9)]: true,
            [utils.asGridCoord(33, 10)]: true,
            [utils.asGridCoord(33, 11)]: true,
            [utils.asGridCoord(33, 12)]: true,
            [utils.asGridCoord(33, 13)]: true,
            [utils.asGridCoord(33, 14)]: true,
            [utils.asGridCoord(33, 15)]: true,
            [utils.asGridCoord(33, 16)]: true,
            [utils.asGridCoord(33, 17)]: true,
            [utils.asGridCoord(33, 18)]: true,

            //Animal space walls
            [utils.asGridCoord(10, 11)]: true,
            [utils.asGridCoord(10, 12)]: true,
            [utils.asGridCoord(10, 13)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(11, 11)]: true,
            [utils.asGridCoord(11, 12)]: true,
            [utils.asGridCoord(11, 13)]: true,
            [utils.asGridCoord(12, 10)]: true,
            [utils.asGridCoord(12, 11)]: true,
            [utils.asGridCoord(12, 13)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(25,18)]: [
                {
                    events: [
                        {type: "changeMap", map: "MainStreet"},
                    ]
                }
            ],
        }
    },
}