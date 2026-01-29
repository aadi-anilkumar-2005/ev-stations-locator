function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = data.users.map(u => `
        <tr>
            <td class="px-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle ${u.color} text-white d-flex align-items-center justify-content-center small fw-bold" style="width:36px; height:36px;">
                        ${u.name.charAt(0)}${u.name.split(' ')[1].charAt(0)}
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${u.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 small">${u.email}</td>
            <td class="px-4">
                <span class="badge rounded-pill ${u.status === 'active' ? 'badge-emerald' : 'bg-secondary-subtle text-secondary'} text-capitalize">${u.status}</span>
            </td>
            <td class="px-4 fw-bold">${u.sessions}</td>
            <td class="px-4 small text-muted">${u.joined}</td>
            <td class="px-4">
                <a href="#" class="text-emerald small fw-bold text-decoration-none">View</a>
            </td>
        </tr>
    `).join('');

    // Updated to col-md-4 for better layout since revenue is removed
    document.getElementById('users-stats').innerHTML = data.stats.map(s => `
         <div class="col-md-4">
            <div class="card border-0 shadow-sm p-3 rounded-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="p-2 rounded-3 ${s.bg} ${s.text}"><i data-lucide="${s.icon}"></i></div>
                    <div>
                        <div class="h5 fw-bold mb-0">${s.value}</div>
                        <div class="small text-muted">${s.label}</div>
                    </div>
                </div>
            </div>
         </div>
    `).join('');
    
    lucide.createIcons();
}
renderUsers();