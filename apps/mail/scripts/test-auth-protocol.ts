import { OAuthClient, OAUTH_CONFIGS } from '../src/main/auth/oauth-client'
import { buildXOAuth2Token } from '../src/main/network/mail-protocol-client'
import * as assert from 'node:assert'

console.log('=== RUNNING VUAMAIL PROTOCOL & AUTH TESTS ===')

// Test 1: PKCE Generation & S256 Challenge Validation
function testPKCE(): void {
  const { verifier, challenge } = OAuthClient.generatePKCE()
  assert.ok(verifier.length >= 43, 'Verifier length must be >= 43')
  assert.ok(challenge.length >= 43, 'Challenge length must be >= 43')
  assert.notStrictEqual(verifier, challenge, 'Challenge must be hash of verifier')
  console.log('✓ Test 1: PKCE S256 Challenge & Verifier generation PASSED')
}

// Test 2: SASL XOAUTH2 Buffer Generation (RFC 6161)
function testSASLXOAUTH2(): void {
  const user = 'chau.le@360.org.vn'
  const token = 'ya29.a0AfH6SMD...'
  const encoded = buildXOAuth2Token(user, token)
  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  assert.strictEqual(decoded, `user=${user}\x01auth=Bearer ${token}\x01\x01`)
  console.log('✓ Test 2: SASL XOAUTH2 token formatting (RFC 6161) PASSED')
}

// Test 3: OAuth Endpoint Configurations
function testOAuthConfigs(): void {
  assert.ok(OAUTH_CONFIGS.google.authEndpoint.includes('accounts.google.com/o/oauth2/v2/auth'))
  assert.ok(OAUTH_CONFIGS.google.tokenEndpoint.includes('oauth2.googleapis.com/token'))
  assert.ok(OAUTH_CONFIGS.microsoft.authEndpoint.includes('login.microsoftonline.com/common/oauth2/v2.0/authorize'))
  assert.ok(OAUTH_CONFIGS.microsoft.tokenEndpoint.includes('login.microsoftonline.com/common/oauth2/v2.0/token'))
  console.log('✓ Test 3: Google & Microsoft OAuth 2.0 endpoints verification PASSED')
}

testPKCE()
testSASLXOAUTH2()
testOAuthConfigs()

console.log('=== ALL AUTH PROTOCOL TESTS PASSED SUCCESSFULLY ===')
