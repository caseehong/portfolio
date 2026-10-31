import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedIndex = -1;
let selectedYear = null;

function renderVisibleProjects() {
  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    const matchesQuery = values.includes(query.toLowerCase());
    const matchesYear = selectedYear === null || project.year === selectedYear;
    return matchesQuery && matchesYear;
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
}

function updateSelection(plot, legend) {
  plot
    .selectAll('path')
    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : null));
  legend
    .selectAll('li')
    .attr('class', (_, idx) =>
      idx === selectedIndex ? 'legend-item selected' : 'legend-item',
    );
}

function renderPieChart(projectsGiven) {
  const rolledData = d3.rollups(
    projectsGiven,
    (group) => group.length,
    (project) => project.year,
  );
  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year,
  }));
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((item) => item.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((item) => arcGenerator(item));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);
  const plot = d3.select('#projects-plot');
  const legend = d3.select('.legend');

  selectedIndex = data.findIndex((item) => item.label === selectedYear);
  plot.selectAll('path').remove();
  legend.selectAll('*').remove();

  arcs.forEach((arc, idx) => {
    plot
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        selectedYear = selectedIndex === -1 ? null : data[idx].label;
        updateSelection(plot, legend);
        renderVisibleProjects();
      });
  });

  data.forEach((item, idx) => {
    legend
      .append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${item.label} <em>(${item.value})</em>`);
  });

  updateSelection(plot, legend);
}

projectsTitle.textContent = `${projects.length} Projects`;
renderVisibleProjects();
renderPieChart(projects);
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  renderVisibleProjects();
  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderPieChart(filteredProjects);
});
