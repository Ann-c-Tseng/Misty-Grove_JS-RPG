window.MushroomTypes = {
    green: "green",
    purple: "purple",
    red: "red",
}

window.Mushroom = {
    "g001": {
        name: "Gamba mushroom",
        description: "Green mushroom",
        type: MushroomTypes.green,
        src: "./images/characters/mushrooms/g001.png",
        icon: "./images/icons/greenicon.png",
        actions: [ "clumsyStatus", "growthStatus", "damage1" ],
    },
    "g002": {
        name: "Ganoderma mushroom",
        description: "Green mushroom",
        type: MushroomTypes.green,
        src: "./images/characters/mushrooms/g002.png",
        icon: "./images/icons/greenicon.png",
        actions: [ "clumsyStatus", "growthStatus", "damage1" ],
    },
    "p001": {
        name: "Portabello mushroom",
        description: "Purple mushroom",
        type: MushroomTypes.purple,
        src: "./images/characters/mushrooms/p001.png",
        icon: "./images/icons/purpleicon.png",
        actions: ["damage1"],
    },
    "r001": {
        name: "Russula mushroom",
        description: "Red mushroom",
        type: MushroomTypes.red,
        src: "./images/characters/mushrooms/r001.png",
        icon: "./images/icons/redicon.png",
        actions: [ "damage1" ],
    },
}