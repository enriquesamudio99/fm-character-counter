const root = document.documentElement;
const themeToggle = document.getElementById('navbar-toggle');
const themeToggleIcon = document.getElementById('navbar-toggle-icon');
const text = document.getElementById('text');
const totalCharacters = document.getElementById('total-characters');
const wordCount = document.getElementById('word-count');
const sentenceCount = document.getElementById('sentence-count');
const readingTime = document.getElementById('reading-time');
const excludeSpaces = document.getElementById('exclude-spaces');
const setCharacterLimit = document.getElementById('set-character-limit');
const characterLimit = document.getElementById('character-limit');
const characterLimitNumber = document.getElementById('character-limit-number');
const lettersInfo = document.getElementById('letters-info');
const lettersGrid = document.getElementById('letters-grid');
const lettersEmpty = document.getElementById('letters-empty');
const lettersButton = document.getElementById('letters-button');
const lettersButtonText = document.getElementById('letters-button-text');

let state = {
  textValue: "",
  characters: 0,
  words: 0,
  sentences: 0,
  excludeSpaces: false,
  characterLimit: false,
  characterLimitQuantity: 200,
  letters: []
}

requestAnimationFrame(() => {
  root.classList.remove('disable-transitions');
});

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

const initApp = () => {
  darkMode();

  text.addEventListener('input', calculateStats);
  text.addEventListener('change', calculateStats);
  excludeSpaces.addEventListener('change', toggleExcludeSpaces);
  setCharacterLimit.addEventListener('change', toggleCharacterLimit);
  characterLimit.addEventListener('input', changeCharacterLimitQuantity);

  characterLimitNumber.textContent = state.characterLimitQuantity;

  lettersButton.addEventListener('click', toggleLettersGrid);
}

const calculateStats = (e) => {
  if (e) {
    state.textValue = e.target.value;
  }

  const text = state.textValue || "";

  calculateCharacters(text);
  calculateWords(text);
  calculateSentences(text);
  calculateReadingTime(text);
  updateLetterDensity(text);

  validateCharacterLimit(text);
}

const calculateCharacters = (text) => {
  const cleanText = text || "";
  state.characters = state.excludeSpaces ? cleanText.replace(/\s/g, '').length : cleanText.length;
  totalCharacters.textContent = state.characters.toString().padStart(2, "0");
}

const calculateWords = (text) => {
  const cleanText = text || "";
  state.words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  wordCount.textContent = state.words.toString().padStart(2, "0");
}

const calculateSentences = (text) => {
  const abbreviations = ["Sr","Sra","Srta","Dr","Dra","Ing","Lic","Prof","etc","Ej","Av","Mr","Mrs","Ms","Dr","Prof","St","Mt","Rd","Jr","Sr","vs","e.g","i.e","etc"];
  const abbrRegex = new RegExp(`\\b(?:${abbreviations.join("|")})\\.$`, "i");
  const cleanText = text.replace(/([¿¡])(\S)/g, "$1 $2").replace(/\s+/g, " ");
  const possibleSentences = cleanText.split(/(?<=[.!?])\s+/);

  const sentences = possibleSentences.filter(sentence => {
    const trimmed = sentence.trim();
    const words = trimmed.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (abbrRegex.test(lastWord)) return false;
    return /[.!?]$/.test(trimmed) && trimmed.length > 1;
  });

  state.sentences = sentences.length;
  sentenceCount.textContent = state.sentences.toString().padStart(2, "0");
}

const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.floor(words / wordsPerMinute);
  const seconds = Math.round((words % wordsPerMinute) / (wordsPerMinute / 60));

  if (minutes > 0) {
    readingTime.textContent = `${minutes} min${minutes > 1 ? "s" : ""}${seconds > 0 ? ` ${seconds} sec${seconds > 1 ? "s" : ""}` : ""}`;
  } else {
    readingTime.textContent = "<1 minute";
  }
}

const toggleExcludeSpaces = () => {
  state.excludeSpaces = !state.excludeSpaces;
  calculateStats();
}

const toggleCharacterLimit = () => {
  state.characterLimit = !state.characterLimit;
  characterLimit.style.display = state.characterLimit ? "flex" : "none";
  if (state.characterLimit) characterLimit.value = state.characterLimitQuantity;
  calculateStats();
}

const changeCharacterLimitQuantity = (e) => {
  state.characterLimitQuantity = +e.target.value;
  characterLimitNumber.textContent = ` ${state.characterLimitQuantity} `;
  calculateStats();
}

