// ============================================================================
// C-Spot Academy — Admin Authentication & Session Security Tests
// File: tests/admin-auth.test.ts
// ============================================================================

import { describe, it, expect } from 'vitest';
import { verifyAdminCredentials } from '../src/lib/auth';
import { signAdminSessionToken, verifyAdminSessionToken } from '../src/lib/tokens';
import { POST } from '../src/app/api/admin/login/route';
import { NextRequest } from 'next/server';

describe('Admin Authentication & Session Security', () => {
  it('validates default admin credentials and handles trimmed inputs', () => {
    expect(verifyAdminCredentials('admin@cspotacademy.in', 'cspot_admin_2026_secure')).toBe(true);
    expect(verifyAdminCredentials('admin@cspotacademy.in', '  cspot_admin_2026_secure  ')).toBe(true);
    expect(verifyAdminCredentials('admin@cspotacademy.in', 'wrong_password')).toBe(false);
    expect(verifyAdminCredentials('not-an-email', 'cspot_admin_2026_secure')).toBe(false);
  });

  it('signs and verifies admin session tokens with fallback dev secret', async () => {
    const token = await signAdminSessionToken('admin@cspotacademy.in', 'SUPER_ADMIN');
    expect(token).toBeTruthy();

    const payload = await verifyAdminSessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.email).toBe('admin@cspotacademy.in');
    expect(payload?.role).toBe('SUPER_ADMIN');
    expect(payload?.purpose).toBe('ADMIN_SESSION');
  });

  it('rejects tampered or forged admin tokens', async () => {
    const token = await signAdminSessionToken('admin@cspotacademy.in', 'SUPER_ADMIN');
    const parts = token.split('.');
    const tampered = `${parts[0]}.${parts[1]}tamper.${parts[2]}`;
    const payload = await verifyAdminSessionToken(tampered);
    expect(payload).toBeNull();
  });

  it('successfully logs in via POST /api/admin/login and returns auth cookie', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cspotacademy.in',
        password: 'cspot_admin_2026_secure',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe('admin@cspotacademy.in');
    expect(body.data.role).toBe('SUPER_ADMIN');

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('cspot_admin_session=');
    expect(setCookie).toContain('HttpOnly');
  });

  it('rejects invalid password via POST /api/admin/login with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cspotacademy.in',
        password: 'incorrect_passcode',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid administrator credentials.');
  });
});
