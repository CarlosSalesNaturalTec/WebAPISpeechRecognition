const botao = document.getElementById("botao");
const areaMensagens = document.getElementById("output");
const voiceSelect = document.querySelector('select');
const pitch = document.querySelector("#pitch");
const rate = document.querySelector("#rate");
var status = "stop";

//#region Reconhecimento de Fala - Speech to Text
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
if (!SpeechRecognition) {
    exibirmensagem("Recurso não disponível neste Browser. Verifique permissões ou utilize outro navegador");
    botao.disabled = true;
}
recognition = new SpeechRecognition();
recognition.continuous = true;      // Reconhecimento contínuo em loop
recognition.interimResults = false; // resultados parciais
recognition.lang = "pt-BR";

recognition.onstart = function (e) {
    exibirmensagem("Reconhecimento de fala INICIADO");
};

recognition.onsoundstart = function (e) {
    exibirmensagem("Som detectado!");
};

recognition.onresult = function (e) {
    console.log('onresult', e);
    var resultIndex = e.resultIndex
    exibirmensagem("Frase detectada: " + e.results[resultIndex][0].transcript);
};

recognition.onspeechend = function (e) {
    exibirmensagem("Speech End");
};

recognition.onerror = function (e) {
    console.log('onError', e);
    exibirmensagem("Erro detectado: " + e.error);
};

recognition.onend = function (e) {
    let mensagem = "Reconhecimento de fala ENCERRADO!";
    exibirmensagem(mensagem);
    falar(mensagem);
};

function startStop() {
    if (status == "stop") {
        recognition.start();
        status = "start";
        botao.innerHTML = "Parar";
    } else {
        recognition.stop();
        status = "stop";
        botao.innerHTML = "Iniciar";
    }
}

function exibirmensagem(mensagem) {
    areaMensagens.innerHTML += mensagem + "</br>";
}

//#endregion

//#region Sintese de Áudio - Texto to Speech
const synth = window.speechSynthesis;
let voices = [];

function populateVoiceList() {
    voices = synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase();
        const bname = b.name.toUpperCase();

        if (aname < bname) {
            return -1;
        } else if (aname == bname) {
            return 0;
        } else {
            return +1;
        }
    });
    const selectedIndex =
        voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = "";

    for (let i = 0; i < voices.length; i++) {
        const option = document.createElement("option");
        option.textContent = `${voices[i].name} (${voices[i].lang})`;

        if (voices[i].default) {
            option.textContent += " -- DEFAULT";
        }

        option.setAttribute("data-lang", voices[i].lang);
        option.setAttribute("data-name", voices[i].name);
        voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function falar(texto) {
    if (synth.speaking) {
        console.error("speechSynthesis.speaking");
        return;
    }

    if (texto !== "") {
        const utterThis = new SpeechSynthesisUtterance(texto);

        utterThis.onend = function (event) {
            console.log("SpeechSynthesisUtterance.onend");
        };

        utterThis.onerror = function (event) {
            console.error("SpeechSynthesisUtterance.onerror");
        };

        const selectedOption = voiceSelect.selectedOptions[0].getAttribute("data-name");

        for (let i = 0; i < voices.length; i++) {
            if (voices[i].name === selectedOption) {
                utterThis.voice = voices[i];
                break;
            }
        }

        utterThis.pitch = pitch.value;
        utterThis.rate = rate.value;
        synth.speak(utterThis);
    }
}

//#endregion
