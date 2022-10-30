class CraftingMenu {
    constructor({ playerState, onComplete }) {
        this.playerState = playerState;
        this.onComplete = onComplete;
    }

    getOptions() {
        const lineup = this.playerState.lineup;
        const mushroomObjs = this.playerState.mushrooms;

        return lineup.map(id => {
            const mId = mushroomObjs[id].mushroomId;
            const mObj = Mushroom[mId];
            // console.log(mObj);

            return {
                label: mObj.name,
                description: "Heal " + mObj.name,
                handler: () => {
                    console.log(id);
                    playerState.healMushroom(id);
                    this.close();
                }
            }
        })
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("CraftingMenu");
        this.element.classList.add("overlayMenu");
        this.element.classList.add("DescriptionBox");
        this.element.innerHTML = (`
            <h2>Heal Your Mushrooms</h2>
        `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    init(container) {
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: container
        })
        this.keyboardMenu.init(this.element)
        this.keyboardMenu.setOptions(this.getOptions())

        container.appendChild(this.element);
    }
}