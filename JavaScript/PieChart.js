document.addEventListener('DOMContentLoaded', () => {
    // Configuration for the first set of calculations

    // Function to get the deposit value from the HTML
    function getDepositValue() {
        const depositText = document.getElementById('depositTd').textContent;
        // Remove the currency symbol and non-numeric characters except periods
        const numericText = depositText.replace(/[^0-9.]/g, '');
        // Treat periods as thousands separators and remove them
        const valueWithoutSeparators = numericText.replace(/\./g, '');
        const value = parseFloat(valueWithoutSeparators);

        if (isNaN(value)) {
            console.error("Invalid deposit value extracted:", depositText);
            return 0; // Fallback to 0 if the value is invalid
        }

        return value;
    }

    function getProprtyValue() {
        const depositText = document.getElementById('propertyPriceTd').textContent;
        // Remove the currency symbol and non-numeric characters except periods
        const numericText = depositText.replace(/[^0-9.]/g, '');
        // Treat periods as thousands separators and remove them
        const valueWithoutSeparators = numericText.replace(/\./g, '');
        const value = parseFloat(valueWithoutSeparators);

        if (isNaN(value)) {
            console.error("Invalid deposit value extracted:", depositText);
            return 0; // Fallback to 0 if the value is invalid
        }

        return value;
    }

    const currentValue = document.getElementById('propertyPriceTd').textContent;

    function x(currentValue, annualGrowthRate, years) {
        // Calculate future value using the compound growth formula
        return currentValue * Math.pow(1 + annualGrowthRate, years);
    }

    // Input values
    const currentPropertyValue = 600000; // Current property value in GBP
    const annualGrowthRate = 0.055; // 5.5% annual growth rate (based on historical data)
    const years = 25; // Number of years

    // Get the future property value
    const futurePropertyValue = x(currentPropertyValue, annualGrowthRate, years);

    function getTotalLoanCost() {
        const depositText = document.getElementById('totalMortgageCostTd').textContent;
        // Remove the currency symbol and non-numeric characters except periods
        const numericText = depositText.replace(/[^0-9.]/g, '');
        // Treat periods as thousands separators and remove them
        const valueWithoutSeparators = numericText.replace(/\./g, '');
        const value = parseFloat(valueWithoutSeparators);

        if (isNaN(value)) {
            console.error("Invalid deposit value extracted:", depositText);
            return 0; // Fallback to 0 if the value is invalid
        }

        return value;
    }

    // Function to get the total work value from the HTML
    function getWorkTotalValue() {
        const totalCostElement = document.getElementById('totalCostTd');
        if (!totalCostElement) {
            console.error("totalCostTd element not found!");
            return 0; // Fallback to 0 if the element doesn't exist
        }

        const depositText = totalCostElement.textContent;
        console.log("totalCostTd content:", depositText); // Debugging log

        const numericText = depositText.replace(/[^0-9.]/g, '');
        const valueWithoutSeparators = numericText.replace(/\./g, '');
        const value = parseFloat(valueWithoutSeparators);

        if (isNaN(value)) {
            console.error("Invalid value extracted from totalCostTd:", depositText);
            return 0; // Fallback to 0 if the value is invalid
        }

        return value;
    }

    function updateTotalExpenses() {
        return getWorkTotalValue() + getTotalLoanCost();
    }

    function getOptionName() {
        const optionNameElement = document.getElementById('optionNameTd');
        if (!optionNameElement) {
            console.error("optionNameTd element not found!");
            return "Unknown Option"; // Fallback to a default name
        }
        return optionNameElement.textContent.trim(); // Get the selected option name
    }

    // Function to recalculate costs1 dynamically
    function calculateCosts1() {
        return {
            MortgageEligibility: futurePropertyValue,
            Deposit: updateTotalExpenses(),
        };
    }

    // Function to display results
    function displayResults1(data) {
        const resultDiv = document.getElementById('result');
        const items = [
            ['Future Price', data.MortgageEligibility],
            ['Total Expences', data.Deposit],
        ];

        const totalRevenue = data.MortgageEligibility - data.Deposit
   
        // Create HTML for the results
        resultDiv.innerHTML = `
            <h3>Total Revenue</h3>
            ${items.map(([name, value]) => `
                <div class="cost-item">
                    <span class="label">${name}:</span>
                    <span class="value">£${Math.round(value).toLocaleString()}</span>
                </div>
            `).join('')}
            <div class="cost-item total">
                <span class="label">Profit:</span>
                <span class="value">£${Math.round(totalRevenue).toLocaleString()}</span>
            </div>
        `;
    }

    // --- SVG pie builder helper functions (replaces canvas charts) ---

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
        if (!svg || !legend) return; // defensive

        while (svg.firstChild) svg.removeChild(svg.firstChild);
        while (legend.firstChild) legend.removeChild(legend.firstChild);

        const cx = 100, cy = 100, r = 92;
        let angle = 0;

        if (!total || total <= 0) {
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bg.setAttribute('cx', cx);
            bg.setAttribute('cy', cy);
            bg.setAttribute('r', r);
            bg.setAttribute('fill', '#eee');
            svg.appendChild(bg);

            const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            hole.setAttribute('cx', cx); hole.setAttribute('cy', cy); hole.setAttribute('r', 52);
            hole.setAttribute('fill', '#fdfcf9');
            svg.appendChild(hole);

            const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            fo.setAttribute('x', cx - 45); fo.setAttribute('y', cy - 22);
            fo.setAttribute('width', 90); fo.setAttribute('height', 44);
            fo.innerHTML = `<div class="center-total" xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;"><span class="amt">£0</span><span class="lbl">${prefix === 'costs' ? 'Total' : 'Upfront'}</span></div>`;
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
        fo.innerHTML = `<div class="center-total" xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;"><span class="amt">£${Math.round(total).toLocaleString()}</span><span class="lbl">${prefix === 'costs' ? 'Total' : 'Upfront'}</span></div>`;
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

    function createChart1(data) {
        const rows = [
            { label: 'Mortgage Eligibility', value: Math.round(data.MortgageEligibility || 0) },
            { label: 'Total Expenses', value: Math.round(data.Deposit || 0) }
        ];
        const palette = ['#b71c1c', '#2e7d32', '#ff7043', '#ffc107', '#1b5e20'];
        buildPieSection('costs', { palette, rows });
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
        // Map and sort rows from highest to lowest value
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

    updateEverything();

    const totalCostElement = document.getElementById('totalCostTd');
    const optionNameElement = document.getElementById('optionNameTd');

    if (totalCostElement && optionNameElement) {
        const observer = new MutationObserver(() => {
            updateEverything();
        });

        observer.observe(totalCostElement, { childList: true, characterData: true, subtree: true });
        observer.observe(optionNameElement, { childList: true, characterData: true, subtree: true });

        const depositElement = document.getElementById('depositTd');
        if (depositElement) {
            observer.observe(depositElement, { childList: true, characterData: true, subtree: true });
        }
    } else {
        console.error('totalCostTd or optionNameTd element not found!');
    }

    function formatNumber(number) {
        return number.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

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

        // Sort items2 from highest to lowest cost based on the data object
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