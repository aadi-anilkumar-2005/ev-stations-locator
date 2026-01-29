function renderAnalytics() {
     // Render Stats (Revenue card is gone from data.stats, so it won't render here)
     document.getElementById('analytics-stats').innerHTML = data.stats.map(s => `
        <div class="col-md-4"> <div class="card border-0 shadow-sm p-3 rounded-4">
                 <div class="text-muted small mb-1">${s.label}</div>
                 <div class="h3 fw-bold mb-0 text-emerald">${s.value}</div>
                 <div class="small text-muted">${s.change} vs last week</div>
            </div>
        </div>
     `).join('');

     // Render Table Rows (Removed Revenue Cell)
     document.getElementById('top-stations-body').innerHTML = data.topStations.map(s => `
        <tr>
            <td class="px-4 fw-bold">${s.name}</td>
            <td class="px-4">${s.sessions}</td>
            <td class="px-4">
                <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 6px;">
                        <div class="progress-bar bg-emerald" style="width: ${s.util}%"></div>
                    </div>
                    <span class="small fw-bold">${s.util}%</span>
                </div>
            </td>
        </tr>
     `).join('');
     lucide.createIcons();
}
renderAnalytics();