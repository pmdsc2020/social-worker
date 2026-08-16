(function () {
  "use strict";

  const grid = document.getElementById("grid");
  const searchInput = document.getElementById("search");
  const resultCount = document.getElementById("result-count");
  const speakAllBtn = document.getElementById("speak-all");
  const stopAllBtn = document.getElementById("stop-all");
  const rateInput = document.getElementById("rate");
  const pitchInput = document.getElementById("pitch");
  const rateVal = document.getElementById("rate-val");
  const pitchVal = document.getElementById("pitch-val");
  const supportWarning = document.getElementById("support-warning");

  const synthSupported = "speechSynthesis" in window;
  if (!synthSupported) {
    supportWarning.hidden = false;
    speakAllBtn.disabled = true;
    stopAllBtn.disabled = true;
  }

  let speakAllActive = false;
  let currentCard = null;

  function normalize(str) {
    return str.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  }

  function matchesQuery(lang, query) {
    if (!query) return true;
    const q = normalize(query);
    return (
      normalize(lang.name).includes(q) ||
      normalize(lang.native).includes(q) ||
      normalize(lang.greeting).includes(q) ||
      normalize(lang.code).includes(q)
    );
  }

  function speak(lang, card) {
    if (!synthSupported) return Promise.resolve();
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lang.greeting);
      utterance.lang = lang.code;
      utterance.rate = parseFloat(rateInput.value);
      utterance.pitch = parseFloat(pitchInput.value);

      const voices = window.speechSynthesis.getVoices();
      const exactVoice = voices.find((v) => v.lang === lang.code);
      const looseVoice = voices.find(
        (v) => v.lang.split("-")[0] === lang.code.split("-")[0]
      );
      if (exactVoice) utterance.voice = exactVoice;
      else if (looseVoice) utterance.voice = looseVoice;

      if (card) {
        if (currentCard) currentCard.classList.remove("speaking");
        card.classList.add("speaking");
        currentCard = card;
      }

      utterance.onend = () => {
        if (card) card.classList.remove("speaking");
        resolve();
      };
      utterance.onerror = () => {
        if (card) card.classList.remove("speaking");
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  function buildCard(lang) {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.setAttribute(
      "aria-label",
      `Speak "${lang.greeting}" (${lang.name})`
    );

    const top = document.createElement("div");
    top.className = "card-top";

    const flag = document.createElement("span");
    flag.className = "flag";
    flag.setAttribute("aria-hidden", "true");
    flag.textContent = lang.flag;

    const speakerIcon = document.createElement("span");
    speakerIcon.className = "speaker-icon";
    speakerIcon.setAttribute("aria-hidden", "true");
    speakerIcon.textContent = "🔊";

    top.appendChild(flag);
    top.appendChild(speakerIcon);

    const greeting = document.createElement("div");
    greeting.className = "greeting";
    greeting.lang = lang.code;
    greeting.textContent = lang.greeting;

    const name = document.createElement("div");
    name.className = "lang-name";
    name.innerHTML = `<span class="native">${lang.native}</span> · ${lang.name}`;

    card.appendChild(top);
    card.appendChild(greeting);
    card.appendChild(name);

    card.addEventListener("click", () => {
      speakAllActive = false;
      speak(lang, card);
    });

    return card;
  }

  function render(query) {
    grid.innerHTML = "";
    const filtered = LANGUAGES.filter((lang) => matchesQuery(lang, query));

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.className = "no-results";
      empty.textContent = `No languages match "${query}".`;
      grid.appendChild(empty);
    } else {
      const fragment = document.createDocumentFragment();
      filtered.forEach((lang) => fragment.appendChild(buildCard(lang)));
      grid.appendChild(fragment);
    }

    resultCount.textContent = `${filtered.length} of ${LANGUAGES.length} languages`;
    return filtered;
  }

  async function speakAll() {
    if (!synthSupported) return;
    speakAllActive = true;
    speakAllBtn.disabled = true;
    const query = searchInput.value.trim();
    const filtered = LANGUAGES.filter((lang) => matchesQuery(lang, query));
    const cards = Array.from(grid.querySelectorAll(".card"));

    for (let i = 0; i < filtered.length; i++) {
      if (!speakAllActive) break;
      await speak(filtered[i], cards[i]);
    }

    speakAllActive = false;
    speakAllBtn.disabled = false;
  }

  function stopAll() {
    speakAllActive = false;
    if (synthSupported) window.speechSynthesis.cancel();
    if (currentCard) {
      currentCard.classList.remove("speaking");
      currentCard = null;
    }
    speakAllBtn.disabled = false;
  }

  searchInput.addEventListener("input", (e) => render(e.target.value.trim()));
  speakAllBtn.addEventListener("click", speakAll);
  stopAllBtn.addEventListener("click", stopAll);

  rateInput.addEventListener("input", () => {
    rateVal.textContent = parseFloat(rateInput.value).toFixed(1);
  });
  pitchInput.addEventListener("input", () => {
    pitchVal.textContent = parseFloat(pitchInput.value).toFixed(1);
  });

  if (synthSupported && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  render("");
})();
