import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const result = {
        id: commit,
        url: `https://github.com/vis-society/lab-7/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: hours + minutes / 60 + seconds / 3600,
        totalLines: lines.length,
      };

      Object.defineProperty(result, 'lines', {
        value: lines,
        writable: false,
        configurable: false,
        enumerable: false,
      });

      return result;
    });
}

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add average line length
  dl.append('dt').text('Average line length (characters)');
  dl.append('dd').text((d3.mean(data, (line) => line.length) ?? 0).toFixed(2));

  // Add longest line length
  dl.append('dt').text('Longest line length (characters)');
  dl.append('dd').text(d3.max(data, (line) => line.length) ?? 0);

  // Add total files
  dl.append('dt').text('Number of files');
  dl.append('dd').text(new Set(data.map((line) => line.file)).size);

}

const data = await loadData();
const commits = processCommits(data);
console.log(commits);

renderCommitInfo(data, commits);

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;
  const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');

  const xScale = d3
  .scaleTime()
  .domain(d3.extent(commits, (d) => d.datetime))
  .range([0, width])
  .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  const timeColor = d3
    .scaleLinear()
    .domain([0, 5, 7, 17, 19, 24])
    .range(['#42618f', '#42618f', '#e69a4b', '#e69a4b', '#42618f', '#42618f'])
    .interpolate(d3.interpolateRgb);

  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', (d) => timeColor(d.hourFrac))
    .on('mouseenter', (event, commit) => {
      clearTimeout(tooltipHideTimer);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave', () => {
      tooltipHideTimer = setTimeout(() => {
        if (!tooltip.matches(':hover')) updateTooltipVisibility(false);
      }, 100);
    });

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
};
    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    // Add Y axis
    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

}

renderScatterPlot(data, commits);

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (!commit || Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  document.getElementById('commit-time').textContent =
    `${commit.time} ${commit.timezone}`;
  document.getElementById('commit-author').textContent = commit.author;
  document.getElementById('commit-lines').textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  document.getElementById('commit-tooltip').hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  const offset = 12;
  const margin = 8;
  const left = Math.min(
    event.clientX + offset,
    window.innerWidth - tooltip.offsetWidth - margin,
  );
  const top = Math.min(
    event.clientY + offset,
    window.innerHeight - tooltip.offsetHeight - margin,
  );

  tooltip.style.left = `${Math.max(margin, left)}px`;
  tooltip.style.top = `${Math.max(margin, top)}px`;
}

let tooltipHideTimer;
const tooltip = document.getElementById('commit-tooltip');
tooltip.addEventListener('mouseenter', () => clearTimeout(tooltipHideTimer));
tooltip.addEventListener('mouseleave', () => updateTooltipVisibility(false));