class MushroomPot extends GameObject {
    constructor(config) {
        super(config);
        this.sprite = new Sprite({
            gameObject: this,
            src: "./images/characters/mushroom-pot.png",
            animations: {
                "used-down": [[0,0]],
                "unused-down": [[1,0]],
            },
            currentAnimation: "used-down"
        });
        this.storyFlag = config.storyFlag;
        this.mushrooms = config.mushrooms;

        this.talking = [
            // { //Uncomment if we want pot to be 1-time use only.
            //     required: [this.storyFlag],
            //     events: [
            //         {type: "textMessage", text: "You have already gained your last mushroom."},
            //     ]
            // },
            {
                events: [
                    {type: "textMessage", text: "Approaching the Plant Pot! Lets get some mushrooms..."},
                    {type: "craftingMenu", mushrooms: this.mushrooms},
                    {type: "addStoryFlag", flag: this.storyFlag},
                ]
            }
        ]
    }

    update() {
        this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
        ? "used-down"
        : "unused-down"
    }
}