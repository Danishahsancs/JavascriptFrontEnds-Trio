
let allDealerships = [];
let allCars = [];
let expandedDealerships = new Set();

// Load all data
async function loadAllData() {
    try {
        const [dealershipsRes, carsRes] = await Promise.all([
            fetch(`${baseUrl}/dealership`),
            fetch(`${baseUrl}/car`)
        ]);

        allDealerships = await dealershipsRes.json();
        allCars = await carsRes.json();

        populateCarDealershipDropdown();
        expandedDealerships.clear();
        renderDealerships(allDealerships, allCars);
        document.getElementById("globalSearch").value = '';
    } catch (error) {
        alert('Error loading data: ' + error.message);
    }
}

// Render dealerships with their cars
function renderDealerships(dealerships, cars) {
    const container = document.getElementById('dealershipsContainer');

    if (!dealerships.length) {
        container.innerHTML = '<div class="no-cars">No dealerships found</div>';
        return;
    }

    let html = '';
    dealerships.forEach(dealership => {
        const dealershipCars = cars.filter(car => car.dealership && car.dealership.id === dealership.id);
        const isExpanded = expandedDealerships.has(dealership.id);

        html += `
            <div class="dealership-card ${isExpanded ? 'expanded' : ''}" data-id="${dealership.id}">
                <div class="dealership-header" onclick="toggleDealership(${dealership.id})">
                    <div class="dealership-info">
                        <div class="dealership-name">${dealership.name}</div>
                        <div class="dealership-details">📍 ${dealership.location}</div>
                    </div>
                    <div class="dealership-actions" onclick="event.stopPropagation()">
                        <span class="car-count">${dealershipCars.length} cars</span>
                        <button class="btn-small" onclick="viewDealershipDetails(${dealership.id})">details</button>
                        <button class="btn-small" onclick="editDealership(${dealership.id})">✏️</button>
                        <button class="btn-small delete-btn" onclick="deleteDealership(${dealership.id})">🗑️</button>
                        <span class="expand-icon" onclick="toggleDealership(${dealership.id})">▼</span>
                    </div>
                </div>
                <div class="dealership-content">
                    <div class="cars-section">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: #00b894ff; margin: 0;">🚗 Cars (${dealershipCars.length})</h3>
                            <button class="create-btn btn-small" onclick="openCarModal(${dealership.id})">➕ Add Car</button>
                        </div>
                        ${renderCars(dealershipCars)}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Render cars for a dealership
function renderCars(cars) {
    if (!cars.length) {
        return '<div class="no-cars">No cars in this dealership</div>';
    }

    let html = '';
    cars.forEach(car => {
        html += `
            <div class="car-item">
                <div class="car-info">
                    <div class="car-title">${car.year} ${car.make} ${car.model}</div>
                </div>
                <div class="car-actions">
                    <button class="btn-small" onclick="viewCarDetails(${car.id})">details</button>
                    <button class="btn-small" onclick="editCar(${car.id})">✏️</button>
                    <button class="btn-small delete-btn" onclick="deleteCar(${car.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    return html;
}

// Toggle dealership expansion
function toggleDealership(dealershipId) {
    const card = document.querySelector(`.dealership-card[data-id="${dealershipId}"]`);
    if (!card) return;

    card.classList.toggle("expanded");

    if (expandedDealerships.has(dealershipId)) {
        expandedDealerships.delete(dealershipId);
    } else {
        expandedDealerships.add(dealershipId);
    }
}


// Global search
function performGlobalSearch() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    expandedDealerships.clear();


    if (!query) {
        renderDealerships(allDealerships, allCars);
        return;
    }

    const filteredDealerships = allDealerships.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.location.toLowerCase().includes(query) ||
        d.phonenumber.includes(query)
    );

    const filteredCars = allCars.filter(c =>
        c.make.toLowerCase().includes(query) ||
        c.model.toLowerCase().includes(query) ||
        c.vin.toLowerCase().includes(query) ||
        c.year.toString().includes(query)
    );

    // Get dealerships that have matching cars
    const dealershipsWithMatchingCars = [...new Set(
        filteredCars
            .filter(c => c.dealership)
            .map(c => c.dealership.id)
    )].map(id => allDealerships.find(d => d.id === id)).filter(d => d);

    // Combine and deduplicate
    const allMatchingDealerships = [...new Map(
        [...filteredDealerships, ...dealershipsWithMatchingCars]
            .map(d => [d.id, d])
    ).values()];

    // Auto-expand dealerships with matching cars
    filteredCars.forEach(car => {
        if (car.dealership) {
            expandedDealerships.add(car.dealership.id);
        }
    });

    renderDealerships(allMatchingDealerships, allCars);
}



