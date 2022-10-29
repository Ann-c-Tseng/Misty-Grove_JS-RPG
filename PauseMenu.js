class PauseMenu {
    constructor({progress, onComplete}) {
        this.progress = progress;
        this.onComplete = onComplete;
    }

    getOptions(pageKey) {
        //Base case: Show the first [age of options
        if(pageKey === "root"){
            /*All mushrooms for us*/
            const lineupMushrooms = playerState.lineup.map(id => {
                const {mushroomId} = playerState.mushrooms[id];
                const base = Mushroom[mushroomId];
                return {
                    label: base.name,
                    description: base.description,
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getOptions(id))
                    }
                }
            })
            return [
                ...lineupMushrooms,
                // {
                //     label: "Save",
                //     description: "Save your progress",
                //     handler: () => {
                //         this.progress.save();
                //         this.close();
                //     }
                // },
                {
                    label: "Close",
                    description: "Close menu",
                    handler: () => {
                        this.close();
                    }
                }
            ]
        } 
        //Case 2: Show options for just 1 mushroom (using id)
        const unequipped = Object.keys(playerState.mushrooms).filter(id => {
            return playerState.lineup.indexOf(id) === -1;
        }).map(id =>{
            const {mushroomId} = playerState.mushrooms[id];
            const base = Mushroom[mushroomId];
            return {
                label: `Swap for ${base.name}`,
                description: base.description,
                handler: () => {
                    playerState.swapLineup(pageKey, id)
                    this.keyboardMenu.setOptions(this.getOptions("root"));
                }
            }
        })
        return[
            //Swap for any unequipped mushroom...
            ...unequipped,
            {
                label: "Move to front of line",
                description: "Move this mushroom to the front of the line",
                handler: () => {
                    playerState.moveToFront(pageKey);
                    this.keyboardMenu.setOptions(this.getOptions("root"));
                }
            },
            {
                label: "Back",
                description: "Back to root menu",
                handler: () => {
                    this.keyboardMenu.setOptions(this.getOptions("root"));
                }
            }
        ];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
            <h2>Mushroom Lineup - Pause Menu</h2>
        `)
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.onComplete();
    }

    async init(container){
        this.createElement();
        this.keyboardMenu = new KeyboardMenu({
            discriptionContainer: container
        })
        console.log(this.keyboardMenu);
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

        utils.wait(200);
        this.esc = new KeyPressListener("Escape", () => {
            this.close();
        })
    }
}