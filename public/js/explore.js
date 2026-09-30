(() => {
  const cards = [...document.querySelectorAll(".listing-item")];
  if (!cards.length) return;
  let activeCategory = "All stays";
  const filters = [...document.querySelectorAll(".filter")];
  const emptyState = document.getElementById("emptyState");

  const refresh = (query = "") => {
    let visible = 0;
    cards.forEach((card) => {
      const text = `${card.dataset.title} ${card.dataset.place} ${card.dataset.description}`.toLowerCase();
      const category = activeCategory === "All stays" || activeCategory === "Trending" || text.includes(activeCategory.replace("Iconic Cities", "city"));
      const matches = !query || query.toLowerCase().split(/\W+/).filter(Boolean).some((word) => word.length > 2 && text.includes(word));
      card.classList.toggle("d-none", !(category && matches));
      if (category && matches) visible++;
    });
    emptyState?.classList.toggle("d-none", visible !== 0);
  };

  filters.forEach((button) => button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    filters.forEach((filter) => filter.classList.toggle("active", filter === button));
    refresh();
  }));
  document.getElementById("clearFilters")?.addEventListener("click", () => {
    activeCategory = "All stays";
    filters.forEach((filter) => filter.classList.toggle("active", filter.dataset.category === activeCategory));
    refresh();
  });
  document.getElementById("taxSwitch")?.addEventListener("change", (event) => {
    document.querySelectorAll(".tax-info").forEach((line) => line.style.display = event.target.checked ? "inline" : "none");
  });
  document.querySelectorAll(".save-stay").forEach((button) => button.addEventListener("click", (event) => {
    event.preventDefault(); event.stopPropagation();
    const saved = button.classList.toggle("is-saved");
    button.innerHTML = `<i class="fa-${saved ? "solid" : "regular"} fa-heart"></i>`;
    button.setAttribute("aria-pressed", String(saved));
  }));

  const prompt = document.getElementById("tripPrompt");
  const result = document.getElementById("plannerResult");
  document.querySelectorAll(".prompt-chips button").forEach((chip) => chip.addEventListener("click", () => { prompt.value = chip.textContent; prompt.focus(); }));
  document.getElementById("planTrip")?.addEventListener("click", () => {
    const words = (prompt.value || "").toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
    const stopWords = new Set(["with", "and", "the", "for", "under", "per", "night", "stay", "somewhere", "want", "looking", "place", "weekend", "trip", "break", "quiet", "little"]);
    const interests = words.filter((word) => !stopWords.has(word) && !/^\d+$/.test(word));
    const budget = Number((prompt.value.match(/(?:₹|rs\.?\s*|inr\s*)([\d,]+)/i) || prompt.value.match(/under\s+([\d,]+)/i) || [])[1]?.replace(/,/g, ""));
    const ranked = cards.map((card) => {
      const haystack = `${card.dataset.title} ${card.dataset.place} ${card.dataset.description}`.toLowerCase();
      const hits = interests.filter((word) => haystack.includes(word));
      const price = Number(card.dataset.price);
      return { card, hits, price, score: hits.length * 3 + (budget && price <= budget ? 2 : 0) - (budget && price > budget ? 2 : 0) };
    }).sort((a, b) => b.score - a.score || (budget ? Math.abs(a.price - budget) - Math.abs(b.price - budget) : a.price - b.price));
    if (!prompt.value.trim()) { result.innerHTML = "<p>Share a few details—destination, mood, who’s coming or your nightly budget—and I’ll find a match.</p>"; prompt.focus(); return; }
    if (!ranked.length) { result.innerHTML = "<p>There aren’t any stays to match right now. Try again when more places are available.</p>"; return; }
    const matches = ranked.slice(0, 3);
    const mood = interests.length ? `I picked up on ${interests.slice(0, 3).join(", ")}.` : "I found a few welcoming places to start with.";
    result.innerHTML = `<p>${mood} Here are a few stays to explore:</p>` + matches.map(({ card, hits, price }) => {
      const title = card.dataset.title;
      const place = card.dataset.place;
      const reason = hits.length ? `A good fit for your ${hits.slice(0, 2).join(" and ")} getaway.` : "A lovely starting point for a change of scene.";
      return `<article class="planner-result-card"><span class="match-label">${hits.length ? "Picked for you" : "A little inspiration"}</span><div><a href="${card.querySelector("a").getAttribute("href")}">${title}</a></div><p>${place} · ₹${price.toLocaleString("en-IN")} a night. ${reason}</p></article>`;
    }).join("");
  });
})();
