document.addEventListener('DOMContentLoaded', () => {
    // Configuration for the first set of calculations
    const config1 = {
        propertyValue: 2000000,
    };

    // Function to get the deposit value from the HTML
    function getDepositValue() {
        const depositText = document.getElementById('depositTd').textContent;
        // Remove the currency symbol and non-numeric characters except periods
        const numericText = depositText.replace(/[^0-9.]/g, '');
        // Treat periods as thousands separators and remove them
        const valueWithoutSeparators = numericText.replace(/\./g, '');
        return parseFloat(valueWithoutSeparators); // Convert to a numeric value
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

    // Function to get the selected option name from the HTML
    function getOptionName() {
        const optionNameElement = document.getElementById('optionNameTd');
        if (!optionNameElement) {
            console.error("optionNameTd element not found!");
            return "Unknown Option"; // Fallback to a default name
        }
        return optionNameElement.textContent.trim(); // Get the selected option name
    }

    // Predefined values for the first set of calculations
    const costs1 = {
        MonthlyExpenses: 2000,
        InterestRate: 30000,
        MortgageEligibility: 0,
        Affordability: getWorkTotalValue(), // Use the value here
        Deposit: getDepositValue(),
        MonthlyPayment: 3161,
        OptionName: getOptionName(), // Add the selected option name
    };

    // Display results for the first set of calculations
    function displayResults1(data) {
        const resultDiv = document.getElementById('result');
        const items = [
            ['Deposit', data.Deposit],
            ['Monthly Expenses', data.MonthlyExpenses],
            [`${data.OptionName} `, data.Affordability], // Use the dynamic name here
            ['Interest Rate', data.InterestRate],
            ['Monthly Payment', data.MonthlyPayment],
            ['Mortgage eligibility', data.MortgageEligibility],
        ];

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
                <span class="label">Total Revenue:</span>
                <span class="value">£${Math.round(Object.values(data).reduce((a, b) => a + b, 0)).toLocaleString()}</span>
            </div>
        `;
    }

    // Create pie chart for the first set of calculations
    function createChart1(data) {
        const ctx = document.getElementById('costChart').getContext('2d');
        const total = Object.values(data).reduce((sum, v) => sum + v, 0);
        const labels = Object.keys(data);
        const values = Object.values(data);

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#116530', '#2AA873', '#7ED957', '#A9E8B0',
                        '#DFF8E6', '#1B5E20', '#66BB6A'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 50
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            },
            plugins: [{
                id: 'customLabels',
                afterDraw(chart) {
                    const ctx = chart.ctx;
                    const { width, height } = chart;
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const radius = Math.min(width, height) / 2 * 0.75;

                    ctx.save();
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    chart.data.datasets[0].data.forEach((value, i) => {
                        const meta = chart.getDatasetMeta(0).data[i];
                        const angle = meta.startAngle + (meta.endAngle - meta.startAngle) / 2;
                        const percentage = ((value / total) * 100).toFixed(1) + '%';

                        // Line coordinates
                        const startX = centerX + Math.cos(angle) * radius;
                        const startY = centerY + Math.sin(angle) * radius;
                        const endX = centerX + Math.cos(angle) * (radius + 15);
                        const endY = centerY + Math.sin(angle) * (radius + 15);

                        // Draw line
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.strokeStyle = '#333';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // Draw label with an offset
                        const textX = endX + (Math.cos(angle) * 20);
                        const textY = endY + (Math.sin(angle) * 20);
                        ctx.fillStyle = '#333';
                        ctx.textAlign = Math.cos(angle) > 0 ? 'left' : 'right';
                        ctx.fillText(`${labels[i]} (${percentage})`, textX, textY);
                    });

                    ctx.restore();
                }
            }]
        });
    }

    // Initialize the first set of calculations
    displayResults1(costs1);
    createChart1(costs1);

    // Observe changes to the totalCostTd and optionNameTd elements
    const totalCostElement = document.getElementById('totalCostTd');
    const optionNameElement = document.getElementById('optionNameTd');

    if (totalCostElement && optionNameElement) {
        const observer = new MutationObserver(() => {
            // Update the Affordability value and OptionName in costs1
            costs1.Affordability = getWorkTotalValue();
            costs1.OptionName = getOptionName();

            // Re-display results and update the chart
            displayResults1(costs1);
            createChart1(costs1);
        });

        observer.observe(totalCostElement, {
            childList: true, // Observe changes to the text content
            characterData: true, // Observe changes to the text content
            subtree: true // Observe changes in all descendants
        });

        observer.observe(optionNameElement, {
            childList: true, // Observe changes to the text content
            characterData: true, // Observe changes to the text content
            subtree: true // Observe changes in all descendants
        });
    } else {
        console.error("totalCostTd or optionNameTd element not found!");
    }

    // ... (rest of your existing code for the second set of calculations)
});