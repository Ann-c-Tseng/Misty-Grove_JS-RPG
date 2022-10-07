class RevealingText {
    constructor(config) {
        this.element = config.element;
        this.text = config.text;
        this.speed = config.speed || 70; //default to 70ms per character/letter
        
        this.timeout = null;
        this.isDone = false;
    }

    revealOneCharacter(list) {
        const next = list.splice(0,1)[0];

        next.span.classList.add("revealed");

        if(list.length > 0) {
            this.timeout = setTimeout(() => {
                this.revealOneCharacter(list);
            }, next.delayAfter)
        } else {
            this.isDone = true;
        }
    }

    warpToDone() {
        clearTimeout(this.timeout);
        this.isDone = true;

        //Iterate through all the spans and make sure they are all visible
        this.element.querySelectorAll("span").forEach(s => {
            s.classList.add("revealed");
        })
    }

    init() {
        let characters = [];

        //E.g. takes "abc" and split into characters = ["a", "b", "c"].
        this.text.split("").forEach(character => {
            //Create individual span, and add to element in DOM
            let span = document.createElement("span");
            span.textContent = character;
            // console.log(character);
            this.element.appendChild(span);

            //Add this span to our internal state Array
            characters.push({
                span,
                delayAfter: character === " " ? 0 : this.speed //how long we wanna wait after a character is revealed, to reveal the next one. By default = this.speed, otherwise if character is just " " then immediately go to next char to avoid odd pause times due to empty space.
            })
        })
        this.revealOneCharacter(characters);
    }
}