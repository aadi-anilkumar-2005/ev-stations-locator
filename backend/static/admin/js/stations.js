function renderStations() {
    const tbody = document.getElementById('stations-table-body');
    if(!tbody) return;
    tbody.innerHTML = data.stations.map(st => `
        <tr>
            <td class="px-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="bg-emerald-subtle rounded p-2 text-emerald">
                        <i data-lucide="${st.icon}" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${st.name}</div>
                        <div class="small text-muted">${st.code}</div>
                    </div>
                </div>
            </td>
            <td class="px-4">
                <div class="small fw-bold text-dark">${st.loc}</div>
                <div class="small text-muted">${st.city}</div>
            </td>
            <td class="px-4">
                <span class="badge rounded-pill bg-light text-dark border">${st.operator || 'N/A'}</span>
            </td>
            <td class="px-4"><span class="badge rounded-pill bg-light text-dark border">${st.type}</span></td>
            <td class="px-4">
                <span class="badge rounded-pill ${st.status === 'active' ? 'badge-emerald' : st.status === 'maintenance' ? 'badge-orange' : 'badge-red'} text-capitalize">
                    ${st.status}
                </span>
            </td>
            <td class="px-4 fw-bold text-dark">${st.avail}</td>
            <td class="px-4 fw-bold text-dark">${st.price}</td>
            <td class="px-4">
                <button class="btn btn-sm btn-link text-muted"><i data-lucide="edit" class="w-4 h-4"></i></button>
                <button class="btn btn-sm btn-link text-danger"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}
renderStations();