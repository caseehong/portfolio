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

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  const isExternal = url.startsWith('http');
  if (!isExternal) {
    url = BASE_PATH + url;
  }

  const isCurrent =
    !isExternal &&
    new URL(url, location.href).pathname === location.pathname;
  const target = isExternal
    ? ' target="_blank" rel="noopener noreferrer"'
    : '';
  const currentClass = isCurrent ? ' class="current"' : '';
  nav.insertAdjacentHTML(
    'beforeend',
    `<a href="${url}"${currentClass}${target}>${title}</a>`,
  );
}