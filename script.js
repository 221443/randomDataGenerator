var charset = "0123456789";//abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
const pocetPozic = 8; //kolik chci vygenerovat cisel
const pocetGenraci = 25000;

var pocetKombinaci = charset.length ** pocetPozic

function generate_Number(){
    var text = '';
    for (var i = 0; i < pocetPozic; i++) text += charset.charAt(Math.floor(Math.random() * charset.length));
    return "UA"+text; // zde dej prefix nebo sufix
}

// some repeats to see more results 

    var pNode = document.createElement("p");
for(var i = 0; i < pocetGenraci; i++){
    var text = generate_Number();
    var pText = document.createTextNode(text);
    pNode.appendChild(pText);
    var br = document.createElement("br");
    pNode.appendChild(br)
    console.log (text);
}
document.getElementById("data").appendChild(pNode);


// duplicate probability
function mezivypocet(kombinaci, pokusu){
    var number = 1;
    for (i = 1; i < pokusu; i++){
        number = number*((kombinaci-i)/kombinaci);
    }
    return (1-number)*100;
}
var probText="Pravdepodobnost duplicity je: "+ mezivypocet(pocetKombinaci, pocetGenraci)+"%";
console.log(probText);
var probability = document.createTextNode(probText);
document.getElementById("probability").appendChild(probability);
/*function mezivypocet(){
    var number = 1;
    for (i = 1; i <= pocetPozic; i++){
        number = number*(pocetKombinaci-i);
    }
    return number;
}
var probabilityOfDuplicate=(1-(1/pocetKombinaci)**pocetPozic*mezivypocet)*100;
console.log("Pravdepodobnost duplicity je: "+probabilityOfDuplicate);*/