/**
 * Landing auth UI: redirect signed-in users away from login/register, and hide login CTA on landing home.
 * Requires npm run start (http://localhost) — not file://.
 */
(function curatorPortalLandingAuth () {
  if (typeof window === 'undefined' || window.location.protocol === 'file:') return;

  function dashboardHref (role) {
    if (role === 'instructor') {
      return '/instructor/instructor/Dashboard/main%20page/instructor_dashboard.html';
    }
    if (role === 'admin') {
      return '/admin/admin/Dashboard/admin_dashboard.html';
    }
    return '/student/student/dashboard/student_dashboard_new.html';
  }

  const path = String(window.location.pathname || '').replace(/\\/g, '/');
  const isLogin = path.includes('/landing/landing/login.html');
  const isRegister = path.includes('/landing/landing/role_base_registration.html');
  const isLandingIndex = /\/landing\/landing\/index\.html$/i.test(path);

  fetch('/api/auth/session', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : null))
    .then(function (payload) {
      if (!payload || !payload.profile || !payload.profile.role) return;

      var role = payload.profile.role;
      var dash = dashboardHref(role);

      if (isLogin || isRegister) {
        window.location.replace(dash);
        return;
      }

      if (!isLandingIndex) return;

      var loginEl = document.getElementById('landing-nav-login');
      var ctaEl = document.getElementById('landing-nav-cta');
      if (loginEl) {
        loginEl.classList.remove('sm:block');
        loginEl.classList.add('hidden');
      }
      if (ctaEl) {
        ctaEl.setAttribute('href', dash);
        ctaEl.textContent = 'Dashboard';
      }

      var registerNavSignIn = document.getElementById('landing-register-nav-signin');
      if (registerNavSignIn) registerNavSignIn.classList.add('hidden');
    })
    .catch(function () {});
})();
