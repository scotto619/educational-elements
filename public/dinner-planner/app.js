
const STORAGE_KEY = "easyDinnerPlannerV1";
let deferredInstallPrompt = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : clone(window.DEFAULT_APP_DATA);
  } catch {
    return clone(window.DEFAULT_APP_DATA);
  }
}
let state = loadState();
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function formatDate(value, options={day:"numeric",month:"short"}) {
  return new Intl.DateTimeFormat("en-AU", options).format(new Date(value + "T12:00:00"));
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function allDays() {
  return state.weeks.flatMap(w => w.days.map(d => ({...d, week:w.number})));
}
function findCurrentOrNextDay() {
  const today = todayISO();
  return allDays().find(d => d.date >= today) || allDays()[allDays().length - 1];
}
function getCurrentWeekNumber() {
  const target = findCurrentOrNextDay();
  return target?.week || 1;
}
function recipeButton(name, text=name) {
  return `<button class="meal-button" data-recipe="${escapeHtml(name)}">${escapeHtml(text)}</button>`;
}
function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
}
function renderHome() {
  const view = document.getElementById("homeView");
  const target = findCurrentOrNextDay();
  if (!target) {
    view.innerHTML = document.getElementById("emptyStateTemplate").innerHTML;
    return;
  }
  const recipe = target.type === "meal" ? state.recipes[target.name] : null;
  const week = state.weeks.find(w => w.number === target.week);
  const shopDate = week.shoppingDate;
  view.innerHTML = `
    <div class="hero-card">
      <p class="hero-date">${target.date === todayISO() ? "Tonight" : formatDate(target.date,{weekday:"long",day:"numeric",month:"long"})}</p>
      <h2>${escapeHtml(target.name)}</h2>
      <p>${target.serves ? `Serves ${target.serves}${recipe ? ` • ${escapeHtml(recipe.time)}` : ""}` : "No recipe needed"}</p>
    </div>
    ${target.type === "meal" ? `
      <div class="card">
        <div class="card-title-row">
          <div>
            <p class="eyebrow">Beginner friendly</p>
            <h3 style="margin-bottom:0">Ready to cook?</h3>
          </div>
          <span class="pill">${escapeHtml(recipe.difficulty)}</span>
        </div>
        <button class="primary-button" style="margin-top:16px" data-recipe="${escapeHtml(target.name)}">Open recipe</button>
      </div>` : ""}
    <div class="quick-actions">
      <button class="action-card" data-go="calendarView"><span>📅</span><strong>See the full menu</strong></button>
      <button class="action-card" data-go="shoppingView" data-week="${week.number}"><span>🛒</span><strong>Week ${week.number} shopping list</strong><small style="display:block;margin-top:5px">Prepared ${formatDate(shopDate)}</small></button>
    </div>
  `;
}
function renderCalendar() {
  const view = document.getElementById("calendarView");
  view.innerHTML = `
    <div class="section-heading"><div><p class="eyebrow">20 July–13 September 2026</p><h2>Eight-week menu</h2></div></div>
    ${state.weeks.map(w => `
      <article class="week-card">
        <div class="week-title"><h3>Week ${w.number}</h3><span class="pill">${formatDate(w.start)}–${formatDate(w.end)}</span></div>
        ${w.days.map(d => `
          <div class="day-row">
            <div><div class="day-name">${d.day.slice(0,3).toUpperCase()}</div><div class="day-date">${formatDate(d.date)}</div></div>
            <div>${d.type === "meal" ? recipeButton(d.name) : `<span class="fixed-meal">${escapeHtml(d.name)}</span>`}</div>
            <div>${d.serves ? `<span class="serves">${d.serves} people</span>` : ""}</div>
          </div>`).join("")}
      </article>`).join("")}
  `;
}
function renderRecipes(query="") {
  const view = document.getElementById("recipesView");
  const mealNames = [...new Set(state.weeks.flatMap(w => w.days.filter(d => d.type === "meal").map(d => d.name)))];
  const filtered = mealNames.filter(n => n.toLowerCase().includes(query.toLowerCase()));
  view.innerHTML = `
    <div class="section-heading"><div><p class="eyebrow">${mealNames.length} easy dinners</p><h2>Recipes</h2></div></div>
    <input id="recipeSearch" class="search-box" type="search" placeholder="Search recipes…" value="${escapeHtml(query)}">
    <div class="recipe-list">
      ${filtered.map(name => {
        const r=state.recipes[name];
        return `<article class="recipe-card"><button data-recipe="${escapeHtml(name)}"><h3>${escapeHtml(name)}</h3><p>${escapeHtml(r.time)} • ${escapeHtml(r.difficulty)}</p></button></article>`;
      }).join("") || `<div class="empty-state"><div class="empty-icon">🔎</div><h2>No recipe found</h2></div>`}
    </div>`;
  document.getElementById("recipeSearch").addEventListener("input", e => renderRecipes(e.target.value));
}
function ensureShoppingShape(week) {
  if (!week.customShopping) {
    week.customShopping = [];
    Object.entries(week.shopping).forEach(([category, items]) => {
      items.forEach((text, i) => week.customShopping.push({
        id:`base-${week.number}-${category}-${i}`,
        category, text, checked:false
      }));
    });
    saveState();
  }
}
let selectedShoppingWeek = null;
function renderShopping(weekNumber = selectedShoppingWeek || getCurrentWeekNumber()) {
  selectedShoppingWeek = Number(weekNumber);
  const view = document.getElementById("shoppingView");
  const week = state.weeks.find(w => w.number === selectedShoppingWeek) || state.weeks[0];
  ensureShoppingShape(week);
  const grouped = {};
  week.customShopping.forEach(item => {
    (grouped[item.category] ||= []).push(item);
  });
  const total=week.customShopping.length;
  const done=week.customShopping.filter(i=>i.checked).length;
  const percent=total ? Math.round(done/total*100) : 0;
  view.innerHTML = `
    <div class="section-heading"><div><p class="eyebrow">Editable and saved automatically</p><h2>Shopping lists</h2></div></div>
    <div class="week-selector">${state.weeks.map(w => `<button class="week-chip ${w.number===week.number?"active":""}" data-shopping-week="${w.number}">Week ${w.number}</button>`).join("")}</div>
    <div class="shopping-header">
      <h2>Week ${week.number}</h2>
      <p>Shop ${formatDate(week.shoppingDate,{weekday:"long",day:"numeric",month:"long"})} • meals ${formatDate(week.start)}–${formatDate(week.end)}</p>
      <div class="progress"><div style="width:${percent}%"></div></div>
      <p style="margin-top:8px;font-size:.82rem">${done} of ${total} items checked</p>
    </div>
    <div id="shoppingCategories">
      ${Object.entries(grouped).map(([category,items]) => categoryBlock(category,items)).join("")}
    </div>
    <div class="category">
      <h3>＋ Add another category item</h3>
      <div class="add-row">
        <input id="newCategory" value="Extra" aria-label="Category">
        <input id="newItem" placeholder="Breakfast, lunch, snacks…" aria-label="New item">
        <button id="addGeneralItem" aria-label="Add item">Add</button>
      </div>
    </div>`;
}
function categoryBlock(category, items) {
  return `<section class="category">
    <h3>${escapeHtml(category)}</h3>
    ${items.map(i => `<label class="shop-item ${i.checked?"checked":""}">
      <input type="checkbox" data-check-item="${escapeHtml(i.id)}" ${i.checked?"checked":""}>
      <input type="text" value="${escapeHtml(i.text)}" data-edit-item="${escapeHtml(i.id)}" aria-label="${escapeHtml(i.text)}">
      <button class="delete-item" data-delete-item="${escapeHtml(i.id)}" aria-label="Delete item">✕</button>
    </label>`).join("")}
    <div class="add-row">
      <input placeholder="Add item…" data-add-input="${escapeHtml(category)}">
      <button data-add-category="${escapeHtml(category)}">Add</button>
    </div>
  </section>`;
}
function openRecipe(name) {
  const recipe = state.recipes[name];
  if (!recipe) return;
  document.getElementById("recipeTitle").textContent=name;
  const day=allDays().find(d=>d.name===name);
  document.getElementById("recipeMeta").textContent=`${recipe.time} • ${recipe.difficulty}${day?.serves ? ` • serves ${day.serves}` : ""}`;
  document.getElementById("recipeBody").innerHTML=`
    <h3>Ingredients</h3>
    <ul class="ingredient-list">${recipe.ingredients.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>
    <h3>Step-by-step method</h3>
    <ol class="step-list">${recipe.steps.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ol>`;
  document.getElementById("recipeDialog").showModal();
}
function switchView(id) {
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  document.querySelectorAll(".nav-button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  window.scrollTo({top:0,behavior:"smooth"});
  if (id==="homeView") renderHome();
  if (id==="calendarView") renderCalendar();
  if (id==="recipesView") renderRecipes();
  if (id==="shoppingView") renderShopping();
}
document.addEventListener("click", e => {
  const recipe=e.target.closest("[data-recipe]");
  if (recipe) openRecipe(recipe.dataset.recipe);
  const nav=e.target.closest("[data-view]");
  if (nav) switchView(nav.dataset.view);
  const go=e.target.closest("[data-go]");
  if (go) {
    if (go.dataset.week) selectedShoppingWeek=Number(go.dataset.week);
    switchView(go.dataset.go);
  }
  const weekButton=e.target.closest("[data-shopping-week]");
  if (weekButton) renderShopping(weekButton.dataset.shoppingWeek);
  const check=e.target.closest("[data-check-item]");
  if (check) {
    const week=state.weeks.find(w=>w.number===selectedShoppingWeek);
    const item=week.customShopping.find(i=>i.id===check.dataset.checkItem);
    item.checked=check.checked; saveState(); renderShopping();
  }
  const del=e.target.closest("[data-delete-item]");
  if (del) {
    const week=state.weeks.find(w=>w.number===selectedShoppingWeek);
    week.customShopping=week.customShopping.filter(i=>i.id!==del.dataset.deleteItem);
    saveState(); renderShopping();
  }
  const addCat=e.target.closest("[data-add-category]");
  if (addCat) {
    const input=document.querySelector(`[data-add-input="${CSS.escape(addCat.dataset.addCategory)}"]`);
    addItem(addCat.dataset.addCategory,input.value);
  }
  if (e.target.id==="addGeneralItem") {
    addItem(document.getElementById("newCategory").value || "Extra",document.getElementById("newItem").value);
  }
  if (e.target.matches("[data-close-dialog]")) e.target.closest("dialog").close();
});
document.addEventListener("change", e => {
  if (e.target.matches("[data-edit-item]")) {
    const week=state.weeks.find(w=>w.number===selectedShoppingWeek);
    const item=week.customShopping.find(i=>i.id===e.target.dataset.editItem);
    item.text=e.target.value; saveState();
  }
});
function addItem(category,text) {
  text=text.trim(); category=category.trim()||"Extra";
  if (!text) return;
  const week=state.weeks.find(w=>w.number===selectedShoppingWeek);
  ensureShoppingShape(week);
  week.customShopping.push({id:`custom-${Date.now()}-${Math.random()}`,category,text,checked:false});
  saveState(); renderShopping();
}
document.getElementById("menuButton").addEventListener("click",()=>document.getElementById("settingsDialog").showModal());
document.getElementById("exportButton").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download="dinner-planner-backup.json"; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById("importInput").addEventListener("change",e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try { state=JSON.parse(reader.result); saveState(); renderHome(); alert("Backup imported."); }
    catch { alert("That backup file could not be read."); }
  };
  reader.readAsText(file);
});
document.getElementById("resetButton").addEventListener("click",()=>{
  if(confirm("Reset every shopping-list edit and checkbox?")) {
    state=clone(window.DEFAULT_APP_DATA); saveState(); renderHome(); alert("The original plan has been restored.");
  }
});
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault(); deferredInstallPrompt=e;
  document.getElementById("installButton").hidden=false;
});
document.getElementById("installButton").addEventListener("click",async()=>{
  if(!deferredInstallPrompt)return;
  deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt=null;
});
if("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("service-worker.js");
}
renderHome();
