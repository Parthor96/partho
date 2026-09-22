(() => {
  const resources = window.TEACHING_RESOURCES || [];
  const container = document.querySelector('#resource-tables');
  const filters = document.querySelector('#course-filters');
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function linksCell(links, topic) {
    const cell = element('td');
    const list = element('div', '', 'resource-links');
    for (const item of links || []) {
      if (!item.url || !item.label) continue;
      const url = new URL(item.url, document.baseURI);
      if (!['https:', 'http:'].includes(url.protocol)) continue;
      const link = element('a', item.label);
      link.href = url.href;
      link.setAttribute('aria-label', `${topic}: ${item.label}`);
      if (url.origin !== location.origin) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      list.append(link);
    }
    cell.append(list.childElementCount ? list : element('span', 'Coming soon', 'pending'));
    return cell;
  }
  function render(course) {
    container.replaceChildren();
    const selected = resources.filter(row => course === 'all' || row.course === course);
    for (const group of ['I', 'II']) {
      const rows = selected.filter(row => row.course === group);
      if (!rows.length) continue;
      const section = element('section', '', 'topic-group');
      section.append(element('h3', `Organic Chemistry ${group}`));
      const wrap = element('div', '', 'table-wrap');
      const table = element('table');
      table.append(element('caption', 'Worksheets may be PDFs or links to external practice resources.'));
      const head = element('thead');
      const header = element('tr');
      for (const label of ['Topic', 'Practice', 'Solutions', 'Video walkthroughs']) {
        const th = element('th', label); th.scope = 'col'; header.append(th);
      }
      head.append(header); table.append(head);
      const body = element('tbody');
      for (const row of rows) {
        const tr = element('tr');
        const title = element('th', row.topic); title.scope = 'row'; tr.append(title);
        for (const key of ['problems', 'solutions', 'videos']) tr.append(linksCell(row[key], row.topic));
        body.append(tr);
      }
      table.append(body); wrap.append(table); section.append(wrap); container.append(section);
    }
    document.querySelector('#resource-status').textContent = `${selected.length} topics · Course coverage may vary by instructor.`;
    for (const button of filters.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.course === course));
  }
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-course]');
    if (button) render(button.dataset.course);
  });
  render('all');
})();
