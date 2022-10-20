window.Actions = {
    damage1: {
        name: "Bash",
        description: "Bash into opponent",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            {type: "animation", animation: "spin"},
            {type: "stateChange", damage: 10}
        ]
    },
    growthStatus: {
        name: "Growth Spurt",
        description: "Gives a little hp boost",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            {type: "stateChange", status: {type: "growth", expiresIn: 3}}
        ]
    },
    clumsyStatus: {
        name: "Spore Blast",
        description: "Makes opponent clumsy & a chance to blind them",
        success: [
            {type: "textMessage", text: "{CASTER} uses {ACTION}!"},
            {type: "animation", animation: "glob", color: "#453214"},
            {type: "stateChange", status: {type: "clumsy", expiresIn: 2}},
        ]
    },
    //ITEMS
    item_removeStatus: {
        name: "Forest Lamp",
        description: "Feeling warm and cozy, removes status",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} uses a {ACTION}!"},
            {type: "stateChange", status: null},
            {type: "textMessage", text: "Feeling warm and cozy!"},
        ]
    },
    item_recoverHp: {
        name: "Fertilizer",
        description: "Feeling strong and healthy, adds Hp",
        targetType: "friendly",
        success: [
            {type: "textMessage", text: "{CASTER} uses some {ACTION}!"},
            {type: "stateChange", recover:10},
            {type: "textMessage", text: "{CASTER} recovered some Hp"},
        ]
    },
}