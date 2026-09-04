// Monthly-payment estimator on each listing's detail page. Standard
// amortization formula, principal & interest only. Purely illustrative —
// the on-page note says so, and this script never sends anything anywhere.
(function () {
  const calc = document.getElementById("mortgage-calc");
  if (!calc) return;

  const priceInput = document.getElementById("mc-price");
  const downInput = document.getElementById("mc-down");
  const rateInput = document.getElementById("mc-rate");
  const termSelect = document.getElementById("mc-term");
  const result = document.getElementById("mc-result");

  const startingPrice = parseInt((calc.dataset.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
  priceInput.value = startingPrice;

  function formatCurrency(amount) {
    return "$" + Math.round(amount).toLocaleString("en-US");
  }

  function compute() {
    const price = Math.max(0, parseFloat(priceInput.value) || 0);
    const downPct = Math.min(100, Math.max(0, parseFloat(downInput.value) || 0));
    const annualRate = Math.max(0, parseFloat(rateInput.value) || 0);
    const years = parseInt(termSelect.value, 10) || 30;

    const loanAmount = price * (1 - downPct / 100);
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;

    let monthlyPayment;
    if (numPayments <= 0) {
      monthlyPayment = 0;
    } else if (monthlyRate === 0) {
      monthlyPayment = loanAmount / numPayments;
    } else {
      const growth = Math.pow(1 + monthlyRate, numPayments);
      monthlyPayment = (loanAmount * (monthlyRate * growth)) / (growth - 1);
    }

    if (!isFinite(monthlyPayment) || monthlyPayment < 0) monthlyPayment = 0;
    const perMonth = window.t ? window.t("mortgagecalc.perMonth") : " / mo";
    result.textContent = formatCurrency(monthlyPayment) + perMonth;
  }

  [priceInput, downInput, rateInput, termSelect].forEach(function (el) {
    el.addEventListener("input", compute);
    el.addEventListener("change", compute);
  });

  compute();
  // Re-render with the translated "/mo" suffix on a language switch.
  window.addEventListener("lang:changed", compute);
})();
