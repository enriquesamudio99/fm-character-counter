const root = document.documentElement;
const themeToggle = document.getElementById('navbar-toggle');
const themeToggleIcon = document.getElementById('navbar-toggle-icon');

requestAnimationFrame(() => {
  root.classList.remove('disable-transitions');
});

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

const initApp = () => {
  darkMode();
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