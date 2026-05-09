const showroomConfig = {
    brands: ['Tesla', 'Rivian', 'Lucid', 'Polestar', 'BYD'],
    amenities: [
        { id: 'testdrive', name: 'Test Drive Available', icon: 'car' },
        { id: 'consult', name: 'Design Studio', icon: 'pencil' },
        { id: 'delivery', name: 'Delivery Center', icon: 'key' },
        { id: 'lounge', name: 'Customer Lounge', icon: 'coffee' }
    ]
};

function initShowroomForm() {
    const brandSelect = document.getElementById('form-brand');
    if(brandSelect) {
        brandSelect.innerHTML = showroomConfig.brands.map(b => `<option value="${b}">${b}</option>`).join('');
    }

    const amContainer = document.getElementById('showroom-amenities');
    if(amContainer) {
        amContainer.innerHTML = showroomConfig.amenities.map(am => `
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
    lucide.createIcons();
}
initShowroomForm();