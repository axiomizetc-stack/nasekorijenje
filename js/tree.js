const PEOPLE = [
  ["gggmm", "tree.role.gggmm"],
  ["gggmf", "tree.role.gggmf"],
  ["gggpm", "tree.role.gggpm"],
  ["gggpf", "tree.role.gggpf"],
  ["ggmm", "tree.role.ggmm"],
  ["ggmf", "tree.role.ggmf"],
  ["ggpm", "tree.role.ggpm"],
  ["ggpf", "tree.role.ggpf"],
  ["mgm", "tree.role.mgm"],
  ["mgf", "tree.role.mgf"],
  ["pgm", "tree.role.pgm"],
  ["pgf", "tree.role.pgf"],
  ["mother", "tree.role.mother"],
  ["father", "tree.role.father"],
  ["self", "tree.role.self"],
  ["partner", "tree.role.partner"],
];

const EMPTY_PEOPLE = {
  gggmm: "",
  gggmf: "",
  gggpm: "",
  gggpf: "",
  ggmm: "",
  ggmf: "",
  ggpm: "",
  ggpf: "",
  mgm: "",
  mgf: "",
  pgm: "",
  pgf: "",
  mother: "",
  father: "",
  self: "",
  partner: "",
};

const EXAMPLES = {
  bs: {
    family: "Porodica Hadžić",
    people: {
      ...EMPTY_PEOPLE,
      gggmm: "Ajša",
      gggmf: "Sulejman",
      gggpm: "Mejra",
      gggpf: "Alija",
      ggmm: "Šefika",
      ggmf: "Omer",
      ggpm: "Hatidža",
      ggpf: "Ahmed",
      mgm: "Fatima",
      mgf: "Hasan",
      pgm: "Zejna",
      pgf: "Ibrahim",
      mother: "Amra",
      father: "Emir",
      self: "Emina",
      partner: "Adnan",
    },
    children: ["Lejla", "Tarik"],
    showPrapra: false,
  },
  hr: {
    family: "Obitelj Horvat",
    people: {
      ...EMPTY_PEOPLE,
      gggmm: "Manda",
      gggmf: "Mate",
      gggpm: "Roza",
      gggpf: "Petar",
      ggmm: "Kata",
      ggmf: "Stjepan",
      ggpm: "Iva",
      ggpf: "Franjo",
      mgm: "Marija",
      mgf: "Ivan",
      pgm: "Ana",
      pgf: "Josip",
      mother: "Ivana",
      father: "Marko",
      self: "Petra",
      partner: "Luka",
    },
    children: ["Mia", "Filip"],
    showPrapra: false,
  },
  sr: {
    family: "Породица Јовановић",
    people: {
      ...EMPTY_PEOPLE,
      gggmm: "Зора",
      gggmf: "Добривоје",
      gggpm: "Радмила",
      gggpf: "Вукашин",
      ggmm: "Љубица",
      ggmf: "Живорад",
      ggpm: "Нада",
      ggpf: "Милош",
      mgm: "Милица",
      mgf: "Никола",
      pgm: "Јелена",
      pgf: "Драган",
      mother: "Ана",
      father: "Стефан",
      self: "Марија",
      partner: "Александар",
    },
    children: ["Лазар", "Софија"],
    showPrapra: false,
  },
  en: {
    family: "The Bennett family",
    people: {
      ...EMPTY_PEOPLE,
      gggmm: "Edith",
      gggmf: "Henry",
      gggpm: "Florence",
      gggpf: "Edward",
      ggmm: "Rose",
      ggmf: "Arthur",
      ggpm: "Helen",
      ggpf: "George",
      mgm: "Margaret",
      mgf: "William",
      pgm: "Eleanor",
      pgf: "James",
      mother: "Claire",
      father: "Thomas",
      self: "Emily",
      partner: "Daniel",
    },
    children: ["Oliver", "Sophie"],
    showPrapra: false,
  },
};

function blankState() {
  return {
    family: "",
    people: { ...EMPTY_PEOPLE },
    children: [""],
    showPrapra: false,
  };
}

function exampleFor(lang) {
  return structuredClone(EXAMPLES[lang] || EXAMPLES.bs);
}

function normalizeState(raw, lang) {
  const example = exampleFor(lang);
  const people = { ...example.people, ...(raw.people || {}) };
  return {
    family: raw.family ?? example.family,
    people,
    children: Array.isArray(raw.children) && raw.children.length ? raw.children : example.children,
    showPrapra: Boolean(raw.showPrapra),
  };
}

function storageKey(lang) {
  return `korijenje-tree-${lang}`;
}

function loadState(lang) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(lang)) || "null");
    if (saved && saved.people) return normalizeState(saved, lang);
  } catch {
    /* use example */
  }
  return exampleFor(lang);
}

let activeLang = currentLang();
let state = loadState(activeLang);

function persist(lang = activeLang) {
  localStorage.setItem(storageKey(lang), JSON.stringify(state));
}

function pack() {
  return translations[currentLang()] || translations.bs;
}

function cardMarkup(roleKey, name, personAttr, extraClass, removeIndex) {
  const filled = Boolean(String(name || "").trim());
  const remove = removeIndex === undefined
    ? ""
    : `<button type="button" class="leaf-remove" data-remove="${removeIndex}" aria-label="${pack()["tree.remove"]}">×</button>`;
  return `<article class="leaf-card ${extraClass || ""} ${filled ? "is-filled" : "is-empty"}">
    ${remove}
    <span>${pack()[roleKey]}</span>
    <input type="text" maxlength="40" ${personAttr} value="${escapeAttr(name)}" placeholder="${pack()["tree.empty"]}" />
  </article>`;
}

