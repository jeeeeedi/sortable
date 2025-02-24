export function sortable() {
    fetchData();
}
let currentDisplayCount = 20; // Default to 20 heroes per page
let sortedHeroes
let filteredHeroes

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
        //"ItemCounter": "", //TEMPORARY: to easily show how many items are showing
        //  "ID": "id", //TEMPORARY
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
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const current = document.getElementById("current");
    generateTableHeaders(tableHeader, defaultFields);

    filteredHeroes = allHeroes; //start will allHeroes
    sortedHeroes = [...filteredHeroes];


    addSortingFunctionality(tableHeader, tableBody, defaultFields, sortedHeroes);

    prev.addEventListener('click', () => {
        let start = parseInt(current.getAttribute('data-start'))
        let updateStart = parseInt(prev.getAttribute('data-start'));
        updateTable(tableBody, defaultFields, sortedHeroes, currentDisplayCount, updateStart);
        next.setAttribute('data-start', updateStart + currentDisplayCount)
        if (start - currentDisplayCount * 2 < 0) {
            start = 0
        } else {
            start = start - currentDisplayCount * 2
        }
        if (updateStart === 0) prev.setAttribute('disabled', true)
        prev.setAttribute('data-start', start)
        current.setAttribute('data-start', updateStart)
        next.removeAttribute('disabled')

    });

    next.addEventListener('click', () => {
        let start = parseInt(current.getAttribute('data-start'));
        let updateStart = parseInt(next.getAttribute('data-start'));
        updateTable(tableBody, defaultFields, sortedHeroes, currentDisplayCount, updateStart);
        prev.setAttribute('data-start', start)
        if (start + currentDisplayCount * 2 >= sortedHeroes.length) {
            start = sortedHeroes.length - currentDisplayCount
            next.setAttribute('disabled', true)
        } else {
            start = start + currentDisplayCount * 2
        }
        next.setAttribute('data-start', start)
        current.setAttribute('data-start', updateStart)
        prev.removeAttribute('disabled')
    });


    //SEARCH get searchInput
    document.getElementById("searchInput").addEventListener("input", function (event) {
        const searchTerm = event.target.value.toLowerCase();
        filteredHeroes = searchTerm === ""
            ? allHeroes
            : allHeroes.filter(hero => hero.name.toLowerCase().includes(searchTerm));
        sortedHeroes = [...filteredHeroes];
        updateTable(tableBody, defaultFields, sortedHeroes, currentDisplayCount);
        prev.setAttribute('disabled', true)
        if (currentDisplayCount === "all") {
            next.setAttribute('disabled', true)
        } else {
            let start = 0
            if (sortedHeroes.length <= currentDisplayCount) {
                next.setAttribute('disabled', true)
            } else {
                next.removeAttribute('disabled')
                prev.setAttribute('data-start', 0)
                current.setAttribute('data-start', 0)
                next.setAttribute('data-start', currentDisplayCount)
            }
        }
    });

    //SHOW specified rowsPerPageSelect
    const rowsPerPageSelect = document.getElementById("rowsPerPage");
    rowsPerPageSelect.addEventListener("change", (event) => {
        let start = parseInt(current.getAttribute('data-start'))
        if (event.target.value === "all") {
            currentDisplayCount = "all"
            prev.setAttribute('disabled', true)
            next.setAttribute('disabled', true)
        } else {
            prev.removeAttribute('disabled')
            next.removeAttribute('disabled')
            currentDisplayCount = parseInt(event.target.value);
            if (start - currentDisplayCount < 0) {
                prev.setAttribute('data-start', 0)
            } else {
                prev.setAttribute('data-start', start - currentDisplayCount)
            }
            if (start + currentDisplayCount >= sortedHeroes.length) {
                next.setAttribute('data-start', sortedHeroes.length - currentDisplayCount)
            } else {
                next.setAttribute('data-start', start + currentDisplayCount)
            }
            if (start === 0) prev.setAttribute('disabled', true)
            if (start + currentDisplayCount >= sortedHeroes.length) next.setAttribute('disabled', true)
        }

        updateTable(tableBody, defaultFields, filteredHeroes, currentDisplayCount, start);
    });
    updateTable(tableBody, defaultFields, filteredHeroes, currentDisplayCount); // Show first 20 items by default
}

function generateTableHeaders(tableHeader, defaultFields) {
    tableHeader.textContent = ""; // Clear previous headers

    let headerCount = 0;    //TEMPORARY: to easily show how many headers are showing

    Object.keys(defaultFields).forEach(key => {
        let th = document.createElement("th");
        let button = document.createElement("button");
        button.textContent = key; //TEMPORARY headerCount
        button.setAttribute('data-field', defaultFields[key]);
        th.appendChild(button);
        //th.textContent = `ColumnHeader${headerCount}. ${key}`; //TEMPORARY headerCount
        tableHeader.appendChild(th);
        headerCount++; //TEMPORARY
    });
}

function addSortingFunctionality(tableHeader, tableBody, defaultFields, allHeroes) {
    const headers = tableHeader.querySelectorAll('th button');
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
            updateTable(tableBody, defaultFields, allHeroes, currentDisplayCount);
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
    
        //For other fields, convert to lowercase strings for comparison
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();

        //Extract name from brackets (if any) using a regular expression
        aValue = extractBracketedText(aValue);
        bValue = extractBracketedText(bValue);

        //Handle special case for 'A' or cases starting with 'A' (optional logic)
        aValue = handleStartingWithA(aValue);
        bValue = handleStartingWithA(bValue);

        //Check if values are numeric
        const aNum = parseFloat(aValue.replace(/[^\d.-]/g, ''));
        const bNum = parseFloat(bValue.replace(/[^\d.-]/g, ''));

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? aNum - bNum : bNum - aNum;
        }

        // Sort alphabetically or numerically
        if (!isNaN(aValue) && !isNaN(bValue)) {
            return isAscending ? aValue - bValue : bValue - aValue;
        }
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

     // Check if the height is in feet and inches
    if (lowerCaseHeight.includes("'")) {
        const [feet, inches] = lowerCaseHeight.split("'");
        return (parseFloat(feet) * 30.48) + (parseFloat(inches) * 2.54);
    }

    // Check if the height is in meters
    if (lowerCaseHeight.includes('m') && !lowerCaseHeight.includes('cm')) {
        return numericValue * 100; // Convert meters to centimeters
    }
    return numericValue; // Assume centimeters for all other cases
}

function updateTable(tableBody, defaultFields, filteredHeroes, currentDisplayCount, startIndex = 0) {
    console.log(currentDisplayCount, startIndex)
    tableBody.textContent = ""; // Clear existing rows
    let itemCount = 0; //TEMPORARY: to easily show how many are showing

    const heroesToShow = currentDisplayCount === "all"
        ? filteredHeroes
        : filteredHeroes.slice(startIndex, startIndex + currentDisplayCount);

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


function extractBracketedText(value) {
    if (value && value.charAt(0) === '(') {
        return value.slice(1); // Return the value without the first char
    }
    console.log(value); // Log the value if no match is found
    return value; // Return the original value if no brackets are found
}

// Function to handle names or places starting with 'A' (or any other specific case)
function handleStartingWithA(value) {
    if (value && value.startsWith('a ') ||
        value && value.startsWith('an ')) {
        // You can trim the description or handle the value as you see fit
        return value.split(' ')[1] || value; // Example: remove the first word
    }
    return value;
}