// Modal functions
function openDealershipModal(dealership = null) {
    const modal = document.getElementById('dealershipModal');
    const title = document.getElementById('modalTitle');

    if (dealership) {
        title.textContent = 'Edit Dealership';
        document.getElementById('modalDealershipId').value = dealership.id;
        document.getElementById('modalDealershipName').value = dealership.name;
        document.getElementById('modalDealershipLocation').value = dealership.location;
        document.getElementById('modalDealershipPhone').value = dealership.phonenumber;
    } else {
        title.textContent = 'Add New Dealership';
        document.getElementById('modalDealershipId').value = '';
        document.getElementById('modalDealershipName').value = '';
        document.getElementById('modalDealershipLocation').value = '';
        document.getElementById('modalDealershipPhone').value = '';
    }

    modal.style.display = 'block';
}

function closeDealershipModal() {
    document.getElementById('dealershipModal').style.display = 'none';
}

function openCarModal(dealershipId = null, car = null) {
    const modal = document.getElementById('carModal');
    const title = document.getElementById('carModalTitle');

    if (car) {
        title.textContent = 'Edit Car';
        document.getElementById('modalCarId').value = car.id;
        document.getElementById('modalCarMake').value = car.make;
        document.getElementById('modalCarModel').value = car.model;
        document.getElementById('modalCarYear').value = car.year;
        document.getElementById('modalCarVin').value = car.vin;
        document.getElementById('modalCarDealership').value = car.dealership ? car.dealership.id : '';
    } else {
        title.textContent = 'Add New Car';
        document.getElementById('modalCarId').value = '';
        document.getElementById('modalCarMake').value = '';
        document.getElementById('modalCarModel').value = '';
        document.getElementById('modalCarYear').value = '';
        document.getElementById('modalCarVin').value = '';
        document.getElementById('modalCarDealership').value = dealershipId || '';
    }

    modal.style.display = 'block';
}

function closeCarModal() {
    document.getElementById('carModal').style.display = 'none';
}

function closeDetailModal() {
    const title = document.getElementById("detailModalTitle");
    title.style.color = "#74b9ff";
    title.style.borderBottom = "2px solid #74b9ff";
    document.getElementById('detailModal').style.display = 'none';
}