function renderTree() {
  const art = document.getElementById("tree-art");
  art?.classList.toggle("has-prapra", state.showPrapra);
  const prapra = document.getElementById("tree-prapra");
  if (prapra) prapra.hidden = !state.showPrapra;

  const toggle = document.getElementById("toggle-prapra");
  if (toggle) {
    toggle.textContent = pack()[state.showPrapra ? "tree.removePrapra" : "tree.addPrapra"];
  }

  const title = document.getElementById("tree-family-title");
  if (title && document.activeElement !== title) {
    title.value = state.family;
    title.placeholder = pack()["tree.familyPh"];
  }

  PEOPLE.forEach(([key, role]) => {
    const node = document.querySelector(`[data-leaf="${key}"]`);
    if (!node) return;
    const value = state.people[key] || "";
    node.classList.toggle("is-filled", Boolean(value.trim()));
    node.classList.toggle("is-empty", !value.trim());
    const label = node.querySelector("span");
    if (label) label.textContent = pack()[role];
    const input = node.querySelector("input");
    if (input && document.activeElement !== input) input.value = value;
    if (input) {
      input.setAttribute("data-person", key);
      input.placeholder = pack()["tree.empty"];
    }
  });

  const kids = document.getElementById("tree-children");
  if (kids) {
    kids.innerHTML = state.children
      .map((name, index) =>
        cardMarkup("tree.role.child", name, `data-child="${index}"`, `child-${index}`, index)
      )
      .join("");
  }
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function bind() {
  const title = document.getElementById("tree-family-title");
  title?.addEventListener("input", () => {
    state.family = title.value;
    persist();
  });

  document.getElementById("tree-art")?.addEventListener("input", (event) => {
    const person = event.target.getAttribute("data-person");
    const child = event.target.getAttribute("data-child");
    if (person) {
      state.people[person] = event.target.value;
      event.target.closest(".leaf-card")?.classList.toggle("is-filled", Boolean(event.target.value.trim()));
      event.target.closest(".leaf-card")?.classList.toggle("is-empty", !event.target.value.trim());
    }
    if (child !== null && child !== undefined) {
      state.children[Number(child)] = event.target.value;
    }
    persist();
  });

  document.getElementById("tree-art")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const index = Number(button.getAttribute("data-remove"));
    state.children = state.children.length === 1 ? [""] : state.children.filter((_, i) => i !== index);
    persist();
    renderTree();
  });

  document.getElementById("add-child")?.addEventListener("click", () => {
    if (state.children.length >= 6) return;
    state.children.push("");
    persist();
    renderTree();
  });

  document.getElementById("toggle-prapra")?.addEventListener("click", () => {
    state.showPrapra = !state.showPrapra;
    if (state.showPrapra) {
      const example = exampleFor(activeLang);
      ["gggmm", "gggmf", "gggpm", "gggpf"].forEach((key) => {
        if (!String(state.people[key] || "").trim()) state.people[key] = example.people[key];
      });
    }
    persist();
    renderTree();
  });

  document.getElementById("load-example")?.addEventListener("click", () => {
    state = exampleFor(activeLang);
    persist();
    renderTree();
  });

  document.getElementById("clear-tree")?.addEventListener("click", () => {
    state = blankState();
    persist();
    renderTree();
  });

  document.getElementById("download-jpeg")?.addEventListener("click", () => exportTree("jpeg"));
  document.getElementById("download-pdf")?.addEventListener("click", () => exportTree("pdf"));
}

function setStatus(key) {
  const status = document.getElementById("tree-status");
  if (status) status.textContent = pack()[key] || "";
}

function freezeInputs(root) {
  root.querySelectorAll("input").forEach((input) => {
    const isTitle = input.classList.contains("tree-family-title");
    const node = document.createElement(isTitle ? "h2" : "strong");
    node.className = input.className;
    node.textContent = input.value.trim() || input.placeholder || "";
    if (isTitle) node.classList.add("tree-family-title");
    input.replaceWith(node);
  });
}

async function captureTree() {
  const art = document.getElementById("tree-art");
  art.classList.add("is-exporting");
  if (document.fonts?.ready) await document.fonts.ready;
  if (typeof html2canvas !== "function") throw new Error("html2canvas");
  try {
    return await html2canvas(art, {
      scale: 2,
      backgroundColor: "#f3eee4",
      useCORS: true,
      logging: false,
      onclone(clonedDoc) {
        const clone = clonedDoc.getElementById("tree-art") || clonedDoc.body;
        freezeInputs(clone);
      },
    });
  } finally {
    art.classList.remove("is-exporting");
  }
}

async function exportTree(kind) {
  setStatus("tree.saving");
  try {
    const canvas = await captureTree();
    const safe = (state.family.trim() || "porodicno-stablo")
      .toLowerCase()
      .replace(/[^a-z0-9čćžšđђјљњћџ]+/gi, "-")
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

document.addEventListener("korijenje-lang", (event) => {
  const next = event.detail;
  persist(activeLang);
  activeLang = next;
  state = loadState(next);
  renderTree();
});

renderTree();
bind();
