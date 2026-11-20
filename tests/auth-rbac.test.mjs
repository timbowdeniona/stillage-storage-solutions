import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveUserRole,
  isAdminEmail,
  normalizeEmail,
  getAdminEmails,
} from '../src/lib/roles.ts';

test('normalizeEmail trims whitespace, lowercases, and handles empty or nullish values', () => {
  assert.equal(normalizeEmail('timdbowden@gmail.com'), 'timdbowden@gmail.com');
  assert.equal(normalizeEmail('TIMDBOWDEN@GMAIL.COM'), 'timdbowden@gmail.com');
  assert.equal(normalizeEmail('  timdbowden@gmail.com  '), 'timdbowden@gmail.com');
  assert.equal(normalizeEmail(''), '');
  assert.equal(normalizeEmail('   '), '');
  assert.equal(normalizeEmail(null), '');
  assert.equal(normalizeEmail(undefined), '');
});

test('resolveUserRole and isAdminEmail grant admin role to seeded admin emails case-insensitively', () => {
  assert.equal(resolveUserRole('timdbowden@gmail.com'), 'admin');
  assert.equal(resolveUserRole('TIMDBOWDEN@GMAIL.COM'), 'admin');
  assert.equal(resolveUserRole(' timdbowden@gmail.com '), 'admin');
  assert.equal(resolveUserRole('admin@plantandrobinson.com'), 'admin');
  assert.equal(resolveUserRole(' ADMIN@PLANTANDROBINSON.COM '), 'admin');

  assert.equal(isAdminEmail('timdbowden@gmail.com'), true);
  assert.equal(isAdminEmail('TIMDBOWDEN@GMAIL.COM'), true);
  assert.equal(isAdminEmail(' timdbowden@gmail.com '), true);
  assert.equal(isAdminEmail('admin@plantandrobinson.com'), true);
});

test('resolveUserRole and isAdminEmail assign customer role to test customer, unknown buyers, and empty inputs', () => {
  assert.equal(resolveUserRole('tim@valleychapel.co.uk'), 'customer');
  assert.equal(resolveUserRole('TIM@VALLEYCHAPEL.CO.UK'), 'customer');
  assert.equal(resolveUserRole('buyer@example.co.uk'), 'customer');
  assert.equal(resolveUserRole(null), 'customer');
  assert.equal(resolveUserRole(undefined), 'customer');
  assert.equal(resolveUserRole(''), 'customer');
  assert.equal(resolveUserRole('   '), 'customer');

  assert.equal(isAdminEmail('tim@valleychapel.co.uk'), false);
  assert.equal(isAdminEmail('buyer@example.co.uk'), false);
  assert.equal(isAdminEmail(null), false);
  assert.equal(isAdminEmail(undefined), false);
  assert.equal(isAdminEmail(''), false);
});

test('getAdminEmails and ADMIN_EMAILS override parameter support custom admin allowlists and fallback', () => {
  const override = 'ops@stillage.co.uk, Director@Stillage.co.uk, ops@stillage.co.uk';
  assert.deepEqual(getAdminEmails(override), [
    'ops@stillage.co.uk',
    'director@stillage.co.uk',
  ]);

  assert.equal(resolveUserRole('ops@stillage.co.uk', override), 'admin');
  assert.equal(resolveUserRole('DIRECTOR@STILLAGE.CO.UK', override), 'admin');
  assert.equal(resolveUserRole('timdbowden@gmail.com', override), 'customer');
  assert.equal(isAdminEmail('ops@stillage.co.uk', override), true);
  assert.equal(isAdminEmail('timdbowden@gmail.com', override), false);

  // Empty override falls back to default admin emails
  assert.deepEqual(getAdminEmails(''), [
    'timdbowden@gmail.com',
    'admin@plantandrobinson.com',
  ]);
  assert.deepEqual(getAdminEmails('  ,  '), [
    'timdbowden@gmail.com',
    'admin@plantandrobinson.com',
  ]);

  // Verify process.env.ADMIN_EMAILS is respected when envValue parameter is omitted
  const previousEnv = process.env.ADMIN_EMAILS;
  try {
    process.env.ADMIN_EMAILS = 'custom-admin@stillage.co.uk';
    assert.deepEqual(getAdminEmails(), ['custom-admin@stillage.co.uk']);
    assert.equal(resolveUserRole('custom-admin@stillage.co.uk'), 'admin');
    assert.equal(resolveUserRole('timdbowden@gmail.com'), 'customer');
  } finally {
    if (previousEnv === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = previousEnv;
    }
  }
});
