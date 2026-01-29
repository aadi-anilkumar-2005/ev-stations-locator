const config = {
    chargerTypes: [
        { id: 'ccs1', name: 'CCS1 (DC Fast)' },
        { id: 'ccs2', name: 'CCS2 (EU)' },
        { id: 'tesla', name: 'NACS (Tesla)' },
        { id: 'j1772', name: 'J1772 (Level 2)' }
    ],
    amenities: [
        { id: 'wifi', name: 'Free Wi-Fi', icon: 'wifi' },
        { id: 'restroom', name: 'Restrooms', icon: 'coffee' },
        { id: 'dining', name: 'Dining', icon: 'utensils' },
        { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' }
    ]
};

function initForm() {
    populateAmenities();
    populateChargerDropdowns();
    lucide.createIcons();
}

function populateAmenities() {
    const container = document.getElementById('amenities-container');
    if(container) container.innerHTML = config.amenities.map(am => `
        <div class="col-6 col-md-4">
            <div class="form-check p-3 border rounded-3 bg-white h-100">
                <input class="form-check-input" type="checkbox" id="am-${am.id}">
                <label class="form-check-label d-flex align-items-center gap-2" for="am-${am.id}">
                    <i data-lucide="${am.icon}" class="w-4 h-4 text-secondary"></i> ${am.name}
                </label>
            </div>
        </div>
    `).join('');
}

function populateChargerDropdowns() {
    const selects = document.querySelectorAll('.charger-type-select');
    const options = config.chargerTypes.map(ct => `<option value="${ct.id}">${ct.name}</option>`).join('');
    selects.forEach(sel => { if(sel.children.length === 0) sel.innerHTML = options; });
}

function addChargerRow() {
    const container = document.getElementById('charger-rows-container');
    const newRow = document.createElement('div');
    newRow.className = 'row g-3 mb-3 border-bottom pb-3 charger-row';
    newRow.innerHTML = `
        <div class="col-md-4">
            <label class="form-label text-secondary small">Charger Type</label>
            <select class="form-select form-select-sm charger-type-select"></select>
        </div>
        <div class="col-md-3">
            <label class="form-label text-secondary small">Start Price</label>
            <div class="input-group input-group-sm">
                <span class="input-group-text">$</span>
                <input type="number" class="form-control" placeholder="0.00">
            </div>
        </div>
        <div class="col-md-3">
            <label class="form-label text-secondary small">End Price</label>
            <div class="input-group input-group-sm">
                <span class="input-group-text">$</span>
                <input type="number" class="form-control" placeholder="0.00">
            </div>
        </div>
        <div class="col-md-2 d-flex align-items-end">
            <button type="button" class="btn btn-sm btn-light text-danger w-100" onclick="this.closest('.charger-row').remove()"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
    `;
    container.appendChild(newRow);
    populateChargerDropdowns();
    lucide.createIcons();
}
initForm();