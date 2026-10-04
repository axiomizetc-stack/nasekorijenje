document.getElementById("order-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const lang = currentLang();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const book = String(data.get("book") || "mama");
  const edition = String(data.get("edition") || "bs");
  const message = String(data.get("message") || "").trim();
  if (!name || !phone) {
    status.textContent = translations[lang].form.error;
    return;
  }
  const bookText = (bookLabels[lang] || bookLabels.bs)[book] || book;
  const editionText = (editionLabels[lang] || editionLabels.bs)[edition] || edition;
  const body =
    lang === "en"
      ? `Hello Nase korijenje, I am ${name}. Phone: ${phone}. I want: ${bookText}. Book language: ${editionText}. Address: ${message}`
      : lang === "sr"
        ? `Здраво Наше коријење, ја сам ${name}. Телефон: ${phone}. Наручујем: ${bookText}. Језик књиге: ${editionText}. Адреса: ${message}`
        : `Zdravo Naše korijenje, ja sam ${name}. Telefon: ${phone}. Naručujem: ${bookText}. Jezik knjige: ${editionText}. Adresa: ${message}`;
  status.textContent = "";
  window.open(`https://wa.me/38761834552?text=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
});
