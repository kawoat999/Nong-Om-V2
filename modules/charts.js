/**
 * Smart Expense Tracker - Financial Charts & Visual Analytics Module
 * Powered by Chart.js
 */

const FinanceCharts = {
  donutChart: null,
  cashflowChart: null,

  /**
   * Render or update all analytics charts
   */
  updateCharts(transactions, categories, profile) {
    this.renderCategoryDonut(transactions, categories, profile);
    this.renderCashflowTrends(transactions, profile);
    this.renderRule503020(transactions, categories, profile);
  },

  /**
   * Category Expense Breakdown Donut Chart
   */
  renderCategoryDonut(transactions, categories, profile) {
    const canvas = document.getElementById('categoryDonutChart');
    if (!canvas) return;

    // Filter only expense transactions
    const expenses = transactions.filter(t => t.type === 'expense');

    // Aggregate by category
    const categoryTotals = {};
    let totalExpense = 0;

    expenses.forEach(t => {
      const catId = t.categoryId || 'other_exp';
      categoryTotals[catId] = (categoryTotals[catId] || 0) + Number(t.amount);
      totalExpense += Number(t.amount);
    });

    const categoryMap = {};
    categories.expense.forEach(c => { categoryMap[c.id] = c; });

    // Prepare chart labels and data
    const labels = [];
    const data = [];
    const colors = [];
    const legendItems = [];

    // Sort descending by amount
    const sortedCatIds = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);

    sortedCatIds.forEach(catId => {
      const cat = categoryMap[catId] || { name: 'อื่นๆ', color: '#64748b', icon: '📦' };
      const amount = categoryTotals[catId];
      const pct = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;

      labels.push(cat.name);
      data.push(amount);
      colors.push(cat.color);

      legendItems.push({
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        amount: amount,
        pct: pct
      });
    });

    // If no expense yet, show placeholder
    if (data.length === 0) {
      labels.push('ยังไม่มีรายจ่าย');
      data.push(1);
      colors.push('#e2e8f0');
    }

    if (this.donutChart) {
      this.donutChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.parsed;
                const pct = totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0;
                return ` ${context.label}: ฿${val.toLocaleString()} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    // Render legend list in HTML
    const legendContainer = document.getElementById('category-legend-list');
    if (legendContainer) {
      if (legendItems.length === 0) {
        legendContainer.innerHTML = `<p class="text-muted text-center text-sm py-2">ยังไม่มีรายการค่าใช้จ่ายในเดือนนี้</p>`;
      } else {
        legendContainer.innerHTML = legendItems.slice(0, 5).map(item => `
          <div class="legend-item">
            <div class="legend-left">
              <span class="legend-color-dot" style="background-color: ${item.color};"></span>
              <span>${item.icon} ${item.name}</span>
            </div>
            <div class="legend-right">
              <span class="text-muted text-xs mr-2">(${item.pct}%)</span>
              <span>฿${item.amount.toLocaleString()}</span>
            </div>
          </div>
        `).join('');
      }
    }
  },

  /**
   * Cash Flow Trends Bar Chart (Income vs Expense)
   */
  renderCashflowTrends(transactions, profile) {
    const canvas = document.getElementById('cashflowBarChart');
    if (!canvas) return;

    // Group transactions by recent months or last 6 days
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const currentMonth = new Date().getMonth();

    // Prepare last 4 months labels
    const labels = [];
    const incomeData = [55000, 58000, 62000, 0];
    const expenseData = [24000, 21500, 23000, 0];

    for (let i = 3; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      labels.push(monthNames[mIdx]);
    }

    // Calculate current month's actual data
    let currentIncome = 0;
    let currentExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') currentIncome += Number(t.amount);
      if (t.type === 'expense') currentExpense += Number(t.amount);
    });

    incomeData[3] = currentIncome || 65000;
    expenseData[3] = currentExpense || 19720;

    if (this.cashflowChart) {
      this.cashflowChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.cashflowChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'รายรับ (Income)',
            data: incomeData,
            backgroundColor: '#16a34a',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          },
          {
            label: 'รายจ่าย (Expense)',
            data: expenseData,
            backgroundColor: '#ef4444',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9'
            },
            ticks: {
              callback: function(val) {
                return '฿' + (val >= 1000 ? (val / 1000) + 'k' : val);
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: {
                family: 'Prompt'
              }
            }
          }
        }
      }
    });
  },

  /**
   * 50/30/20 Rule Distribution Analysis
   */
  renderRule503020(transactions, categories, profile) {
    const container = document.getElementById('rule-analysis-content');
    if (!container) return;

    const monthlyIncome = profile.monthlyIncome || 65000;
    const targetNeeds = monthlyIncome * 0.50;
    const targetWants = monthlyIncome * 0.30;
    const targetSavings = monthlyIncome * 0.20;

    // Map category to rule type
    const categoryRuleMap = {};
    categories.expense.forEach(c => {
      categoryRuleMap[c.id] = c.ruleType || 'wants';
    });

    let actualNeeds = 0;
    let actualWants = 0;

    transactions.filter(t => t.type === 'expense').forEach(t => {
      const type = categoryRuleMap[t.categoryId] || 'wants';
      if (type === 'needs') actualNeeds += Number(t.amount);
      else actualWants += Number(t.amount);
    });

    const totalSpent = actualNeeds + actualWants;
    const actualSavings = Math.max(0, monthlyIncome - totalSpent);

    const needsPct = Math.min(100, Math.round((actualNeeds / targetNeeds) * 100));
    const wantsPct = Math.min(100, Math.round((actualWants / targetWants) * 100));
    const savingsPct = Math.min(100, Math.round((actualSavings / targetSavings) * 100));

    // Update mini-bars on dashboard hero too
    const needsStatusEl = document.getElementById('needs-status');
    const wantsStatusEl = document.getElementById('wants-status');
    const savingsStatusEl = document.getElementById('savings-status');
    const needsBarEl = document.getElementById('needs-bar');
    const wantsBarEl = document.getElementById('wants-bar');
    const savingsBarEl = document.getElementById('savings-bar');

    if (needsStatusEl) needsStatusEl.innerText = `฿${actualNeeds.toLocaleString()} / ฿${targetNeeds.toLocaleString()}`;
    if (wantsStatusEl) wantsStatusEl.innerText = `฿${actualWants.toLocaleString()} / ฿${targetWants.toLocaleString()}`;
    if (savingsStatusEl) savingsStatusEl.innerText = `฿${actualSavings.toLocaleString()} / ฿${targetSavings.toLocaleString()}`;

    if (needsBarEl) needsBarEl.style.width = `${needsPct}%`;
    if (wantsBarEl) wantsBarEl.style.width = `${wantsPct}%`;
    if (savingsBarEl) savingsBarEl.style.width = `${savingsPct}%`;

    // Render detailed breakdown in Analytics tab
    container.innerHTML = `
      <div class="rule-bar-item">
        <div class="rule-bar-head">
          <span><strong>🥗 ค่าใช้จ่ายจำเป็น (Needs - 50%)</strong>: อาหาร, น้ำมัน, ค่าห้อง</span>
          <span><strong>฿${actualNeeds.toLocaleString()}</strong> / ฿${targetNeeds.toLocaleString()} (${needsPct}%)</span>
        </div>
        <div class="progress-track sm"><div class="progress-fill emerald" style="width: ${needsPct}%;"></div></div>
      </div>

      <div class="rule-bar-item">
        <div class="rule-bar-head">
          <span><strong>🛍️ ค่าใช้จ่ายตามใจ (Wants - 30%)</strong>: ช้อปปิ้ง, คาเฟ่, บันเทิง</span>
          <span><strong>฿${actualWants.toLocaleString()}</strong> / ฿${targetWants.toLocaleString()} (${wantsPct}%)</span>
        </div>
        <div class="progress-track sm"><div class="progress-fill blue" style="width: ${wantsPct}%;"></div></div>
      </div>

      <div class="rule-bar-item">
        <div class="rule-bar-head">
          <span><strong>💎 เงินออมและลงทุน (Savings - 20%)</strong>: กองทุนฉุกเฉิน, หุ้น</span>
          <span><strong>฿${actualSavings.toLocaleString()}</strong> / ฿${targetSavings.toLocaleString()} (${savingsPct}%)</span>
        </div>
        <div class="progress-track sm"><div class="progress-fill purple" style="width: ${savingsPct}%;"></div></div>
      </div>
    `;
  }
};