const validateCharacterLimit = (textValue) => {
  if (!state.characterLimit) {
    text.classList.remove('textarea--error');
    text.nextElementSibling.style.display = "none";
    return;
  }

  const textLength = state.excludeSpaces ? textValue.replace(/\s/g, '').length : textValue.length;
  if (textLength > state.characterLimitQuantity) {
    text.classList.add('textarea--error');
    text.nextElementSibling.style.display = "flex";
  } else {
    text.classList.remove('textarea--error');
    text.nextElementSibling.style.display = "none";
  }
}

const updateLetterDensity = (textValue) => {
  const onlyLetters = (textValue.match(/[a-zA-Z]/g) || []);
  const totalLetters = onlyLetters.length;

  if (totalLetters === 0) {
    lettersInfo.style.display = "none";
    lettersEmpty.style.display = "flex";
    return;
  }

  lettersInfo.style.display = "block";
  lettersEmpty.style.display = "none";

  const counts = {};
  onlyLetters.forEach(ch => {
    const c = ch.toLowerCase();
    counts[c] = (counts[c] || 0) + 1;
  });

  state.letters = Object.keys(counts).sort();

  const isOpen = lettersGrid.classList.contains("letters__grid--open");
  lettersGrid.innerHTML = "";

  state.letters.forEach(letter => {
    const count = counts[letter];
    const percentage = (count / totalLetters) * 100;
    lettersGrid.appendChild(createLetterElement(letter, count, percentage));
  });

  if (!isOpen) adjustClosedHeight();
};

const adjustClosedHeight = () => {
  const maxRows = 5;
  const letters = lettersGrid.querySelectorAll(".letter");

  if (!letters.length) {
    lettersGrid.style.height = "0px";
    return;
  }

  const gap = parseInt(getComputedStyle(lettersGrid).gap) || 0;
  let height = 0;

  for (let i = 0; i < Math.min(maxRows, letters.length); i++) {
    height += letters[i].offsetHeight;
  }

  const rows = Math.min(maxRows, Math.ceil(letters.length));
  height += (rows - 1) * gap;

  lettersGrid.style.height = `${height}px`;
};

const toggleLettersGrid = () => {
  const isOpen = lettersGrid.classList.toggle("letters__grid--open");

  if (isOpen) {
    lettersGrid.style.height = `${lettersGrid.scrollHeight}px`;
    lettersButton.classList.add("letters__button--open");
    lettersButtonText.textContent = "Show less";
    lettersGrid.style.height = "auto";
  } else {
    lettersGrid.style.height = `${lettersGrid.scrollHeight}px`;
    adjustClosedHeight();
    lettersButton.classList.remove("letters__button--open");
    lettersButtonText.textContent = "Show more";
  }
};

const createLetterElement = (letter, count, percentage) => {
  const letterElement = document.createElement('div');
  letterElement.classList.add('letter');

  const letterTitle = document.createElement('p');
  letterTitle.classList.add('letter__title');
  letterTitle.textContent = letter.toUpperCase();
  letterElement.appendChild(letterTitle);

  const letterBarContainer = document.createElement('div');
  letterBarContainer.classList.add('letter__bar-container');

  const letterBar = document.createElement('div');
  letterBar.classList.add('letter__bar');
  letterBar.style.width = `${percentage}%`;
  letterBarContainer.appendChild(letterBar);

  letterElement.appendChild(letterBarContainer);

  const letterData = document.createElement('div');
  letterData.classList.add('letter__data');

  const letterDataNumber = document.createElement('p');
  letterDataNumber.classList.add('letter__data-number');
  letterDataNumber.textContent = count;

  const letterDataPercentage = document.createElement('p');
  letterDataPercentage.classList.add('letter__data-percentage');
  letterDataPercentage.textContent = `(${percentage.toFixed(2)}%)`;

  letterData.appendChild(letterDataNumber);
  letterData.appendChild(letterDataPercentage);
  letterElement.appendChild(letterData);

  return letterElement;
}

const darkMode = () => {
  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme === 'dark');

  themeToggle.addEventListener('click', () => {
    root.classList.add('disable-transitions');
    const isNowDark = !root.classList.contains('dark');
    applyTheme(isNowDark);
    requestAnimationFrame(() => {
      root.classList.remove('disable-transitions');
    });
  });
}

const applyTheme = (isDark) => {
  root.classList.toggle('dark', isDark);
  themeToggleIcon.src = isDark
    ? './assets/images/icon-sun.svg'
    : './assets/images/icon-moon.svg';
  themeToggleIcon.alt = isDark ? 'Light Mode Icon' : 'Dark Mode Icon';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};
