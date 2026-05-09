function renderService() {
    const tbody = document.getElementById('service-table-body');
    if(!tbody) return;
    
    tbody.innerHTML = data.serviceCenters.map(item => `
        <tr>
            <td class="px-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="bg-emerald-subtle rounded p-2 text-emerald">
                        <i data-lucide="wrench" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${item.name}</div>
                        <div class="small text-muted">${item.code}</div>
                    </div>
                </div>
            </td>
            <td class="px-4">
                <div class="small fw-bold text-dark">${item.loc}</div>
                <div class="small text-muted">${item.city}</div>
            </td>
            <td class="px-4">
                 <div class="small text-dark"><i data-lucide="phone" class="w-3 h-3 text-muted me-1 inline-block"></i>${item.phone}</div>
            </td>
             <td class="px-4">
                 <div class="small text-muted">${item.hours}</div>
            </td>
            <td class="px-4">
                <span class="badge rounded-pill ${item.status === 'active' ? 'badge-emerald' : 'badge-orange'} text-capitalize">
                    ${item.status}
                </span>
            </td>
            <td class="px-4">
                <button class="btn btn-sm btn-link text-muted"><i data-lucide="edit" class="w-4 h-4"></i></button>
                <button class="btn btn-sm btn-link text-danger"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');
    
    // Re-initialize icons for the new table rows
    lucide.createIcons();
}

renderService();