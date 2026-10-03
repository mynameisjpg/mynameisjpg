import { getToken } from '@vercel/connect';

const connectorId = 'scl_sJRNvx8YXt8txFsXr24juA';

try {
  const token = await getToken(connectorId, {
    subject: { type: 'user', id: 'usr_123' }
  });
  console.log('Successfully retrieved connector token!');
  console.log('Token details:', { ...token, token: token?.token ? '[HIDDEN_FOR_SECURITY]' : undefined });
} catch (err) {
  console.error('Token retrieval notice:', err?.message || err);
}
