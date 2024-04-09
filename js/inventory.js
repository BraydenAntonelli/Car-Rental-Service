function toggleFilterForm() {
    var filterForm = document.querySelector('.filter-form');
    filterForm.style.display = (filterForm.style.display === 'none' || filterForm.style.display === '') ? 'block' : 'none';
}

async function performSearch() {
    var searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = ''; // Clear previous search results

    var query = buildQuery(); // Build query parameters

    try {
        var response = await fetch('http://localhost:3000/vehicles' + query);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        var data = await response.json();
        displaySearchResults(data); // Display search results
    } catch (error) {
        console.error('Error fetching data:', error);
        searchResultsContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
    }
}

function buildQuery() {
    var queryParams = [];

    var manufacturer = document.getElementById('manufacturerFilter').value;
    if (manufacturer) queryParams.push('manufacturer=' + encodeURIComponent(manufacturer));

    var carName = document.getElementById('carNameFilter').value;
    if (carName) queryParams.push('vehicleName=' + encodeURIComponent(carName));

    var year = document.getElementById('yearFilter').value;
    if (year) queryParams.push('year=' + encodeURIComponent(year));

    var type = document.getElementById('typeFilter').value;  
    if (type) queryParams.push('type=' + encodeURIComponent(type));

    var color = document.getElementById('colorFilter').value;
    if (color) queryParams.push('color=' + encodeURIComponent(color));

    var licensePlate = document.getElementById('licensePlateFilter').value;
    if (licensePlate) queryParams.push('licensePlate=' + encodeURIComponent(licensePlate));

    return queryParams.length > 0 ? '?' + queryParams.join('&') : '';
}


function displaySearchResults(data) {
    var searchResultsContainer = document.getElementById('searchResults');
    if (data.length === 0) {
        searchResultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }

    var html = '<h2>Search Results</h2><ul>';
    data.forEach(function(vehicle) {
        html += '<li>';
        html += '<b>Manufacturer:</b> ' + vehicle.manufacturer + '<br>';
        html += '<b>Model:</b> ' + vehicle.vehicleName + '<br>';
        html += '<b>Year:</b> ' + vehicle.year + '<br>';
        html += '<b>Type:</b> ' + vehicle.type + '<br>';
        html += '<b>Color:</b> ' + vehicle.color + '<br>';
        html += '<b>License Plate:</b> ' + vehicle.licensePlate + '<br>';
        // status displays based on the single-letter code
        html += '<b>Status:</b> ';
        if (vehicle.status === 'A') {
            html += 'Available';
            // Add rent button for available vehicles
            html += `<button class="rent-button" data-license-plate="${vehicle.licensePlate}">Rent</button>`;
            //Maintenance buttons for vehicles
            html += `<button class="maintenance-button" data-license-plate="${vehicle.licensePlate}">Maintenance</button>`;
        } else if (vehicle.status === 'O') {
            html += 'Out';
        } else if (vehicle.status === 'M') {
            html += 'Maintenance';
            html += `<button class="exit-maintenance-button" data-license-plate="${vehicle.licensePlate}">End Maintenance</button>`;
            const maint = findMaintenanceForVehicle(vehicle.licensePlate);
            html += maint.details;
        }
        html += '<br>';
        html += '</div>';
        html += '<hr>'; // Add horizontal line between cars
    });
    html += '</ul>';

    searchResultsContainer.innerHTML = html;

    // Add event listeners to rent buttons
    const rentButtons = document.querySelectorAll('.rent-button');
    rentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const licensePlate = this.getAttribute('data-license-plate');
            rentCar(licensePlate);
        });
    });

    //Event listeners to enter maintenance buttons
    const maintButtons = document.querySelectorAll('.maintenance-button');
    maintButtons.forEach(button => {
        button.addEventListener('click', function() {
            const licensePlate = this.getAttribute('data-license-plate');
            const redirectTo = `report.html?licensePlate=${licensePlate}`;
            window.location.href = redirectTo;
        });
    });

    //Adding event listeners to end maintenance buttons
    const endMaintButtons = document.querySelectorAll('.exit-maintenance-button');
    endMaintButtons.forEach(button => {
        button.addEventListener('click', function() {
            const licensePlate = this.getAttribute('data-license-plate');
            deleteMaintenance(licensePlate);
        });
    });
}

function renderSearchResults(vehicles) {
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = ''; // Clear previous search results
    vehicles.forEach(vehicle => {
        if (vehicle.status === 'Available') {
            const vehicleDiv = document.createElement('div');
            // Create HTML content for each vehicle
            const vehicleInfo = `
                <h3>Vehicle: ${vehicle.manufacturer}</h3>
                <h3>Model:${vehicle.vehicleName}</h3>
                <p>Year: ${vehicle.year}</p>
                <p>Color: ${vehicle.color}</p>
                <p>License Plate: ${vehicle.licensePlate}</p>
                <p>Status: ${vehicle.status}</p>
            `;
            vehicleDiv.innerHTML = vehicleInfo;
            // Create and append the rent button
            const rentButton = document.createElement('button');
            rentButton.textContent = 'Rent';
            rentButton.addEventListener('click', function() {
                // Redirect to rental page with vehicle ID
                window.location.href = `rental.html?id=${vehicle._id}`;
            });
            vehicleDiv.appendChild(rentButton); // Append rent button to vehicle div
            searchResultsContainer.appendChild(vehicleDiv); // Append vehicle div to search results container
        }
    });
}

async function findMaintenanceForVehicle( licensePlate ){

    //Calling endpoint to find maintenance for this vehicle
    try {
        const response =  await fetch(`http://localhost:3000/findMaintenance?licensePlate=${licensePlate}`, {
            method: 'GET', 
        });

        if(!response.ok) {
            throw new Error('Failed to find maintenance');
        }

        const responseData = await response.json();
        alert(responseData.message);
        return responseData;

    } catch(error) {
        console.error('Error finding maintenance for vehicle', error);
        alert('Failed to find maintenance for vehicle');
    }
}

async function deleteMaintenance( licenseplate ){

    const requestData = {licensePlate: licenseplate};
    //Calls the endpoint that will delete the maintenance document pertaining to the license plate
    try {
        const response =  await fetch('http://localhost:3000/exit-maintenance', {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(requestData)
        });

        if(!response.ok) {
            throw new Error('Failed to find maintenance');
        }

        const responseData = await response.json();
        alert(responseData.message);
        return responseData;

    } catch(error) {
        console.error('Error finding maintenance for vehicle', error);
        alert('Failed to find maintenance for vehicle');
    }
}