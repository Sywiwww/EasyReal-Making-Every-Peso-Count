/**
 * =========================================================================
 * DATABASE READY ARCHITECTURE
 * * To integrate with a backend API later:
 * Replace this object container 'mockDatabase' with a native fetch() request.
 * e.g., const response = await fetch('/api/dashboard-data');
 * =========================================================================
 */

const mockDatabase = {
    storeIncome: [
        { id: 101, date: "2026-06-12", amount: 4500 },
        { id: 102, date: "2026-06-13", amount: 5200 },
        { id: 103, date: "2026-06-14", amount: 3800 }
    ],
    storeExpenses: [
        { id: 201, date: "2026-06-10", item: "Coke & Softdrinks", amount: 2500 },
        { id: 202, date: "2026-06-12", item: "Puregold Grocery Restock", amount: 6000 }
    ],
    householdExpenses: [
        { id: 301, category: "💡 Kuryente (Meralco)", detail: "Bill for June", amount: 3200 },
        { id: 302, category: "💧 Tubig", detail: "Bill for June", amount: 450 },
        { id: 303, category: "🏫 Baon ni Bunso", detail: "Weekly allowance", amount: 1000 }
    ],
    loans: [
        { id: 401, bankName: "Card Bank", amountDue: 1500, dueDate: "2026-06-18", contact: "0917-123-4567", status: "Unpaid" },
        { id: 402, bankName: "SSS Salary Loan", amountDue: 2100, dueDate: "2026-06-30", contact: "N/A", status: "Unpaid" },
        { id: 403, bankName: "Pag-IBIG Housing", amountDue: 5000, dueDate: "2026-07-05", contact: "Direct Auto-debit", status: "Paid" }
    ]
};

// --- INITIAL ENGINE TRIGGER ---
document.addEventListener("DOMContentLoaded", () => {
    calculateAndRenderDashboard();
});

/**
 * CORE LOGIC ENGINE
 * Calculates metrics and populates elements.
 */
function calculateAndRenderDashboard() {
    
    // 1. Calculations Using Functional Arrays (Matches typical backend query structures)
    const totalStoreIncome = mockDatabase.storeIncome.reduce((acc, row) => acc + row.amount, 0);
    
    const totalStoreExpense = mockDatabase.storeExpenses.reduce((acc, row) => acc + row.amount, 0);
    const totalHouseholdExpense = mockDatabase.householdExpenses.reduce((acc, row) => acc + row.amount, 0);
    const totalCombinedExpenses = totalStoreExpense + totalHouseholdExpense;
    
    const remainingMoney = totalStoreIncome - totalCombinedExpenses;

    // Filter Unpaid Loans
    const unpaidLoans = mockDatabase.loans.filter(loan => loan.status === "Unpaid");
    
    // Find Next Closest Due Loan
    let nextDueLoan = { amountDue: 0, dueDate: "Walang Due" };
    if (unpaidLoans.length > 0) {
        // Sort by earliest ascending order date
        const sortedLoans = [...unpaidLoans].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        nextDueLoan = sortedLoans[0];
    }

    // 2. Render Values to Top Summary Metrics Cards
    document.getElementById("total-income").innerText = formatPHP(totalStoreIncome);
    document.getElementById("total-expenses").innerText = formatPHP(totalCombinedExpenses);
    document.getElementById("remaining-money").innerText = formatPHP(remainingMoney);
    document.getElementById("next-due-amount").innerText = formatPHP(nextDueLoan.amountDue);
    document.getElementById("next-due-date").innerText = `Petsa: ${nextDueLoan.dueDate}`;
    document.getElementById("unpaid-loans-count").innerText = `${unpaidLoans.length} Unpaid`;

    // 3. Dynamic Sub-Table Content Generators
    renderStoreIncomeTable();
    renderStoreExpenseTable();
    renderHouseholdExpenseTable();
    renderLoansTable();

    // 4. Generate Simple Analytical Text Insights
    renderInsights(unpaidLoans, totalHouseholdExpense, totalStoreIncome);
}

/* --- FORMAT HELPER --- */
function formatPHP(value) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
}

/* --- DOM INJECTION METHODS --- */
function renderStoreIncomeTable() {
    const tbody = document.getElementById("store-income-table");
    tbody.innerHTML = mockDatabase.storeIncome.map(row => `
        <tr data-income-id="${row.id}">
            <td><b>${row.date}</b></td>
            <td class="trend-up"><b>+ ${formatPHP(row.amount)}</b></td>
        </tr>
    `).join('');
}

