class Person extends GameObject {
    constructor(config) {
        //Construct the GameObject as well.
        super(config); 

        //moving progress remaining specific to people movement (1 tile of 16 pixels)
        this.movingProgressRemaining = 0;

        //standing progress
        this.isStanding = false;
        this.intentPosition = null; //or [x,y]

        //Distinguish if a person is the user's character or just an NPC
        this.isPlayerControlled = config.isPlayerControlled || false;

        //Map of instructions for how person will move
        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],
        }
        this.standBehaviorTimeout;
    }

    update(state) {
        if(this.movingProgressRemaining > 0){
            this.updatePosition();
        } else {
            //Case: We can walk if no cutscene is currently happening, we're keyboard ready, and have an arrow pressed
            if(!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow){
                this.startBehavior(state,  {
                    type: "walk",
                    direction: state.arrow
                })
            }
            this.updateSprite(state);
        }
    }

    startBehavior(state, behavior) {
        if(!this.isMounted) {
            return;
        }

        //Set character direction to whatever behavior specified.
        this.direction = behavior.direction;
        if(behavior.type === "walk") {
            //Stop if space is not free
            if(state.map.isSpaceTaken(this.x, this.y, this.direction)) {
                //if retry flag is true, set time out and retry
                behavior.retry && setTimeout(() => {
                    this.startBehavior(state, behavior)
                }, 10)
                return;
            }
            //Otherwise ready to walk
            this.movingProgressRemaining = 16;
            //Add next position intent
            const intentPosition = utils.nextPosition(this.x, this.y, this.direction)
            this.intentPosition = [
                intentPosition.x,
                intentPosition.y,
            ]
            this.updateSprite(state);
        }

        if(behavior.type === "stand") {
            this.isStanding = true;

            if(this.standBehaviorTimeout){
                clearTimeout(this.standBehaviorTimeout);
                console.log("CLEAR TIMEOUT for STAND");
            }
            this.standBehaviorTimeout = setTimeout(() => {
                utils.emitEvent("PersonStandComplete", {
                    whoId: this.id
                })
                this.isStanding = false;
            }, behavior.time)
        }
    }

    updatePosition() {
        //array deconstruction
        const [property, change] = this.directionUpdate[this.direction] //this.direction set in GameObject.js
        this[property] += change;
        this.movingProgressRemaining -= 1;

        if(this.movingProgressRemaining === 0) {
            //We finished the walk!
            this.intentPosition = null;
            utils.emitEvent("PersonWalkingComplete", {
                whoId: this.id
            })
        }
    }

    updateSprite() {
        //If we still have moving progress, thereby use walking animation:
        if(this.movingProgressRemaining > 0) {
            this.sprite.setAnimation("walk-"+this.direction);
            return;
        }
        this.sprite.setAnimation("idle-"+this.direction); //otherwise fire off idle image
    }
}