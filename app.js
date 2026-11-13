const scenario = document.querySelector("#scenario");
const format = new Intl.NumberFormat("zh-TW", {minimumFractionDigits: 2, maximumFractionDigits: 2});
const integer = new Intl.NumberFormat("zh-TW");
function show(id, value) {
  document.getElementById(id).textContent = value;
}
function calculate(meals, percent) {
  const visits = (meals + 144) * 30;
  const newCustomers = Math.round(visits * percent / 100);
  const foodProfit = (meals * 30 * 90 - 856400) * 12;
  const quarters = Array(4).fill(foodProfit / 4);
  const years = Array(3).fill(foodProfit);
  let active = 0;
  let platformFirstYear = 0;
  let platformThreeYears = 0;
  for (let month = 1; month <= 36; month += 1) {
    active = newCustomers + active * 0.8;
    const profit = active * 2000 * 0.2;
    if (month <= 12) {
      platformFirstYear += profit;
      quarters[Math.floor((month - 1) / 3)] += profit;
    }
    platformThreeYears += profit;
    years[Math.floor((month - 1) / 12)] += profit;
  }
  const combined = foodProfit + platformFirstYear;
  return { visits, newCustomers, foodProfit, platformFirstYear, combined, quarters, years,
    perShare: combined / 1500, threeYear: (foodProfit * 3 + platformThreeYears) / 1500 };
}
function update() {
  const meals = Number(scenario.elements.traffic.value);
  const percent = Number(scenario.elements.rate.value);
  const { visits, newCustomers, foodProfit, platformFirstYear, combined, quarters, years, perShare, threeYear } = calculate(meals, percent);
  const quarterItems = quarters.map((profit, index) => {
    const item = document.createElement("p");
    item.textContent = `第 ${index + 1} 季　${format.format(profit / 1500)} 元／股`;
    return item;
  });
  document.getElementById("quarters").replaceChildren(...quarterItems);
  const yearItems = years.map((profit, index) => {
    const item = document.createElement("p");
    item.textContent = `第 ${index + 1} 年　${format.format(profit / 1500)} 元／股`;
    return item;
  });
  document.getElementById("years").replaceChildren(...yearItems);
  show("volume", percent ? `每月來店 ${integer.format(visits)} 人次 · 約 ${integer.format(newCustomers)} 位首次入金` : `每月來店 ${integer.format(visits)} 人次 · 僅計餐飲`);
  show("food-revenue", `${format.format(meals * 30 * 180 * 12 / 10000)} 萬元`);
  show("food-share", format.format(foodProfit / 1500) + " 元");
  show("platform-share", format.format(platformFirstYear / 1500) + " 元");
  document.querySelector("#food-bar").style.flexGrow = foodProfit;
  document.querySelector("#platform-bar").style.flexGrow = platformFirstYear;
  show("food", `${format.format(foodProfit / 10000)} 萬元`);
  show("platform", `${format.format(platformFirstYear / 10000)} 萬元`);
  show("total", `${format.format(combined / 10000)} 萬元`);
  show("per-share", `${format.format(perShare)} 元`);
  show("first-rate", `相當於出資額的 ${format.format(perShare / 100)}%`);
  show("three-year", `${format.format(threeYear)} 元`);
  show("three-rate", `相當於出資額的 ${format.format(threeYear / 100)}%`);
}
scenario.addEventListener("change", update);
update();


const compare = document.querySelector("#scenario-comparison");
for (const meals of [432, 576, 720]) {
  const group = document.createElement("section");
  group.className = "scenario-group";
  const title = document.createElement("h3");
  title.textContent = `每日 ${meals} 用餐人次`;
  group.append(title);
  const table = document.createElement("table");
  table.className = "comparison-table";
  table.setAttribute("aria-label", title.textContent);
  const rates = [1, 3, 5];
  const results = rates.map((rate) => calculate(meals, rate));
  const header = table.createTHead().insertRow();
  for (const label of ["轉換率", ...rates.map((rate) => rate + "%")]) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = label;
    header.append(cell);
  }
  const amount = (n) => format.format(n / 10000) + " 萬";
  const share = (n) => format.format(n) + " 元";
  const rows = [
    ["每月來店", (r) => integer.format(r.visits)],
    ["首次入金／月", (r) => integer.format(r.newCustomers) + " 位"],
    ["餐飲稅前", (r) => amount(r.foodProfit)],
    ["平台利潤", (r) => amount(r.platformFirstYear)],
    ["合計稅前", (r) => amount(r.combined)],
    ["首年每股", (r) => share(r.perShare)],
    ["首年回收率", (r) => format.format(r.perShare / 100) + "%"],
    ["三年累計每股", (r) => share(r.threeYear)],
  ];
  const body = table.createTBody();
  for (const [label, render] of rows) {
    const row = body.insertRow();
    const term = document.createElement("th");
    term.scope = "row";
    term.textContent = label;
    row.append(term);
    for (const result of results) row.insertCell().textContent = render(result);
  }
  group.append(table);
  compare.append(group);
}
const linkedDetails = document.querySelectorAll("#street-match, #compare");
function openLinkedDetails() {
  for (const details of linkedDetails) {
    if (location.hash === "#" + details.id) details.open = true;
  }
}
for (const details of linkedDetails) {
  document.querySelectorAll('a[href="#' + details.id + '"]').forEach((link) => {
    link.addEventListener("click", () => { details.open = true; });
  });
}
window.addEventListener("hashchange", openLinkedDetails);
openLinkedDetails();
