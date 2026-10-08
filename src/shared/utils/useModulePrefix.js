import { useLocation } from 'react-router-dom';

/**
 * Purchase/Sale/Billing page components are reused under two different
 * route prefixes:
 *   - /purchase/..., /sale/..., /billing/...             (staff logins)
 *   - /branch-admin/purchase/..., /branch-admin/sale/..., /branch-admin/billing/...
 *
 * Any Link/navigate('/billing/...') hardcoded inside those pages would be
 * wrong for a Branch Admin (it would point at the BILLING-staff-only route
 * and bounce them to /login). This hook returns the correct prefix to
 * prepend, based on where the page is currently mounted.
 *
 * Usage: const base = useModulePrefix(); navigate(`${base}/billing/wallet`);
 */
export function useModulePrefix() {
  const { pathname } = useLocation();
  return pathname.startsWith('/branch-admin') ? '/branch-admin' : '';
}