function renderStoreExpenseTable() {
    const tbody = document.getElementById("store-expense-table");
    tbody.innerHTML = mockDatabase.storeExpenses.map(row => `
        <tr data-expense-id="${row.id}">
            <td>${row.date}</td>
            <td>${row.item}</td>
            <td style="color: var(--color-expense); font-weight:600;">- ${formatPHP(row.amount)}</td>
        </tr>
    `).join('');
}

function renderHouseholdExpenseTable() {
    const tbody = document.getElementById("household-expense-table");
    tbody.innerHTML = mockDatabase.householdExpenses.map(row => `
        <tr data-house-id="${row.id}">
            <td><b>${row.category}</b></td>
            <td>${row.detail}</td>
            <td style="color: var(--color-expense); font-weight:600;">- ${formatPHP(row.amount)}</td>
        </tr>
    `).join('');
}

function renderLoansTable() {
    const tbody = document.getElementById("loans-table");
    tbody.innerHTML = mockDatabase.loans.map(row => {
        const statusClass = row.status === "Paid" ? "badge-success" : "badge-danger";
        return `
            <tr data-loan-id="${row.id}">
                <td><b>${row.bankName}</b></td>
                <td><b>${formatPHP(row.amountDue)}</b></td>
                <td><span style="color: var(--color-warning); font-weight:700;">${row.dueDate}</span></td>
                <td>${row.contact}</td>
                <td><span class="badge ${statusClass}">${row.status}</span></td>
            </tr>
        `;
    }).join('');
}

function renderInsights(unpaidLoans, householdCost, income) {
    const container = document.getElementById("insights-container");
    let messages = [
        "📈 Maganda ang pasok ng benta ng iyong tindahan ngayong linggo.",
    ];

    if (unpaidLoans.length > 0) {
        messages.push(`⚠️ Mayroon kang ${unpaidLoans.length} bayarin o utang na kailangang i-settle sa lalong madaling panahon.`);
    }
    if (householdCost > (income * 0.4)) {
        messages.push("💡 Paalala: Medyo malaki ang nagastos sa pambahay ngayong buwan. Bawasan ang mga hindi importanteng binibili.");
    }

    container.innerHTML = messages.map(msg => `<li>${msg}</li>`).join('');
}

/**
 * SIDEBAR TAB NAVIGATION SYSTEM
 */
function switchTab(tabName) {
    const links = document.querySelectorAll(".nav-links a");
    links.forEach(link => link.classList.remove("active"));
    
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add("active");
    }

    const blocks = document.querySelectorAll(".content-block");
    blocks.forEach(block => {
        const sectionAttr = block.getAttribute("data-section");
        
        // General behavior: Hide calculator on 'all' view to prevent crowding tables
        if (tabName === "all") {
            if (sectionAttr === "calculator") {
                block.style.display = "none";
            } else {
                block.style.display = "block";
            }
        } else if (sectionAttr === tabName || block.classList.contains("insights-block")) {
            block.style.display = "block";
        } else {
            block.style.display = "none";
        }
    });
}

/**
 * NATIVE CALCULATOR ENGINE ENGINE LOGIC
 */
let calcExpression = "";

function pressNum(num) {
    const screen = document.getElementById("calc-screen");
    if (screen.value === "0" && num !== ".") {
        calcExpression = num;
    } else {
        calcExpression += num;
    }
    screen.value = calcExpression;
}

function pressOp(op) {
    const screen = document.getElementById("calc-screen");
    // Ensure we don't chain double operators accidentally
    if (calcExpression !== "" && !["+","-","*","/"].includes(calcExpression.slice(-1))) {
        calcExpression += op;
        screen.value = calcExpression;
    }
}

function clearCalc() {
    calcExpression = "";
    document.getElementById("calc-screen").value = "0";
}

function calculateResult() {
    const screen = document.getElementById("calc-screen");
    if (calcExpression === "") return;
    try {
        // Safe standard token computation implementation mapping
        const result = new Function(`return ${calcExpression}`)();
        calcExpression = String(result);
        screen.value = calcExpression;
    } catch (e) {
        screen.value = "Error";
        calcExpression = "";
    }
}