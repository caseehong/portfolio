console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/caseehong', title: 'GitHub' },
];

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/'
    : '/portfolio/';

let nav = document.createElement('nav');
nav.setAttribute('aria-label', 'Main Navigation');
document.body.prepend(nav);

let themeLabel = document.createElement('label');
themeLabel.classList.add('color-scheme');
themeLabel.append('Theme: ');

let themeSelect = document.createElement('select');
for (let [value, title] of [
  ['light dark', 'Automatic'],
  ['light', 'Light'],
  ['dark', 'Dark'],
]) {
  let option = document.createElement('option');
  option.value = value;
  option.textContent = title;
  themeSelect.append(option);
}
themeLabel.append(themeSelect);
nav.before(themeLabel);

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
}

themeSelect.addEventListener('input', (event) => {
  const colorScheme = event.target.value;
  setColorScheme(colorScheme);
  localStorage.setItem('colorScheme', colorScheme);
});

const savedColorScheme = localStorage.getItem('colorScheme');
if (['light dark', 'light', 'dark'].includes(savedColorScheme)) {
  themeSelect.value = savedColorScheme;
  setColorScheme(savedColorScheme);
}

for (let p of pages) {
  let url = p.url;
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  nav.append(a);
}

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
  throw new Error(`Failed to fetch projects: ${response.statusText}`);
}
  const data = await response.json();
return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}