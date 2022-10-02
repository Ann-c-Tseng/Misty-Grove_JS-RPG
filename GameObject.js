class GameObject {
    constructor(config) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || "down";
        this.sprite = new Sprite({
            gameObject: this, 
            src: config.src || "./images/characters/people/hero.png", //default to hero.png if we don't provide src
        });

        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;
    }

    mount(map) {
        // console.log("mounting!");
        this.isMounted = true;
        map.addWall(this.x, this.y);

        //If we have a behavior, kick off after a short delay
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }

    update() {

    }

    async doBehaviorEvent(map) {
        
        //Don't do anything if there is a more important cutscene,
        //or we have a behavior loop that is empty (do nothing),
        //or the player is standing
        if(map.isCutscenePlaying || this.behaviorLoop.length == 0 || this.isStanding) {
            return;
        }


        //Setting up our event with relevant info
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;

        //Ceate an event instance out of our next event config
        const eventHandler = new OverworldEvent({map, event: eventConfig});
        
        await eventHandler.init();

        //Setting the next event to fire
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }

        //Do behavior again
        this.doBehaviorEvent(map);
    }
}