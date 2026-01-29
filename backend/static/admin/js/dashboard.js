function renderDashboard() {
    const statsContainer = document.getElementById('dashboard-stats');
    
    // Updated to col-md-4 to fit 3 items perfectly across the row
    statsContainer.innerHTML = data.stats.map(stat => `
        <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100 rounded-4 transition-hover">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="rounded-3 p-2 ${stat.bg} ${stat.text}">
                            <i data-lucide="${stat.icon}" class="w-6 h-6"></i>
                        </div>
                        <span class="badge ${stat.bg} ${stat.text}">${stat.change}</span>
                    </div>
                    <h3 class="fw-bold mb-1">${stat.value}</h3>
                    <p class="text-muted small mb-0">${stat.label}</p>
                </div>
            </div>
        </div>
    `).join('');

    const statusContainer = document.getElementById('status-bars');
    statusContainer.innerHTML = data.status.map(s => `
        <div>
            <div class="d-flex justify-content-between mb-1">
                <span class="small fw-bold">${s.status}</span>
                <span class="small fw-bold ${s.color.replace('bg-', 'text-')}">${s.count} (${s.percentage}%)</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar ${s.color}" role="progressbar" style="width: ${s.percentage}%"></div>
            </div>
        </div>
    `).join('');

    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = data.activity.map(act => `
        <div class="list-group-item p-3 border-0">
            <div class="d-flex gap-3">
                <div class="rounded-3 p-2 ${act.iconBg} ${act.iconColor} d-flex align-items-center justify-content-center h-100">
                    <i data-lucide="${act.icon}" class="w-5 h-5"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-0">${act.type}</h6>
                    <p class="text-muted small mb-1">${act.desc}</p>
                    <small class="text-secondary">${act.time}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}
renderDashboard();