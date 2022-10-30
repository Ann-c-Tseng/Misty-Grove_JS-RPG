class Hud {
    constructor() {
        this.scoreboards = [];
    }

    update() {
        //iterate and update each scoreboard
        this.scoreboards.forEach(s => {
            s.update(window.playerState.mushrooms[s.id])
        })
    }
    
    createElement() {
        if(this.element) {
            this.element.remove(); //Remove any old elements remaining
            this.scoreboards = [];
        }

        this.element = document.createElement("div");
        this.element.classList.add("Hud");

        const {playerState} = window;
        playerState.lineup.forEach(key => {
            const mushroom = playerState.mushrooms[key];
            const scoreboard = new Combatant({
                id: key,
                ...Mushroom[mushroom.mushroomId],
                ...mushroom,
            }, null)
            scoreboard.createElement();
            // console.log(scoreboard);
            this.scoreboards.push(scoreboard);
            this.element.appendChild(scoreboard.hudElement);
        })
        this.update();
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);

        document.addEventListener("PlayerStateUpdated", () => {
            this.update();
        })

        document.addEventListener("LineupChanged", () => {
            this.createElement();
            console.log("IN HUD, LineupChanged");
            container.appendChild(this.element);
        })
    }
}