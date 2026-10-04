const PEOPLE = [
  ["mgm", "tree.role.mgm"],
  ["mgf", "tree.role.mgf"],
  ["pgm", "tree.role.pgm"],
  ["pgf", "tree.role.pgf"],
  ["mother", "tree.role.mother"],
  ["father", "tree.role.father"],
  ["self", "tree.role.self"],
  ["partner", "tree.role.partner"],
];

const EXAMPLE = {
  family: "Porodica Hadžić",
  people: {
    mgm: "Fatima",
    mgf: "Hasan",
    pgm: "Ana",
    pgf: "Ivan",
    mother: "Amra",
    father: "Marko",
    self: "Emina",
    partner: "Luka",
  },
  children: ["Lana", "Tarik"],
};

function blankState() {
  return {
    family: "",
    people: {
      mgm: "",
      mgf: "",
      pgm: "",
      pgf: "",
      mother: "",
      father: "",
      self: "",
      partner: "",
    },
    children: [""],
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("korijenje-tree") || "null");
    if (saved && saved.people) return saved;
  } catch {
    /* keep defaults */
  }
  return structuredClone(EXAMPLE);
}

let state = loadState();

function persist() {
  localStorage.setItem("korijenje-tree", JSON.stringify(state));
}

function pack() {
  return translations[currentLang()] || translations.bs;
}

function displayName(value) {
  return String(value || "").trim() || pack()["tree.empty"];
}

function card(role, name, extraClass) {
  const filled = Boolean(String(name || "").trim());
  return `<article class="leaf-card ${extraClass || ""} ${filled ? "is-filled" : "is-empty"}">
    <span>${pack()[role]}</span>
    <strong>${displayName(name)}</strong>
  </article>`;
}

function renderTree() {
  const title = document.getElementById("tree-family-title");
  if (title) title.textContent = state.family.trim() || pack()["tree.familyPh"];

  const map = {
    mgm: state.people.mgm,
    mgf: state.people.mgf,
    pgm: state.people.pgm,
    pgf: state.people.pgf,
    mother: state.people.mother,
    father: state.people.father,
    self: state.people.self,
    partner: state.people.partner,
  };
  Object.entries(map).forEach(([key, value]) => {
    const node = document.querySelector(`[data-leaf="${key}"]`);
    if (!node) return;
    node.classList.toggle("is-filled", Boolean(String(value || "").trim()));
    node.classList.toggle("is-empty", !String(value || "").trim());
    node.querySelector("strong").textContent = displayName(value);
  });

  const partnerCard = document.querySelector('[data-leaf="partner"]');
  if (partnerCard) partnerCard.hidden = !String(state.people.partner || "").trim();

  const kids = document.getElementById("tree-children");
  if (kids) {
    kids.innerHTML = state.children
      .map((name, index) => card("tree.role.child", name, `child-${index}`))
      .join("");
  }
}

function renderForm() {
  const fields = document.getElementById("tree-fields");
  if (!fields) return;
  const t = pack();
  const peopleFields = PEOPLE.map(
    ([key, role]) => `<label>
      <span>${t[role]}</span>
      <input data-person="${key}" type="text" maxlength="40" value="${escapeAttr(state.people[key])}" />
    </label>`
  ).join("");
  const childFields = state.children
    .map(
      (name, index) => `<label class="child-field">
      <span>${t["tree.role.child"]} ${index + 1}</span>
      <div class="child-row">
        <input data-child="${index}" type="text" maxlength="40" value="${escapeAttr(name)}" />
        <button type="button" class="btn-quiet" data-remove="${index}">${t["tree.remove"]}</button>
      </div>
    </label>`
    )
    .join("");
  fields.innerHTML = `${peopleFields}${childFields}`;
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function bind() {
  const family = document.getElementById("family-name");
  if (family) {
    family.value = state.family;
    family.addEventListener("input", () => {
      state.family = family.value;
      persist();
      renderTree();
    });
  }

  document.getElementById("tree-fields")?.addEventListener("input", (event) => {
    const person = event.target.getAttribute("data-person");
    const child = event.target.getAttribute("data-child");
    if (person) state.people[person] = event.target.value;
    if (child !== null && child !== undefined) state.children[Number(child)] = event.target.value;
    persist();
    renderTree();
  });

  document.getElementById("tree-fields")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const index = Number(button.getAttribute("data-remove"));
    if (state.children.length === 1) {
      state.children = [""];
    } else {
      state.children.splice(index, 1);
    }
    persist();
    renderForm();
    renderTree();
  });

  document.getElementById("add-child")?.addEventListener("click", () => {
    if (state.children.length >= 6) return;
    state.children.push("");
    persist();
    renderForm();
    renderTree();
  });

  document.getElementById("load-example")?.addEventListener("click", () => {
    state = structuredClone(EXAMPLE);
    persist();
    const family = document.getElementById("family-name");
    if (family) family.value = state.family;
    renderForm();
    renderTree();
  });

  document.getElementById("clear-tree")?.addEventListener("click", () => {
    state = blankState();
    persist();
    const family = document.getElementById("family-name");
    if (family) family.value = "";
    renderForm();
    renderTree();
  });

  document.getElementById("download-jpeg")?.addEventListener("click", () => exportTree("jpeg"));
  document.getElementById("download-pdf")?.addEventListener("click", () => exportTree("pdf"));
}

function setStatus(key) {
  const status = document.getElementById("tree-status");
  if (status) status.textContent = pack()[key] || "";
}

async function captureTree() {
  const art = document.getElementById("tree-art");
  if (document.fonts?.ready) await document.fonts.ready;
  if (typeof html2canvas !== "function") throw new Error("html2canvas");
  return html2canvas(art, {
    scale: 2,
    backgroundColor: "#f3eee4",
    useCORS: true,
    logging: false,
  });
}

async function exportTree(kind) {
  setStatus("tree.saving");
  try {
    const canvas = await captureTree();
    const safe = (state.family.trim() || "porodicno-stablo")
      .toLowerCase()
      .replace(/[^a-z0-9čćžšđ]+/gi, "-")
      .replace(/^-|-$/g, "");
    if (kind === "jpeg") {
      const link = document.createElement("a");
      link.download = `${safe}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.92);
      link.click();
    } else {
      if (!window.jspdf?.jsPDF) throw new Error("jspdf");
      const image = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new window.jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const width = canvas.width * ratio;
      const height = canvas.height * ratio;
      pdf.addImage(image, "JPEG", (pageW - width) / 2, (pageH - height) / 2, width, height);
      pdf.save(`${safe}.pdf`);
    }
    setStatus("tree.saved");
  } catch (error) {
    console.error(error);
    setStatus("tree.fail");
  }
}

document.addEventListener("korijenje-lang", () => {
  renderForm();
  renderTree();
});

renderForm();
renderTree();
bind();
