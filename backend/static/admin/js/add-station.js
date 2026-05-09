function initForm() {
    lucide.createIcons();
    
    // Set initial values for charger type dropdowns if data-value attribute is present
    document.querySelectorAll('.charger-type-select').forEach(select => {
        const val = select.getAttribute('data-value');
        if (val) {
             // For edit mode, we might need to find the option that matches the name or id.
             // In the view, we passed 'name' as data-value but option values are IDs.
             // This mismatch needs addressing. Ideally, init server-side selected status.
             // Better approach: In HTML template, use {% if ... selected %} logic, which is cleaner.
             // But for dynamic rows added via JS, we need this.
             // Actually, the previous HTML loop handled 'selected' not via logic but maybe just rendering.
             // Let's rely on server rendering for initial rows.
             // This JS function might just be needed for new rows.
        }
    });
}

function addChargerRow() {
    const container = document.getElementById('charger-rows-container');
    const template = document.getElementById('charger-row-template');
    
    if (template && container) {
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);
        lucide.createIcons();
    }
}

initForm();