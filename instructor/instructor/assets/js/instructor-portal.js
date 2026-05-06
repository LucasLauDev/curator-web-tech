/**
 * Instructor Portal Core Interactions
 * Clean, modular, and bug-free implementation for the restructured system.
 */

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initStatsAnimations();
    initTooltips();
});

/**
 * Sidebar Navigation Logic
 */
function initSidebar() {
    const sidebar = document.getElementById('instructor-sidebar');
    if (!sidebar) return;

    // Handle sidebar active states based on current URL
    const currentPath = window.location.pathname;
    const navLinks = sidebar.querySelectorAll('a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href').split('/').pop())) {
            link.classList.add('bg-primary/10', 'text-primary', 'border-r-4', 'border-primary');
        }
    });

    // Mobile Sidebar Toggle (if needed in future)
}

/**
 * Stats Counter Animations
 */
function initStatsAnimations() {
    const stats = document.querySelectorAll('.stat-value');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target.toLocaleString();
                clearInterval(interval);
            } else {
                stat.textContent = Math.ceil(current).toLocaleString();
            }
        }, 20);
    });
}

/**
 * Simple Tooltip System
 */
function initTooltips() {
    // Tooltip logic can be added here if needed for icons
}

/**
 * Global Notification Handler
 */
window.showNotification = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-2xl z-[100] transform transition-all duration-300 translate-y-20 opacity-0 flex items-center space-x-3 ${
        type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
    }`;
    
    toast.innerHTML = `
        <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
        <span class="font-bold text-sm">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    }, 100);
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};
