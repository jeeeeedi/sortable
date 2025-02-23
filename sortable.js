export function sortable() {
    fetchData();
}

function fetchData() {
    // This function is called only after the data has been fetched, and parsed.
    const loadData = (allHeroes) => {
        display(allHeroes);
    };

    // Request the file with fetch, and the data will be downloaded to your browser cache.
    fetch("https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json")
        .then((response) => response.json()) // parse the response from JSON
        .then(loadData) // .then will call the `loadData` function with the JSON value.
        .catch(error => console.error("Error:", error));
}

function display(allHeroes) {
    if (allHeroes.length === 0) return;

    //DISPLAY content based on defaultFields
    const defaultFields = {
        "ItemCounter": "", //TEMPORARY: to easily show how many items are showing
        "ID": "id", //TEMPORARY
        "Icon": "images.xs",
        "Name": "name",
        "Full Name": "biography.fullName",
        "Intelligence": "powerstats.intelligence",
        "Strength": "powerstats.strength",
        "Speed": "powerstats.speed",
        "Durability": "powerstats.durability",
        "Power": "powerstats.power",
        "Combat": "powerstats.combat",
        "Race": "appearance.race",
        "Gender": "appearance.gender",
        "Height": "appearance.height",
        "Weight": "appearance.weight",
        "Place Of Birth": "biography.placeOfBirth",
        "Alignment": "biography.alignment"
    };

    const tableHeader = document.getElementById("tableHeader");
    const tableBody = document.getElementById("tableBody");
    generateTableHeaders(tableHeader, defaultFields);

    
    addSortingFunctionality(tableHeader, tableBody, defaultFields, allHeroes);

    let filteredHeroes = allHeroes; //start will allHeroes

    //SEARCH get searchInput
    document.getElementById("searchInput").addEventListener("input", function (event) {
        const searchTerm = event.target.value.toLowerCase();
        filteredHeroes = searchTerm === ""
            ? allHeroes
            : allHeroes.filter(hero => hero.name.toLowerCase().includes(searchTerm));
        updateTable(tableBody, defaultFields, filteredHeroes, currentDisplayCount);
    });

    //SHOW specified rowsPerPageSelect
    let currentDisplayCount = 20; // Default
    const rowsPerPageSelect = document.getElementById("rowsPerPage");
    rowsPerPageSelect.addEventListener("change", (event) => {
        currentDisplayCount = event.target.value === "all" ? "all" : parseInt(event.target.value);
        updateTable(tableBody, defaultFields, filteredHeroes, currentDisplayCount);
    });
    updateTable(tableBody, defaultFields, filteredHeroes, currentDisplayCount); // Show first 20 items by default
}

function generateTableHeaders(tableHeader, defaultFields) {
    tableHeader.textContent = ""; // Clear previous headers

    let headerCount = 0;    //TEMPORARY: to easily show how many headers are showing

    Object.keys(defaultFields).forEach(key => {
        let th = document.createElement("th");
        let button = document.createElement("button");
        button.textContent = `ColumnHeader${headerCount}\n.${key}`; //TEMPORARY headerCount
        button.setAttribute('data-field', defaultFields[key]);
        th.appendChild(button);
        //th.textContent = `ColumnHeader${headerCount}. ${key}`; //TEMPORARY headerCount
        tableHeader.appendChild(th);
        headerCount++; //TEMPORARY
    });
}

function addSortingFunctionality(tableHeader, tableBody, defaultFields, allHeroes) {
    const headers = tableHeader.querySelectorAll ('th button');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-field');
            const isAscending = header.classList.toggle('asc');
            header.classList.toggle('desc', !isAscending);

            // Remove sorting classes from other headers
            headers.forEach(h => {
                if (h !== header) {
                    h.classList.remove('asc', 'desc');
                }
            });
            sortHeroes(allHeroes, field, isAscending);
            updateTable(tableBody, defaultFields, allHeroes, allHeroes.length);
        });
    });

}

function sortHeroes(heroes, field, isAscending) {

    const missingValues = 
    ['undefined', 'null', '', '-', 'N/A', '0 cm', '0 kg', '0', '- / 0 cm', '- lb', '0 kg'];
    
    heroes.sort((a, b) => {

        let aValue = getNestedValue(a, field);
        let bValue = getNestedValue(b, field);

        //Function to check if a value is considered missing
        const isMissing = (value) => {
            if (Array.isArray(value)) {
                return value.every(v => isMissing(v));
            }
            const strValue = String(value).trim().toLowerCase();
            return value === undefined || value === null || 
            missingValues.includes(strValue);
        };

        //Handle missing values, always put missing values at the end, regardless of sort direction
        if (isMissing(aValue) && isMissing(bValue)) return 0;
        if (isMissing(aValue)) return 1; 
        if (isMissing(bValue)) return -1;

        // Special handling for height
        if (field === 'appearance.height') {
            aValue = parseHeight(Array.isArray(aValue) ? aValue[1] : aValue);
            bValue = parseHeight(Array.isArray(bValue) ? bValue[1] : bValue);
        } else if (Array.isArray(aValue) && Array.isArray(bValue)) {
            aValue = aValue.find(v => !isMissing(v)) || aValue[0];
            bValue = bValue.find(v => !isMissing(v)) || bValue[0];
        }

        //Convert to string and lowercase for comparison
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();

        //Check if values are numeric
        const aNum = parseFloat(aValue.replace(/[^\d.-]/g, ''));
        const bNum = parseFloat(bValue.replace(/[^\d.-]/g, ''));

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? aNum - bNum : bNum - aNum;
        }

        //Sort alphabetically
        return isAscending ? aValue.localeCompare(bValue) :
            bValue.localeCompare(aValue);
    });
}

function parseHeight(heightString) {
    if (!heightString) return NaN;

    // Convert string to lowercase for easier comparison
    const lowerCaseHeight = heightString.toLowerCase();

    // Extract numeric value from the string
    const numericValue = parseFloat(lowerCaseHeight.replace(/[^\d.]/g, ''));

    if (isNaN(numericValue)) return NaN;

    // Check if the height is in meters
    if (lowerCaseHeight.includes('m') && !lowerCaseHeight.includes('cm')) {
        return numericValue * 100; // Convert meters to centimeters
    }
    return numericValue; // Assume centimeters for all other cases
}

function updateTable(tableBody, defaultFields, filteredHeroes, currentDisplayCount) {
    tableBody.textContent = ""; // Clear existing rows
    let itemCount = 1; //TEMPORARY: to easily show how many are showing

    const heroesToShow = currentDisplayCount === "all"
        ? filteredHeroes
        : filteredHeroes.slice(0, currentDisplayCount);

    heroesToShow.forEach(hero => {
        let row = document.createElement("tr");

        Object.entries(defaultFields).forEach(([header, path]) => {
            let data = document.createElement("td");
            let value = getNestedValue(hero, path);

            if (header === "Icon") {
                let img = document.createElement("img");
                img.src = value || "https://commons.wikimedia.org/wiki/File:Icon_Simple_Error_2.png"; //TEMPORARY: error img isn't working properly
                img.alt = hero.name;
                data.appendChild(img);
            }
            else if (Array.isArray(value)) { // if the field specified is an array (has sub-items)
                data.textContent = value.join(" / ");
            }
            //TEMPORARY: itemCounter to easily keep track of how many are showing
            else if (header === "ItemCounter") {
                data.textContent = `${itemCount}`;
                itemCount++;
            }
            //END COUNTER
            else {
                data.textContent = value || "N/A";
            }

            row.appendChild(data);
        });

        tableBody.appendChild(row);
    });
}

function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