function openDetailModal(dealership = null, car = null) {
    const modal = document.getElementById("detailModal");
    const title = document.getElementById("detailModalTitle");
    const container = document.getElementById("detailModalDetailSection");

    let html = '';


    if (dealership) {
        title.textContent = 'Dealership details';
        title.classList.remove("header2-green");

        html += `
            <div class="dealership-card">
                <div class="dealership-header">
                    <div class="dealership-name">dealership name</div>
                    <div class="dealership-details">${dealership.name}</div>
                </div>
                <div class="dealership-header">
                    <div class="dealership-name">dealership location</div>
                    <div class="dealership-details">${dealership.location}</div>
                </div>
                <div class="dealership-header">
                    <div class="dealership-name">dealership phonenumber</div>
                    <div class="dealership-details">${dealership.phonenumber}</div>
                </div>
            
            </div>
        `;
    }

    if (car) {
        title.textContent = 'Car details';
        title.classList.add("car-title");
        title.style.color = "#00b894";
        title.style.borderBottom = "2px solid #00b894";

        html += `
     
                <div class="car-item">
                    <div class="car-title">make</div>
                    <div class="dealership-details">${car.make}</div>
                </div>
                <div class="car-item">
                    <div class="car-title">model</div>
                    <div class="dealership-details">${car.model}</div>
                </div>
                <div class="car-item">
                    <div class="car-title">year</div>
                    <div class="dealership-details">${car.year}</div>
                </div>
                <div class="car-item">
                    <div class="car-title">vin</div>
                    <div class="dealership-details">${car.vin}</div>
                </div>
        
        `;

    }


    container.innerHTML = html;
    modal.style.display = 'block';
}
// Populate dealership dropdown for cars
function populateCarDealershipDropdown() {
    const select = document.getElementById('modalCarDealership');
    select.innerHTML = '<option value="">Select Dealership</option>';
    allDealerships.forEach(d => {
        select.innerHTML += `<option value="${d.id}">${d.name} (${d.location})</option>`;
    });
}

// CRUD operations
async function saveDealership() {
    const id = document.getElementById('modalDealershipId').value;
    const name = document.getElementById('modalDealershipName').value;
    const location = document.getElementById('modalDealershipLocation').value;
    const phone = document.getElementById('modalDealershipPhone').value;

    if (!name || !location || !phone) {
        alert('Please fill all fields');
        return;
    }

    try {
        const url = id ? `${baseUrl}/dealership/${id}` : `${baseUrl}/dealership`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, location, phonenumber: phone })
        });

        if (res.ok) {
            closeDealershipModal();
            loadAllData();
        } else {
            alert('Error saving dealership');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function saveCar() {
    const id = document.getElementById('modalCarId').value;
    const make = document.getElementById('modalCarMake').value;
    const model = document.getElementById('modalCarModel').value;
    const year = parseInt(document.getElementById('modalCarYear').value);
    const vin = document.getElementById('modalCarVin').value;
    const dealershipId = parseInt(document.getElementById('modalCarDealership').value);

    if (!make || !model || !year || !vin) {
        alert('Please fill all fields');
        return;
    }

    try {
        const url = id ? `${baseUrl}/car/${id}` : `${baseUrl}/car`;
        const method = id ? 'PUT' : 'POST';

        const body = { make, model, year, vin };
        if (dealershipId) {
            body.dealership = { id: dealershipId };
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            closeCarModal();
            loadAllData();
        } else {
            alert('Error saving car');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function editDealership(id) {
    const dealership = allDealerships.find(d => d.id === id);
    if (dealership) {
        openDealershipModal(dealership);
    }
}

async function editCar(id) {
    const car = allCars.find(c => c.id === id);
    if (car) {
        openCarModal(null, car);
    }
}

async function viewDealershipDetails(id) {
    const dealership = allDealerships.find(d => d.id === id);
    if (dealership) {
        openDetailModal(dealership, null);
    }
}

async function viewCarDetails(id) {
    const car = allCars.find(c => c.id === id);
    if (car) {
        openDetailModal(null, car);
    }
}

async function deleteDealership(id) {
    if (!confirm('Delete this dealership?')) return;

    try {
        const res = await fetch(`${baseUrl}/dealership/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadAllData();
        } else {
            alert('Error deleting dealership');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteCar(id) {
    if (!confirm('Delete this car?')) return;

    try {
        const res = await fetch(`${baseUrl}/car/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadAllData();
        } else {
            alert('Error deleting car');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Initialize
window.onload = function () {
    loadAllData();

    // Close modals when clicking outside
    window.onclick = function (event) {
        const dealershipModal = document.getElementById('dealershipModal');
        const carModal = document.getElementById('carModal');
        const detailModal = document.getElementById('detailModal');

        if (event.target === dealershipModal) {
            closeDealershipModal();
        }
        if (event.target === carModal) {
            closeCarModal();
        }
        if (event.target === detailModal) {
            closeDetailModal();
        }
    };
};