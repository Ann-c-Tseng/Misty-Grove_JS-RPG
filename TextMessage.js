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
        <p class="TextMessage_p">${this.text}</p>
        <button class="TextMessage_button">Next</button>
      `)

      this.element.querySelector("button").addEventListener("click", () => {
        //close the text message when next button is clicked
        this.done();
      });

      console.log("hello from text message!!");
      this.actionListener = new KeyPressListener("Enter", () => {
        // console.log("Enter key pressed!");

        //remember to unbind action listener to 
        //no longer listen to the enter key since dialogue is over now.
        this.actionListener.unbind();

        //close the text message when enter/return key is hit
        this.done();
      })
    }

    done() {
      this.element.remove();
      this.onComplete(); //onComplete call back resolve event and resume non-dialogue actions
    }
  
    init(container) {
      this.createElement();
      container.appendChild(this.element)
    }
}