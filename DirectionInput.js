class DirectionInput {
    constructor() {
        this.heldDirections = [];

        //Map of keycodes we care about, namely the arrow keys and WASD
        this.map = {
            "ArrowUp": "up",
            "KeyW": "up",
            "ArrowDown": "down",
            "KeyS": "down",
            "ArrowLeft": "left",
            "KeyA": "left",
            "ArrowRight": "right",
            "KeyD": "right",
        }
    }

    //Allows external objects/files to ask which direction is held right now
    get direction() {
        return this.heldDirections[0];
    }

    init() {

        //If user hold down a valid key, add to heldDirections
        //We are always looking at the beginning of the arary to know which
        //key is the latest addition pressed by user.
        document.addEventListener("keydown", e =>{
            const dir = this.map[e.code];
            if(dir && this.heldDirections.indexOf(dir) == -1){
                this.heldDirections.unshift(dir);
                // console.log(this.heldDirections);
            }
        });

        //If user release a valid key, remove from heldDirections
        document.addEventListener("keyup", e =>{
            const dir = this.map[e.code];
            const index = this.heldDirections.indexOf(dir);
            if(index > -1){
                this.heldDirections.splice(index, 1);
                // console.log(this.heldDirections);
            }
        });

    }
}