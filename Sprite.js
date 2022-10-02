class Sprite {
    constructor(config) {
        //Set up the Sprite image
        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
            this.isLoaded = true; //make sure image is loaded before we draw it to the screen
        }

        //Shadow
        this.shadow = new Image();
        this.useShadow = true; //config.useShadow || false
        if(this.useShadow){
            this.shadow.src = "./images/characters/shadow.png";
        }
        this.shadow.onload = () => {
            this.isShadowLoaded = true;
        }

        //Configuring Animation & Initial State
        this.animations = config.animations || {
            "idle-down": [[0, 0]],
            "idle-right": [[0, 1]],
            "idle-up": [[0, 2]],
            "idle-left": [[0, 3]],
            "walk-down": [ [1, 0], [0, 0], [3, 0], [0, 0]],
            "walk-right": [ [1, 1], [0, 1], [3, 1], [0, 1]],
            "walk-up": [ [1, 2], [0, 2], [3, 2], [0, 2]],
            "walk-left": [ [1, 3], [0, 3], [3, 3], [0, 3]],
        }
        this.currentAnimation = config.currentAnimation || "idle-down";
        this.currentAnimationFrame = 0;

        this.animationFrameLimit = config.animationFrameLimit || 8; //number of frames must pass before we move onto the next sprite sheet cut
        this.animationFrameProgress = this.animationFrameLimit;
        
        //Reference the game object.
        //The gameObject essential creates a sprite, which the sprite then references to get the x y coordinates of the sprite.
        this.gameObject = config.gameObject;
    }

    setAnimation(key) {
        if(this.currentAnimation !== key){
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.currentAnimationFrameProgress = this.animationFrameLimit;
        }
    }

    get frame() {
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    //Method to update animation everytime we draw.
    updateAnimationProgress() {
        //Downtick frame progress that is currently happening
        if(this.animationFrameProgress > 0){
            this.animationFrameProgress -= 1;
            return;
        }

        //Reset the counter (16 by default)
        this.animationFrameProgress = this.animationFrameLimit;

        //Uptick the frame index we are on so that we move to the next frame
        this.currentAnimationFrame += 1;

        //If the new value is beyond the animation array size, restart the counter back to 0.
        if(this.frame === undefined) {
            this.currentAnimationFrame = 0;
        }
    }

    draw(ctx, cameraPerson) {
        const x = this.gameObject.x - 8 + utils.withGrid(10.5) - cameraPerson.x;
        const y = this.gameObject.y - 18 + utils.withGrid(6) - cameraPerson.y;

        this.isShadowLoaded && ctx.drawImage(this.shadow, x, y)

        const [frameX, frameY] = this.frame;

        this.isLoaded && ctx.drawImage( //make sure image is loaded, and then draw it
            this.image,
            frameX * 32, frameY * 32, //left and right cut of the sprite sheet
            32, 32, //size (length and width) of the cut
            x, y, //position of the sprite on canvas
            32, 32 //size at which sprite should be drawn (stretch or squish horizontally or vertically, in our case we just keep it as 32 by 32)
        )

        this.updateAnimationProgress();
    }
}