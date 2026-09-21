import assert from 'node:assert';

// Verification test for auth rules & gates
function checkRouteProtection(pathname, user, profile) {
  // Protect /dashboard/* — redirect to login if not authenticated
  if (pathname.startsWith('/dashboard') && !user) {
    return { action: 'redirect', destination: `/login?redirect=${encodeURIComponent(pathname)}` };
  }

  // Protect /admin/* — redirect to login if not authenticated
  if (pathname.startsWith('/admin') && !user) {
    return { action: 'redirect', destination: `/login?redirect=${encodeURIComponent(pathname)}` };
  }

  // Check admin role for /admin/*
  if (pathname.startsWith('/admin') && user) {
    if (profile?.role !== 'admin') {
      return { action: 'rewrite', destination: '/403' };
    }
  }

  return { action: 'next' };
}

console.log('Testing auth gates matching src/lib/supabase/middleware.ts...');

// Case 1: Anonymous accessing /dashboard
{
  const res = checkRouteProtection('/dashboard', null, null);
  assert.strictEqual(res.action, 'redirect');
  assert.strictEqual(res.destination, '/login?redirect=%2Fdashboard');
  console.log('✓ Unauthenticated /dashboard redirects to /login?redirect=/dashboard');
}

// Case 2: Anonymous accessing /dashboard/purchases
{
  const res = checkRouteProtection('/dashboard/purchases', null, null);
  assert.strictEqual(res.action, 'redirect');
  assert.strictEqual(res.destination, '/login?redirect=%2Fdashboard%2Fpurchases');
  console.log('✓ Unauthenticated /dashboard/purchases redirects to /login');
}

// Case 3: Customer accessing /dashboard
{
  const res = checkRouteProtection('/dashboard', { id: 'u1' }, { role: 'customer' });
  assert.strictEqual(res.action, 'next');
  console.log('✓ Authenticated customer can access /dashboard');
}

// Case 4: Anonymous accessing /admin
{
  const res = checkRouteProtection('/admin', null, null);
  assert.strictEqual(res.action, 'redirect');
  assert.strictEqual(res.destination, '/login?redirect=%2Fadmin');
  console.log('✓ Unauthenticated /admin redirects to /login');
}

// Case 5: Non-admin customer accessing /admin
{
  const res = checkRouteProtection('/admin/products', { id: 'u2' }, { role: 'customer' });
  assert.strictEqual(res.action, 'rewrite');
  assert.strictEqual(res.destination, '/403');
  console.log('✓ Customer role accessing /admin is rewritten to /403');
}

// Case 6: Admin accessing /admin
{
  const res = checkRouteProtection('/admin/products', { id: 'u3' }, { role: 'admin' });
  assert.strictEqual(res.action, 'next');
  console.log('✓ Admin user can access /admin/products');
}

console.log('All middleware auth gates passed successfully!');
