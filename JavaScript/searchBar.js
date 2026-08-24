// Toggle filter options when clicking the Filter button
(function () {
    const filterToggle = document.getElementById("filterButton");
    const filterOptions = document.getElementById("filterOptions");
    const filterApply = document.getElementById("filterApplyButton");

    function toggleFilterOptions() {
        if (!filterOptions) return;
        const currentDisplay = window.getComputedStyle(filterOptions).display;
        filterOptions.style.display = (currentDisplay === "none" || currentDisplay === "") ? "grid" : "none";
    }

    if (filterToggle) {
        filterToggle.addEventListener("click", function (e) {
            e.preventDefault();
            toggleFilterOptions();
        });
    }

    // If there's an Apply button, hide the filter panel when clicked (and you can hook apply logic here)
    if (filterApply) {
        filterApply.addEventListener("click", function (e) {
            e.preventDefault();
            if (filterOptions) {
                filterOptions.style.display = "none";
            }
            // TODO: collect selected filter values and apply them to your search
        });
    }

    // Close filter when clicking outside (optional, improves UX)
    document.addEventListener("click", function (event) {
        if (!filterOptions || !filterToggle) return;
        const isClickInside = filterOptions.contains(event.target) || filterToggle.contains(event.target);
        if (!isClickInside) {
            filterOptions.style.display = "none";
        }
    });
})();
