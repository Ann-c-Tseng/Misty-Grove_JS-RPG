class PlayerState {
    constructor() {
        this.mushrooms = {
            "m1": {
                mushroomId: "g001",
                hp: 30,
                maxHp: 50,
                xp: 75,
                maxXp: 100,
                level: 1,
                status: {type: "growth"},
            },
            "m2": {
                mushroomId: "p001",
                hp: 50,
                maxHp: 50,
                xp: 75,
                maxXp: 100,
                level: 1,
                status: null,
            },
            "m3": {
                mushroomId: "r001",
                hp: 50,
                maxHp: 50,
                xp: 75,
                maxXp: 100,
                level: 1,
                status: null,
            },
        }
        this.lineup = ["m1", "m2"];
        this.items = [
            {actionId: "item_recoverHp", instanceId: "item1"},
            {actionId: "item_recoverHp", instanceId: "item2"},
            {actionId: "item_recoverHp", instanceId: "item3"},
            {actionId: "item_recoverHp", instanceId: "item4"},
            {actionId: "item_removeStatus", instanceId: "item5"},
            {actionId: "item_removeStatus", instanceId: "item6"},
        ]
        this.storyFlags = {
            // Configured in OverworldMaps.js => E.g. required: ["DEFEATED_BETH"],
        };
    }

    addMushroom(mushroomId) {
        const newId = `p${Date.now()}` + Math.floor(Math.random() * 9999999);
        this.mushrooms[newId] = {
            mushroomId,
            hp: 50,
            maxHp: 50,
            xp: 0,
            maxXp: 100,
            level: 1,
            status: null,
        }
        if(this.lineup.length < 7) { //7 as the MAX mushroom lineup number for now
            this.lineup.push(newId)
        }
        utils.emitEvent("LineupChanged");
        console.log(this)
    }

    swapLineup(oldId, incomingId) {
        const oldIndex = this.lineup.indexOf(oldId);
        this.lineup[oldIndex] = incomingId;
        utils.emitEvent("LineupChanged");
    }

    moveToFront(futureFrontId) {
        this.lineup = this.lineup.filter(id => id !== futureFrontId);
        this.lineup.unshift(futureFrontId); //unshift() adds to front of list
        utils.emitEvent("LineupChanged");
    }
}

window.playerState = new PlayerState();