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
        container: {
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
            if (option === "refurbish" || option === "demolish" || option === "build" || option === "container") {
                costs.totalCost = costs.costPerSqm * sizeSqMeters;
            }
        }

        // Update the name, cost per square meter, and total cost in the table
        document.getElementById("optionNameTd").textContent = costs.name;
        document.getElementById("costPerSqmTd").textContent = `£${formatNumber(costs.costPerSqm)}`;
        document.getElementById("totalCostTd").textContent = `£${formatNumber(costs.totalCost)}`;

        // Call getWorkTotalValue after updating totalCostTd
        const workTotalValue = getWorkTotalValue();
        console.log("Work Total Value:", workTotalValue); // Log the value for debugging

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
    }

    // Attach event listeners to buttons
    document.querySelectorAll(".button").forEach(button => {
        button.addEventListener("click", () => {
            const option = button.classList[1]; // Get the option from the button's class
            if (option) displayResults(option); // Display results for the selected option
        });
    });

    // Initialize with the first option (e.g., refurbish)
    displayResults("build");
});