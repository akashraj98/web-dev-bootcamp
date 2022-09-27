const dynamicContent = document.getElementById("dynamic-text");

const phrases = ["Software Developer...","Learner...","Human Being..."];
let phraseIndex = 0;
let letterindex = 0;
const typingSpeed = 100;
const erasingSpeed = 300;

function printLetters(phrase){
    if (letterindex == phrase.length){
        clearLetter();
    }
    else if (letterindex < phrase.length){
        dynamicContent.textContent += phrase.charAt(letterindex)
        letterindex+=1
        setTimeout
        setTimeout(function (){
            printLetters(phrase) 
        },typingSpeed)
    }
}
function clearLetter(){
    if (letterindex == -1){
        phraseIndex = (phraseIndex +1) % phrases.length;
        letterindex = 0;
        printLetters(phrases[phraseIndex]);

    }
    else if (letterindex > -1){
        let updatedPhrase = "";
        for (index = 0; index < letterindex; index++){
            updatedPhrase+=phrases[phraseIndex].charAt(index);
        }
        dynamicContent.textContent = updatedPhrase;
        letterindex -=1;
        setTimeout(clearLetter,erasingSpeed); //difference between setInterval and set timeout

    }

}
printLetters(phrases[phraseIndex])