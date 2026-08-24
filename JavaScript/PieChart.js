document.addEventListener("DOMContentLoaded", function () {
    const resultsDiv = document.getElementById("results123");
    const priceElement = document.getElementById("propertyPrice");
    const detailsElement = document.getElementById("details");
    const depositPercentage = 5; // Deposit percentage
    const interestRate = 3.5; // Annual interest rate in percentage
    const loanTerm = 25; // Loan term in years

    // Function to extract and clean the property price
    function getPropertyPrice() {
        const priceText = priceElement.innerText.trim();
        return parseFloat(priceText.replace(/[^0-9.]/g, '')); // Remove non-numeric characters
    }

    // Function to extract size and convert to square meters
    function getSizeInSquareMeters() {
        const detailsText = detailsElement.innerText.trim();
        const sizeMatch = detailsText.match(/(Land Size|Size): ([\d,]+) sq\. ft\./); // Extract size using regex

        if (!sizeMatch) {
            console.error("Size not found in the details string.");
            return { sizeSqMeters: null, isLandSize: false }; // Return null if size is not found
        }

        const sizeType = sizeMatch[1]; // "Land Size" or "Size"
        const sizeSqFt = parseFloat(sizeMatch[2].replace(/,/g, '')); // Remove commas and convert to number
        const sizeSqMeters = sizeSqFt * 0.092903; // Convert square feet to square meters
        return {
            sizeSqMeters: Math.round(sizeSqMeters * 100) / 100, // Round to 2 decimal places
            isLandSize: sizeType === "Land Size" // Check if it's Land Size
        };
    }

    // Function to calculate monthly mortgage payment
    function calculateMonthlyPayment(principal, annualInterestRate, loanTermYears) {
        const monthlyInterestRate = (annualInterestRate / 100) / 12; // Convert to monthly rate
        const numberOfPayments = loanTermYears * 12; // Total number of payments
        const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
        const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
        return principal * (numerator / denominator); // Monthly payment
    }

    // Function to calculate total mortgage cost
    function calculateTotalMortgageCost(monthlyPayment, loanTermYears) {
        return monthlyPayment * loanTermYears * 12; // Total cost over the loan term
    }

    // Function to format numbers with commas as thousand separators
    function formatNumber(number) {
        return number.toLocaleString('en-US', { maximumFractionDigits: 0 }); // Use US locale for commas
    }

    // Function to get the total work value from the HTML
    function getWorkTotalValue() {
        const totalCostElement = document.getElementById('totalCostTd');
        if (!totalCostElement) {
            console.error("totalCostTd element not found!");
            return 0; // Fallback to 0 if the element doesn't exist
        }

        const depositText = totalCostElement.textContent;
        const numericText = depositText.replace(/[^0-9.]/g, '');
        const valueWithoutSeparators = numericText.replace(/\./g, '');
        const value = parseFloat(valueWithoutSeparators);

        if (isNaN(value)) {
            console.error("Invalid value extracted from totalCostTd:", depositText);
            return 0; // Fallback to 0 if the value is invalid
        }

        return value;
    }

    // Helper functions for reading table cells safely
    function getDepositValue() {
        const depositText = document.getElementById('depositTd').textContent;
        const numericText = depositText.replace(/[^0-9.]/g, '');
        return parseFloat(numericText.replace(/\./g, '')) || 0;
    }

    function getProprtyValue() {
        const priceText = document.getElementById('propertyPriceTd').textContent;
        const numericText = priceText.replace(/[^0-9.]/g, '');
        return parseFloat(numericText.replace(/\./g, '')) || 0;
    }

    function getTotalLoanCost() {
        const mortgageText = document.getElementById('totalMortgageCostTd').textContent;
        const numericText = mortgageText.replace(/[^0-9.]/g, '');
        return parseFloat(numericText.replace(/\./g, '')) || 0;
    }

    // Define costs for each option
    const optionCosts = {
        refurbish: {
            name: "Refurbishment",
            costPerSqm: 1250
        },
        demolish: {
            name: "Demolition",
            costPerSqm: 75
        },
        build: {
            name: "New Build",
            costPerSqm: 2250
        },
        container_button: {
            name: "Container Home",
            costPerSqm: 750
        }
    };

    // Function to display results
    function displayResults(option) {
        const propertyPrice = getPropertyPrice();
        const { sizeSqMeters, isLandSize } = getSizeInSquareMeters(); // Get size and type
        const costs = { ...optionCosts[option] }; // Copy option costs

        // Update dynamic costs based on property size
        if (sizeSqMeters !== null) {
            if (option === "refurbish" || option === "demolish" || option === "build" || option === "container_button") {
                costs.totalCost = costs.costPerSqm * sizeSqMeters;
            }
        }

        // Update the name, cost per square meter, and total cost in the table
        document.getElementById("optionNameTd").textContent = costs.name;
        document.getElementById("costPerSqmTd").textContent = `£${formatNumber(costs.costPerSqm)}`;
        document.getElementById("totalCostTd").textContent = `£${formatNumber(costs.totalCost)}`;

        // Update the property price and deposit in the first table
        document.getElementById("propertyPriceTd").textContent = `£${formatNumber(propertyPrice)}`;
        document.getElementById("depositTd").textContent = `£${formatNumber(propertyPrice * (depositPercentage / 100))}`;
        document.getElementById("propertySizeTd").textContent = `${sizeSqMeters} m²`;

        // Calculate and update mortgage information
        const deposit = propertyPrice * (depositPercentage / 100);
        const loanPrincipal = propertyPrice - deposit; // Loan amount after deposit
        const monthlyPayment = calculateMonthlyPayment(loanPrincipal, interestRate, loanTerm);
        const totalMortgageCost = calculateTotalMortgageCost(monthlyPayment, loanTerm);

        // Update the mortgage table
        document.getElementById("interestRateTd").textContent = `${interestRate}%`;
        document.getElementById("loanTermTd").textContent = `${loanTerm} years`;
        document.getElementById("monthlyPaymentTd").textContent = `£${formatNumber(monthlyPayment)}`;
        document.getElementById("totalMortgageCostTd").textContent = `£${formatNumber(totalMortgageCost)}`;

        // Handle "Not Applicable" for Refurbish and Demolish if it's Land Size
        if (isLandSize) {
            const refurbishButton = document.querySelector(".button.refurbish");
            const demolishButton = document.querySelector(".button.demolish");
            if (refurbishButton) {
                refurbishButton.textContent = "Not Applicable";
                refurbishButton.disabled = true;
            }
            if (demolishButton) {
                demolishButton.textContent = "Not Applicable";
                demolishButton.disabled = true;
            }
        }

        // Trigger chart and text summary updates
        updateEverything();
    }

    // Attach event listeners to buttons
    document.querySelectorAll(".button").forEach(button => {
        button.addEventListener("click", () => {
            const option = button.classList[1]; // Get the option from the button's class
            if (option) displayResults(option); // Display results for the selected option
        });
    });

    // --- Growth calculation for future value ---
    function calculateFutureValue() {
        const currentVal = getProprtyValue();
        const annualGrowthRate = 0.055; // 5.5% annual growth rate
        const years = 25;
        return currentVal * Math.pow(1 + annualGrowthRate, years);
    }

    function calculateCosts1() {
        const futurePrice = calculateFutureValue();
        const totalExpenses = getDepositValue() + getWorkTotalValue() + getTotalLoanCost();
        const profit = futurePrice - totalExpenses;
        return {
            MortgageEligibility: futurePrice,
            Deposit: totalExpenses,
            Profit: profit
        };
    }

    // Function to display results for section 1
    function displayResults1(data) {
        const resultDiv = document.getElementById('result');
        const futurePrice = data.MortgageEligibility;
        const totalExpenses = data.Deposit;
        const totalRevenue = data.Profit;

        resultDiv.innerHTML = `
            <h3>Total Revenue</h3>
            <div class="cost-item">
                <span class="label">Future Price in (25 years):</span>
                <span class="value">£${Math.round(futurePrice).toLocaleString()}</span>
            </div>
            <div class="cost-item">
                <span class="label">Total Expenses:</span>
                <span class="value">£${Math.round(totalExpenses).toLocaleString()}</span>
            </div>
            <div class="cost-item total">
                <span class="label">Profit:</span>
                <span class="value">£${Math.round(totalRevenue).toLocaleString()}</span>
            </div>
        `;
    }

    // --- SVG pie builder helper functions ---
    function polar(cx, cy, r, angleDeg) {
        const a = (angleDeg - 90) * Math.PI / 180;
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    }

    function arcPath(cx, cy, r, startAngle, endAngle) {
        const start = polar(cx, cy, r, endAngle);
        const end = polar(cx, cy, r, startAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
    }

    function buildPieSection(prefix, data) {
        const total = data.rows.reduce((s, r) => s + r.value, 0);
        const svg = document.getElementById(`pie-${prefix}`);
        const legend = document.getElementById(`legend-${prefix}`);
        const tooltip = document.getElementById(`tooltip-${prefix}`);
        if (!svg || !legend) return;

        while (svg.firstChild) svg.removeChild(svg.firstChild);
        while (legend.firstChild) legend.removeChild(legend.firstChild);

        const cx = 100, cy = 100, r = 92;
        let angle = 0;

        if (!total || total <= 0) {
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
            bg.setAttribute('fill', '#eee');
            svg.appendChild(bg);

            const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            hole.setAttribute('cx', cx); hole.setAttribute('cy', cy); hole.setAttribute('r', 52);
            hole.setAttribute('fill', '#fdfcf9');
            svg.appendChild(hole);

            const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            fo.setAttribute('x', cx - 45); fo.setAttribute('y', cy - 22);
            fo.setAttribute('width', 90); fo.setAttribute('height', 44);
            fo.innerHTML = `<div class="center-total" xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;"><span class="amt">£0</span><span class="lbl">Upfront</span></div>`;
            svg.appendChild(fo);

            data.rows.forEach((row, i) => {
                const li = document.createElement('li');
                li.dataset.index = i;
                li.innerHTML = `<span class="swatch" style="background:#ccc"></span><span class="lname">${row.label}</span><span class="lpct">0%</span>`;
                legend.appendChild(li);
            });
            return;
        }

        data.rows.forEach((row, i) => {
            const color = data.palette[i % data.palette.length];
            const pct = total > 0 ? row.value / total * 100 : 0;
            const sweep = pct / 100 * 360;

            const li = document.createElement('li');
            li.dataset.index = i;
            li.innerHTML = `<span class="swatch" style="background:${color}"></span><span class="lname">${row.label}</span><span class="lpct">${pct.toFixed(0)}%</span>`;
            legend.appendChild(li);

            if (sweep > 0.0001) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', arcPath(cx, cy, r, angle, angle + sweep));
                path.setAttribute('fill', color);
                path.setAttribute('data-index', i);
                path.setAttribute('aria-label', `${row.label}: ${row.value} (${pct.toFixed(1)}%)`);
                svg.appendChild(path);
            }

            angle += sweep;
        });

        const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hole.setAttribute('cx', cx); hole.setAttribute('cy', cy); hole.setAttribute('r', 52);
        hole.setAttribute('fill', '#fdfcf9');
        svg.appendChild(hole);

        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fo.setAttribute('x', cx - 45); fo.setAttribute('y', cy - 22);
        fo.setAttribute('width', 90); fo.setAttribute('height', 44);
        fo.innerHTML = `<div class="center-total" xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;"><span class="amt">£${Math.round(total).toLocaleString()}</span><span class="lbl">Upfront</span></div>`;
        svg.appendChild(fo);

        function setActive(i) {
            svg.querySelectorAll('path').forEach(p => p.classList.toggle('is-active', p.dataset.index === String(i)));
            legend.querySelectorAll('li').forEach(l => l.style.opacity = (i === null || l.dataset.index === String(i)) ? '1' : '0.45');
        }

        function showTooltip(e, i) {
            const row = data.rows[i];
            const pct = total > 0 ? (row.value / total * 100).toFixed(1) : '0.0';
            if (!tooltip) return;
            tooltip.textContent = `${row.label} — £${row.value.toLocaleString()} (${pct}%)`;
            tooltip.classList.add('show');
            const parentBounds = svg.parentElement.getBoundingClientRect();
            tooltip.style.left = (e.clientX - parentBounds.left) + 'px';
            tooltip.style.top = (e.clientY - parentBounds.top) + 'px';
        }

        svg.querySelectorAll('path').forEach(p => {
            p.addEventListener('mousemove', e => { setActive(p.dataset.index); showTooltip(e, +p.dataset.index); });
            p.addEventListener('mouseleave', () => { setActive(null); if (tooltip) tooltip.classList.remove('show'); });
            p.addEventListener('focus', () => setActive(p.dataset.index));
            p.addEventListener('blur', () => setActive(null));
        });

        legend.querySelectorAll('li').forEach(li => {
            li.addEventListener('mouseenter', () => setActive(li.dataset.index));
            li.addEventListener('mouseleave', () => setActive(null));
        });
    }

    // UPDATED: Bar Chart showing Future Value, Total Expenses, and Profit side-by-side
// UPDATED: Centered Bar Chart with text legend removed
<<<<<<< HEAD
    // UPDATED: Bar Chart with percentages centered inside each bar
=======
>>>>>>> 2a6c26b7a17097763e91c903a315f2123b997a78
    function createBarChart(futurePrice, totalExpenses, profit) {
        const svg = document.getElementById('pie-costs');
        const legend = document.getElementById('legend-costs');
        if (!svg || !legend) return;

<<<<<<< HEAD
        // Clear existing chart elements and right-hand text legend
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        while (legend.firstChild) legend.removeChild(legend.firstChild);

        const maxVal = Math.max(futurePrice, 1);
        const width = 280, height = 200;
=======
        // Clear existing chart elements and the right-hand text legend
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        while (legend.firstChild) legend.removeChild(legend.firstChild);

        const maxVal = Math.max(futurePrice, totalExpenses, profit, 1);
        const width = 280, height = 200; // Expanded width to center the 3 bars nicely
>>>>>>> 2a6c26b7a17097763e91c903a315f2123b997a78
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const barWidth = 45;
        const maxHeight = 120;
        
        const h1 = (futurePrice / maxVal) * maxHeight;
        const h2 = (totalExpenses / maxVal) * maxHeight;
        const h3 = (profit / maxVal) * maxHeight;

        const y1 = height - 45 - h1;
        const y2 = height - 45 - h2;
        const y3 = height - 45 - h3;

<<<<<<< HEAD
        // Calculate percentages relative to Future Value (100%)
        const pctFuture = 100;
        const pctExpenses = Math.round((totalExpenses / futurePrice) * 100);
        const pctProfit = Math.round((profit / futurePrice) * 100);

=======
>>>>>>> 2a6c26b7a17097763e91c903a315f2123b997a78
        // 1. Future Value Bar (Blue)
        const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect1.setAttribute('x', '35'); rect1.setAttribute('y', y1);
        rect1.setAttribute('width', barWidth); rect1.setAttribute('height', h1);
        rect1.setAttribute('fill', '#1E88E5'); rect1.setAttribute('rx', '4');
        svg.appendChild(rect1);

        // 2. Expenses Bar (Red)
        const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect2.setAttribute('x', '115'); rect2.setAttribute('y', y2);
        rect2.setAttribute('width', barWidth); rect2.setAttribute('height', h2);
        rect2.setAttribute('fill', '#e53935'); rect2.setAttribute('rx', '4');
        svg.appendChild(rect2);

        // 3. Profit Bar (Green)
        const rect3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect3.setAttribute('x', '195'); rect3.setAttribute('y', y3);
        rect3.setAttribute('width', barWidth); rect3.setAttribute('height', h3);
        rect3.setAttribute('fill', '#43a047'); rect3.setAttribute('rx', '4');
        svg.appendChild(rect3);

<<<<<<< HEAD
        // Helper function to add percentage labels inside the bars
        function addBarLabel(text, x, y, barHeight) {
            // Only add text inside if the bar is tall enough to fit it cleanly
            if (barHeight > 25) {
                const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txt.setAttribute('x', x); 
                txt.setAttribute('y', y + barHeight / 2 + 4); // Center vertically
                txt.setAttribute('font-size', '11'); 
                txt.setAttribute('font-weight', 'bold');
                txt.setAttribute('text-anchor', 'middle');
                txt.setAttribute('fill', '#ffffff'); // White text for contrast inside colored bars
                txt.textContent = text;
                svg.appendChild(txt);
            }
        }

        addBarLabel(`${pctFuture}%`, 57, y1, h1);
        addBarLabel(`${pctExpenses}%`, 137, y2, h2);
        addBarLabel(`${pctProfit}%`, 217, y3, h3);

=======
>>>>>>> 2a6c26b7a17097763e91c903a315f2123b997a78
        // Centered Labels under bars
        const labels = [
            { text: 'Future Value', x: '57' },
            { text: 'Expenses', x: '137' },
            { text: 'Profit', x: '217' }
        ];

        labels.forEach(l => {
            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', l.x); txt.setAttribute('y', '175');
            txt.setAttribute('font-size', '11'); txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('fill', '#333'); txt.textContent = l.text;
            svg.appendChild(txt);
        });
<<<<<<< HEAD
=======

        // (Legend container left empty intentionally to remove the text block on the right)
>>>>>>> 2a6c26b7a17097763e91c903a315f2123b997a78
    }

    function createChart1(data) {
        createBarChart(data.MortgageEligibility, data.Deposit, data.Profit);
    }

    const items2 = [
        ['Mortgage Broker Fees', 'MortgageBroker'],
        ['EPC Certificate', 'EPC'],
        ['Legal Fees', 'Legal'],
        ['Survey Costs', 'Survey'],
        ['Estate Agent Fees (1.75%)', 'EstateAgent'],
        ['Mortgage Fees', 'MortgageFees'],
        ['Deposit', 'Deposit'],
    ];

    function createChart2(data) {
        const rows = items2
            .map(([name, key]) => ({ label: name, value: Math.round(data[key] || 0) }))
            .sort((a, b) => b.value - a.value);

        const palette = ['#2f5233', '#45607f', '#b8863b', '#7a6a5b', '#66bb6a', '#d32f2f', '#1b5e20'];
        buildPieSection('upfront', { palette, rows });
    }

    function updateEverything() {
        const costs1 = calculateCosts1();
        displayResults1(costs1);
        createChart1(costs1);

        const costs2 = calculateCosts();
        displayResults2(costs2);
        createChart2(costs2);
    }

    // Initialize with default option
    displayResults("build");

    function calculateCosts() {
        const propertyValue = getProprtyValue();
        const costs = {
            EstateAgent: propertyValue * 0.0175,
            EPC: 500,
            MortgageBroker: 500,
            Legal: 1800,
            Survey: 600,
            MortgageFees: 1000,
            Deposit: getDepositValue()
        };
        costs.totalUpfront = Object.values(costs).reduce((a, b) => a + b, 0);
        return costs;
    }

    function displayResults2(data) {
        const resultDiv = document.getElementById('result2');
        const sortedItems = [...items2].sort(([, keyA], [, keyB]) => data[keyB] - data[keyA]);

        resultDiv.innerHTML = `
            <h3>Upfront Costs Breakdown</h3>
            ${sortedItems.map(([name, key]) => `
                <div class="cost-item">
                    <span class="label">${name}:</span>
                    <span class="value">£${formatNumber(data[key])}</span>
                </div>
            `).join('')}
            <div class="cost-item total">
                <span class="label">Total Upfront Costs:</span>
                <span class="value">£${formatNumber(data.totalUpfront)}</span>
            </div>
        `;
    }
});
