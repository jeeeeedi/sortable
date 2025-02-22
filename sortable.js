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
        th.textContent = `ColumnHeader${headerCount}. ${key}`; //TEMPORARY headerCount
        tableHeader.appendChild(th);
        headerCount++; //TEMPORARY
    });
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
