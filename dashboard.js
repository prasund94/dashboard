async function loadDashboard() {
      const criticalEl = document.getElementById('kpiCritical');
      const sopEl = document.getElementById('kpiSop');
      const sosEl = document.getElementById('kpiSos');
      const supportEl = document.getElementById('kpiSupport');
      const criticalListEl = document.getElementById('criticalList');
      const riskListEl = document.getElementById('riskList');
      const supportListEl = document.getElementById('supportList');
      const statusEl = document.getElementById('statusText');

      function setStatus(message, isError = false) {
        statusEl.textContent = message;
        statusEl.className = isError ? 'status error' : 'status';
      }

      try {
        const response = await fetch('dashboard.csv', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Could not load dashboard.csv (${response.status})`);
        }

        const csvText = await response.text();
        const rows = parseCSV(csvText);
        const dataRows = rows.slice(1); // remove header

        const kpis = {};
        const criticalItems = [];
        const risks = [];
        const supports = [];

        for (const row of dataRows) {
          if (!row.length || row.every(cell => cell.trim() === '')) continue;
          const [section, name, value] = row;
          if (section === 'KPI') kpis[name] = value;
          if (section === 'Critical') criticalItems.push({ name, value });
          if (section === 'Risk') risks.push(value);
          if (section === 'Support') supports.push(value);
        }

        criticalEl.textContent = kpis['Critical Topics'] || '-';
        sopEl.textContent = kpis['SOP'] || '-';
        sosEl.textContent = kpis['SOS'] || '-';
        supportEl.textContent = kpis['Support Needed'] || '-';

        renderList(criticalListEl, criticalItems.map(item => `${item.name} — ${item.value}`));
        renderList(riskListEl, risks);
        renderList(supportListEl, supports);

        const now = new Date();
        setStatus(`Loaded dashboard.csv • Refresh the page after saving changes • ${now.toLocaleTimeString()}`);
      } catch (error) {
        console.error(error);
        setStatus('Could not read dashboard.csv. If you opened the HTML directly from your computer, some browsers block local file access. Open the HTML from OneDrive/SharePoint in the browser, or use a simple local web server.', true);
      }
    }

    function renderList(container, items) {
      container.innerHTML = '';
      items.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        container.appendChild(li);
      });
    }

    function parseCSV(text) {
      const rows = [];
      let row = [];
      let value = '';
      let insideQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
          if (insideQuotes && nextChar === '"') {
            value += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          row.push(value.trim());
          value = '';
        } else if ((char === '
' || char === '') && !insideQuotes) {
          if (char === '' && nextChar === '
') i++;
          row.push(value.trim());
          if (row.length > 1 || row[0] !== '') rows.push(row);
          row = [];
          value = '';
        } else {
          value += char;
        }
      }

      if (value.length > 0 || row.length > 0) {
        row.push(value.trim());
        rows.push(row);
      }

      return rows;
    }

    document.addEventListener('DOMContentLoaded', loadDashboard);
