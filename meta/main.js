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
      const result = {
        id: commit,
        url: `https://github.com/vis-society/lab-7/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
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