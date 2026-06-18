async function loadDashboard() {
  try {
    const response = await fetch('dashboard.csv');
    const text = await response.text();

    const lines = text.trim().split('\n');

    const kpis = {};
    const critical = [];
    const risks = [];
    const support = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');

      if (cols.length < 3) continue;

      const section = cols[0].trim();
      const name = cols[1].trim();
      const value = cols[2].trim();

      if (section === "KPI") {
        kpis[name] = value;
      }

      if (section === "Critical") {
        critical.push(`${name} — ${value}`);
      }

      if (section === "Risk") {
        risks.push(value);
      }

      if (section === "Support") {
        support.push(value);
      }
    }

    document.getElementById("kpiCritical").innerText = kpis["Critical Topics"] || "-";
    document.getElementById("kpiSop").innerText = kpis["SOP"] || "-";
    document.getElementById("kpiSos").innerText = kpis["SOS"] || "-";
    document.getElementById("kpiSupport").innerText = kpis["Support Needed"] || "-";

    const fillList = (id, data) => {
      const el = document.getElementById(id);
      el.innerHTML = "";
      data.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        el.appendChild(li);
      });
    };


  if (parseInt(kpis["Critical Topics"]) > 5) {
    document.getElementById("kpiCritical").style.color = "#ff0000";
  }


  const now = new Date();
  document.getElementById("statusText").innerText =
    "Last Updated: " + now.toLocaleString();

    fillList("criticalList", critical);
    fillList("riskList", risks);
    fillList("supportList", support);

  } catch (err) {
    console.error("Failed to load CSV:", err);
  }
}


// RUN
loadDashboard();


