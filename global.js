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
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    throw error;
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!Array.isArray(projects)) {
    throw new TypeError('Projects must be provided as an array.');
  }
  if (!(containerElement instanceof Element)) {
    throw new TypeError('A valid container element is required.');
  }
  if (!/^h[1-6]$/.test(headingLevel)) {
    throw new RangeError('Heading level must be between h1 and h6.');
  }
  if (projects.some((project) => !project || typeof project !== 'object' || Array.isArray(project))) {
    throw new TypeError('Each project must be an object.');
  }

  containerElement.innerHTML = '';

  for (const project of projects) {
    const article = document.createElement('article');
    const heading = document.createElement(headingLevel);
    const title = typeof project.title === 'string' && project.title.trim()
      ? project.title
      : 'Untitled project';
    heading.textContent = title;
    article.append(heading);

    if (typeof project.image === 'string' && project.image.trim()) {
      const image = document.createElement('img');
      image.src = new URL(project.image, import.meta.url).href;
      image.alt = title;
      article.append(image);
    }

    const description = document.createElement('p');
    description.textContent = typeof project.description === 'string' ? project.description : '';
    article.append(description);
    containerElement.append(article);
  }
}
