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
        this.pState = config.playerState;
        // console.log(this.pState);

        this.talking = [
            // { //Uncomment if we want pot to be 1-time use only.
            //     required: [this.storyFlag],
            //     events: [
            //         {type: "textMessage", text: "You have already gained your last mushroom."},
            //     ]
            // },
            {
                events: [
                    {type: "textMessage", text: "Lets heal some mushrooms..."},
                    {type: "craftingMenu", playerState: this.pState},
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