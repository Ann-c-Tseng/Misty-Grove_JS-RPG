window.MushroomTypes = {
    green: "green",
    purple: "purple",
    red: "red",
}

window.Mushroom = {
    "g001": {
        name: "Gamba mushroom",
        description: "a green mushroom",
        type: MushroomTypes.green,
        src: "./images/characters/mushrooms/g001.png",
        icon: "./images/icons/greenicon.png",
        actions: ["damage1", "growthStatus"],
    },
    "g002": {
        name: "Ganoderma mushroom",
        description: "A green mushroom",
        type: MushroomTypes.green,
        src: "./images/characters/mushrooms/g002.png",
        icon: "./images/icons/greenicon.png",
        actions: ["damage1", "growthStatus"],
    },
    "p001": {
        name: "Portabello mushroom",
        description: "A purple mushroom",
        type: MushroomTypes.purple,
        src: "./images/characters/mushrooms/p001.png",
        icon: "./images/icons/purpleicon.png",
        actions: ["damage1"],
    },
    "r001": {
        name: "Russula mushroom",
        description: "A red mushroom",
        type: MushroomTypes.red,
        src: "./images/characters/mushrooms/r001.png",
        icon: "./images/icons/redicon.png",
        actions: ["damage1", "clumsyStatus"],
    },
}