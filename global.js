console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let navLinks = $$("nav a");

let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);

if (currentLink) {
  currentLink.classList.add("current");
}

let pages = [
  { https://caseehong.github.io/portfolio/index.html: '', title: 'Home' },
  { https://caseehong.github.io/portfolio/projects/index.html: 'projects/', title: 'Projects' },
  { https://caseehong.github.io/portfolio/resume/index.html: 'resume/', title: 'Resume' },
  { https://caseehong.github.io/portfolio/contact/index.html: 'contact/', title: 'Contact' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}