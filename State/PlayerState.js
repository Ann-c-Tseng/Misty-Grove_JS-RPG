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
    }
}

window.playerState = new PlayerState();