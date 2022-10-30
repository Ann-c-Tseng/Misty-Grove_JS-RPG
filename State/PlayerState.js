class PlayerState {
    constructor() {
        this.mushrooms = {
            "m1": {
                mushroomId: "g001",
                hp: 50,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null,
            },
            "m2": {
                mushroomId: "p001",
                hp: 50,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null,
            },
            "m3": {
                mushroomId: "r001",
                hp: 50,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null,
            },
        }
        this.lineup = ["m1", "m2", "m3"];
        this.items = [
            {actionId: "item_recoverHp", instanceId: "item1"},
            {actionId: "item_recoverHp", instanceId: "item2"},
            {actionId: "item_removeStatus", instanceId: "item5"},
            {actionId: "item_removeStatus", instanceId: "item6"},
        ]
        this.storyFlags = {
            // Configured in OverworldMaps.js => E.g. required: ["DEFEATED_BETH"],
        }; 
    }

    healMushroom(mushroomId) {
        console.log("---HEAL MUSHROOM...---");
        const mushroomObj = this.mushrooms[mushroomId];
        if(mushroomObj.hp < mushroomObj.maxHp) {
            mushroomObj.hp = mushroomObj.maxHp;
        }
        console.log("--- Healed ---");
        console.log(this);
        utils.emitEvent("PlayerStateUpdated");
    }

    swapLineup(oldId, incomingId) {
        const oldIndex = this.lineup.indexOf(oldId);
        this.lineup[oldIndex] = incomingId;
        utils.emitEvent("LineupChanged");
        console.log("SWAP LINEUP...");
        console.log(this);
    }

    moveToFront(futureFrontId) {
        this.lineup = this.lineup.filter(id => id !== futureFrontId);
        this.lineup.unshift(futureFrontId); //unshift() adds to front of list
        utils.emitEvent("LineupChanged");
        console.log("MOVE TO FRONT...");
        console.log(this);
    }
}

window.playerState = new PlayerState();