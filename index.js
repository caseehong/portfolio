import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
const profileStats = document.querySelector('#profile-stats');

renderProjects(latestProjects, projectsContainer, 'h2');

const githubData = await fetchGitHubData('caseehong');

if (profileStats) {
  const statsList = document.createElement('dl');

  for (const [label, value] of [
    ['Public Repos:', githubData.public_repos],
    ['Public Gists:', githubData.public_gists],
    ['Followers:', githubData.followers],
    ['Following:', githubData.following],
  ]) {
    const term = document.createElement('dt');
    term.textContent = label;
    const definition = document.createElement('dd');
    definition.textContent = typeof value === 'number' ? String(value) : 'N/A';
    statsList.append(term, definition);
  }

  profileStats.append(statsList);
}