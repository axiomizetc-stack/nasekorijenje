document.getElementById("order-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const lang = currentLang();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const book = String(data.get("book") || "mama");
  const message = String(data.get("message") || "").trim();
  if (!name || !phone) {
    status.textContent = translations[lang].form.error;
    return;
  }
  const bookText = bookLabels[lang][book] || book;
  const body =
    lang === "en"
      ? `Hello Nase korijenje, I am ${name}. Phone: ${phone}. I want: ${bookText}. Address: ${message}`
      : `Zdravo Naše korijenje, ja sam ${name}. Telefon: ${phone}. Naručujem: ${bookText}. Adresa: ${message}`;
  status.textContent = "";
  window.open(`https://wa.me/38761834552?text=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
});
