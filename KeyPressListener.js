class KeyPressListener {
    constructor(keyCode, callback) {
        // console.log("hello from keypresslistener!");
        let keySafe = true;

        this.keydownFunction = function(event) {
            if(event.code == keyCode){
                if(keySafe) {
                    keySafe = false;
                    // console.log("within key down");
                    callback();
                }
            }
        };

        this.keyupFunction = function(event) {
            if(event.code == keyCode) {
                // console.log("within key up");
                keySafe = true;
            }
        };

        document.addEventListener("keydown", this.keydownFunction);
        document.addEventListener("keyup", this.keyupFunction);
    }


    //Remove event listeners after event is complete
    unbind() {
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
    }
}