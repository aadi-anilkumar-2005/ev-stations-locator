const serviceConfig = {
    // Removed operators list as requested
    caps: [
        { id: 'tires', name: 'Tire Service', icon: 'disc' },
        { id: 'battery', name: 'Battery Diagnostics', icon: 'battery-charging' },
        { id: 'body', name: 'Body Shop', icon: 'hammer' },
        { id: 'mobile', name: 'Mobile Service Van', icon: 'truck' },
        { id: 'glass', name: 'Glass Repair', icon: 'maximize' },
        { id: 'hvac', name: 'HVAC Service', icon: 'thermometer' }
    ]
};

function initServiceForm() {
    // Removed populateOperators logic

    const amContainer = document.getElementById('service-amenities');
    if(amContainer) {
        amContainer.innerHTML = serviceConfig.caps.map(am => `
            <div class="col-6 col-md-4">
                <div class="form-check p-3 border rounded-3 bg-white h-100">
                    <input class="form-check-input" type="checkbox" id="sc-${am.id}">
                    <label class="form-check-label d-flex align-items-center gap-2" for="sc-${am.id}">
                        <i data-lucide="${am.icon}" class="w-4 h-4 text-secondary"></i> ${am.name}
                    </label>
                </div>
            </div>
        `).join('');
    }
    lucide.createIcons();
}
initServiceForm();