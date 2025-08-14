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

let state = {
  textValue: "",
  characters: 0,
  words: 0,
  sentences: 0,
  excludeSpaces: false,
  characterLimit: false,
  characterLimitQuantity: 200
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

  totalCharacters.textContent = state.characters !== undefined ? state.characters.toString().padStart(2, "0") : "00";
}

const calculateWords = (text) => {
  const cleanText = text || "";
  state.words = cleanText.trim().split(/\s+/).filter(Boolean).length;

  wordCount.textContent = state.words !== undefined ? state.words.toString().padStart(2, "0") : "00";
}

const calculateSentences = (text) => {

  const abbreviations = ["Sr", "Sra", "Srta", "Dr", "Dra", "Ing", "Lic", "Prof", "etc", "Ej", "Av", "Mr", "Mrs", "Ms", "Dr", "Prof", "St", "Mt", "Rd", "Jr", "Sr", "vs", "e.g", "i.e", "etc"];

  const abbrRegex = new RegExp(`\\b(?:${abbreviations.join("|")})\\.$`, "i");

  const cleanText = text.replace(/([¿¡])(\S)/g, "$1 $2").replace(/\s+/g, " ");

  const possibleSentences = cleanText.split(/(?<=[.!?])\s+/);

  const sentences = possibleSentences.filter(sentence => {
    const trimmed = sentence.trim();
    const words = trimmed.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (abbrRegex.test(lastWord)) {
      return false;
    }
    return /[.!?]$/.test(trimmed) && trimmed.length > 1;
  });

  state.sentences = sentences.length;

  sentenceCount.textContent = state.sentences !== undefined ? state.sentences.toString().padStart(2, "0") : "00";
}

const calculateReadingTime = (text) => {
  const cleanText = text || "";
  const wordsPerMinute = 200;
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;

  const minutes = Math.floor(words / wordsPerMinute);
  const seconds = Math.round((words % wordsPerMinute) / (wordsPerMinute / 60));

  let displayTime = "";

  if (minutes > 0) {
    displayTime += `${minutes} min${minutes > 1 ? "s" : ""}`;
    if (seconds > 0) {
      displayTime += ` ${seconds} sec${seconds > 1 ? "s" : ""}`;
    }
  } else {
    displayTime = "<1 minute";
  }

  readingTime.textContent = displayTime;
}

const toggleExcludeSpaces = () => {
  state.excludeSpaces = !state.excludeSpaces;

  calculateStats();
}

const toggleCharacterLimit = () => {
  state.characterLimit = !state.characterLimit;

  if (state.characterLimit) {
    characterLimit.style.display = "flex";
    characterLimit.value = state.characterLimitQuantity;
  } else {
    characterLimit.style.display = "none";
    characterLimit.value = "";
  }

  calculateStats();
}

const changeCharacterLimitQuantity = (e) => {
  const limit = e.target.value;
  state.characterLimitQuantity = +limit;
  characterLimitNumber.textContent = ` ${state.characterLimitQuantity} `;

  calculateStats();
}

const validateCharacterLimit = (textValue) => {
  if (!state.characterLimit) {
    text.classList.remove('textarea--error');
    text.nextElementSibling.style.display = "none";
    return;
  }

  const cleanText = textValue || "";
  const textLength = state.excludeSpaces ? cleanText.replace(/\s/g, '').length : cleanText.length;

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

  const letters = Object.keys(counts).sort();

  lettersGrid.innerHTML = "";

  letters.forEach(letter => {
    const count = counts[letter];
    const percentage = (count / totalLetters) * 100;
    const letterElement = createLetterElement(letter, count, percentage);
    lettersGrid.appendChild(letterElement);
  });
}

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