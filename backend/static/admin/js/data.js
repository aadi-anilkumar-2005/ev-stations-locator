const data = {
    // REMOVED: Revenue object from stats array
    stats: [
        { icon: 'zap', label: 'Total Stations', value: '1,247', change: '+12%', color: 'emerald', bg: 'bg-success-subtle', text: 'text-success' },
        { icon: 'car', label: 'Showrooms', value: '34', change: '+2%', color: 'blue', bg: 'bg-primary-subtle', text: 'text-primary' },
        { icon: 'wrench', label: 'Service Centers', value: '18', change: '0%', color: 'purple', bg: 'bg-info-subtle', text: 'text-info' }
    ],
    status: [
        { status: 'Available', count: 892, percentage: 71, color: 'bg-emerald' },
        { status: 'In Use', count: 284, percentage: 23, color: 'bg-primary' },
        { status: 'Maintenance', count: 48, percentage: 4, color: 'bg-warning' },
        { status: 'Offline', count: 23, percentage: 2, color: 'bg-danger' }
    ],
    activity: [
        { icon: 'plus', type: 'New station added', desc: 'Tesla Supercharger at Downtown Mall', time: '2h ago', iconColor: 'text-emerald', iconBg: 'bg-success-subtle' },
        { icon: 'bell', type: 'Maintenance required', desc: 'Station #4521 needs inspection', time: '5h ago', iconColor: 'text-warning', iconBg: 'bg-warning-subtle' },
        { icon: 'check-circle', type: 'Update completed', desc: 'All stations firmware v2.4.1', time: '1d ago', iconColor: 'text-primary', iconBg: 'bg-primary-subtle' }
    ],
    stations: [
        { id: '1', name: 'Downtown Fast Charge', code: '#ST-001', loc: '123 Main St', city: 'Downtown', operator: 'Tesla', type: 'DC Fast', status: 'active', avail: '4/8', price: '$0.28', icon: 'zap' },
        { id: '2', name: 'Midtown Plaza', code: '#ST-002', loc: '456 Oak Ave', city: 'Midtown', operator: 'ChargePoint', type: 'Level 2', status: 'active', avail: '2/4', price: '$0.32', icon: 'plug' },
        { id: '3', name: 'Uptown Hub', code: '#ST-003', loc: '789 Pine St', city: 'Uptown', operator: 'EVgo', type: 'DC Fast', status: 'maintenance', avail: '0/6', price: '$0.35', icon: 'zap' }
    ],
    showrooms: [
        { id: '1', name: 'Tesla Gallery', code: '#SH-001', loc: '88 Fashion Valley', city: 'San Diego', brand: 'Tesla', phone: '+1 (619) 555-0100', hours: 'Mon-Sat 10:00-20:00', status: 'active' },
        { id: '2', name: 'Rivian Space', code: '#SH-002', loc: '500 W 2nd St', city: 'Austin', brand: 'Rivian', phone: '+1 (512) 555-0200', hours: 'Tue-Sun 11:00-19:00', status: 'active' },
        { id: '3', name: 'Lucid Studio', code: '#SH-003', loc: '100 Legend Dr', city: 'Miami', brand: 'Lucid', phone: '+1 (305) 555-0300', hours: 'Mon-Sun 10:00-18:00', status: 'renovation' }
    ],
    serviceCenters: [
        { id: '1', name: 'Downtown Repair', code: '#SC-001', loc: '990 Industrial Blvd', city: 'San Jose', phone: '+1 (408) 555-0199', hours: 'Mon-Fri 08:00 - 18:00', status: 'active' },
        { id: '2', name: 'Eastside Auto Fix', code: '#SC-002', loc: '445 Fixit Lane', city: 'Phoenix', phone: '+1 (602) 555-0245', hours: '24/7 Emergency', status: 'busy' },
        { id: '3', name: 'Metro Tech Hub', code: '#SC-003', loc: '12 Tech Park', city: 'Austin', phone: '+1 (512) 555-0888', hours: 'Mon-Sat 09:00 - 19:00', status: 'active' }
    ],
    users: [
        { id: '1', name: 'John Doe', email: 'john@ex.com', status: 'active', sessions: 24, joined: 'Jan 15', color: 'bg-success' },
        { id: '2', name: 'Sarah Miller', email: 'sarah@ex.com', status: 'active', sessions: 18, joined: 'Feb 3', color: 'bg-primary' },
        { id: '3', name: 'Mike Johnson', email: 'mike@ex.com', status: 'inactive', sessions: 12, joined: 'Dec 8', color: 'bg-info' }
    ],
    // REMOVED: 'rev' property from topStations
    topStations: [
        { name: 'Tesla Downtown', sessions: 2847, util: 85 },
        { name: 'CP Midtown', sessions: 1923, util: 72 },
        { name: 'EVgo Uptown', sessions: 1654, util: 68 }
    ]
};