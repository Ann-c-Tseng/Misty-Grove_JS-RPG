class Person extends GameObject {
    constructor(config) {
        //Construct the GameObject as well.
        super(config); 

        //moving progress remaining specific to people movement (1 tile of 16 pixels)
        this.movingProgressRemaining = 0;

        //standing progress
        this.isStanding = false;

        //Distinguish if a person is the user's character or just an NPC
        this.isPlayerControlled = config.isPlayerControlled || false;

        //Map of instructions for how person will move
        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],
        }
    }

    update(state) {
        if(this.movingProgressRemaining > 0){
            this.updatePosition();
        } else {
            //More cases for starting to walk will come here
            

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
            state.map.moveWall(this.x, this.y, this.direction); //set a wall for the future position we will move to
            this.movingProgressRemaining = 16;
            this.updateSprite(state);
        }

        if(behavior.type === "stand") {
            this.isStanding = true;
            setTimeout(() => {
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