/**
 * Landing-style footer for portal dashboards (student / instructor / admin).
 * Call mountCuratorPortalFooter(landingLandingPrefix) with a prefix ending in .../landing/landing/
 * (same convention as navbar links).
 */
(function (global) {
    'use strict';

    /**
     * @param {string} landingLandingPrefix - e.g. "../../../landing/landing/" relative to current page
     */
    function mountCuratorPortalFooter(landingLandingPrefix) {
        if (!landingLandingPrefix || typeof landingLandingPrefix !== 'string') return;
        if (document.getElementById('curator-portal-footer')) return;

        var lb = landingLandingPrefix.replace(/\/?$/, '/');
        var communityHref = lb.replace(/landing\/landing\/$/i, 'community/community_group.html');

        var wrap = document.createElement('footer');
        wrap.id = 'curator-portal-footer';
        wrap.className =
            'bg-surface-container-lowest border-t border-surface-container pt-20 pb-10 px-6 w-full mt-auto';
        wrap.setAttribute('role', 'contentinfo');
        wrap.innerHTML =
            '<div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">' +
            '<div class="space-y-6 max-w-sm">' +
            '<span class="text-2xl font-black font-headline text-primary">CuratorEdu</span>' +
            '<p class="text-on-surface-variant font-medium">The editorial campus for the modern intellectual. Design your path, curate your mind.</p>' +
            '</div>' +
            '<div class="grid grid-cols-2 sm:grid-cols-3 gap-12">' +
            '<div class="space-y-4">' +
            '<h5 class="font-bold font-headline text-on-background">Learning</h5>' +
            '<ul class="space-y-2 text-sm text-on-surface-variant font-medium">' +
            '<li><a class="hover:text-primary transition-colors" href="' +
            lb +
            'course_discovery.html">Courses</a></li>' +
            '<li><a class="hover:text-primary transition-colors" href="' +
            lb +
            'course_discovery.html">Paths</a></li>' +
            '<li><a class="hover:text-primary transition-colors" href="' +
            lb +
            'course_discovery.html">Certificates</a></li>' +
            '</ul></div>' +
            '<div class="space-y-4">' +
            '<h5 class="font-bold font-headline text-on-background">Community</h5>' +
            '<ul class="space-y-2 text-sm text-on-surface-variant font-medium">' +
            '<li><a class="hover:text-primary transition-colors" href="' +
            lb +
            'comunity_forum_nonuser.html">Forum</a></li>' +
            '<li><a class="hover:text-primary transition-colors" href="' +
            communityHref +
            '">Events</a></li>' +
            '<li><a class="hover:text-primary transition-colors" href="' +
            communityHref +
            '">Mentors</a></li>' +
            '</ul></div>' +
            '<div class="space-y-4">' +
            '<h5 class="font-bold font-headline text-on-background">Support</h5>' +
            '<ul class="space-y-2 text-sm text-on-surface-variant font-medium">' +
            '<li><a class="hover:text-primary transition-colors" href="' +
            lb +
            'help.html">Help Center</a></li>' +
            '<li><a class="hover:text-primary transition-colors" href="#">Privacy</a></li>' +
            '<li><a class="hover:text-primary transition-colors" href="#">Terms</a></li>' +
            '</ul></div></div></div>' +
            '<div class="max-w-7xl mx-auto mt-20 pt-8 border-t border-surface-container flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-label text-outline uppercase tracking-widest font-bold">' +
            '<p>&copy; 2026 CuratorEdu. All Rights Reserved.</p>' +
            '<div class="flex gap-6">' +
            '<a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>' +
            '<a href="https://x.com" target="_blank" rel="noopener noreferrer">Twitter</a>' +
            '<a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>' +
            '</div></div>';

        document.body.appendChild(wrap);
    }

    global.mountCuratorPortalFooter = mountCuratorPortalFooter;
})(typeof window !== 'undefined' ? window : this);
