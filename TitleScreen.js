class TitleScreen{
    constructor({ progress }) {
        this.progress = progress;
    }

    getOptions(resolve) {
        const safeFile = this.progress.getSaveFile();
        return [
            {
                label: "Begin",
                description: "Misty Grove: Start an adventure!",
                handler: () => {
                    this.close();
                    resolve();
                }
            },
            //Continue option here...
            safeFile ? {
                label: "Continue Game",
                description: "Resume the adventure",
                handler: () => {
                    this.close();
                    resolve(safeFile);
                } 
            } : null
        ].filter(v => v);
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");
        this.element.innerHTML = (`
            <img class="TitleScreen_logo" src="./images/characters/mushrooms/p001.png" alt="Misty Grove" />
        `)
    }

    close() {
        this.keyboardMenu.end();
        this.element.remove();
    }

    init(container) {
        return new Promise(resolve => {
            this.createElement();
            container.appendChild(this.element);
            this.keyboardMenu = new KeyboardMenu();
            this.keyboardMenu.init(this.element);
            this.keyboardMenu.setOptions(this.getOptions(resolve));
        })
    }
}