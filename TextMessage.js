class TextMessage {
    constructor({ text, onComplete }) {
      this.text = text;
      this.onComplete = onComplete;
      this.element = null;
    }
  
    createElement() {
      //Create the element
      this.element = document.createElement("div");
      this.element.classList.add("TextMessage");
  
      this.element.innerHTML = (`
        <p class="TextMessage_p"></p>
        <button class="TextMessage_button">Next</button>
      `)

      //The typewriter effect
      this.revealingText = new RevealingText({
        element: this.element.querySelector(".TextMessage_p"),
        text: this.text
      })

      this.element.querySelector("button").addEventListener("click", () => {
        //close the text message when next button is clicked
        this.done();
      });

      console.log("hello from text message!!");
      this.actionListener = new KeyPressListener("Enter", () => {
        // console.log("Enter key pressed!");

        //close the text message when enter/return key is hit
        this.done();
      })
    }

    done() {
      //Check revealingText and see if that is done,
      //If not done then warpToDone
      if(this.revealingText.isDone) {
        this.element.remove();
        //remember to unbind action listener to 
        //no longer listen to the enter key since dialogue is over now.
        this.actionListener.unbind();
        this.onComplete(); //onComplete call back resolve event and resume non-dialogue actions
      } else {
        this.revealingText.warpToDone();
      }
    }
  
    init(container) {
      this.createElement();
      container.appendChild(this.element);
      this.revealingText.init();
    }
}