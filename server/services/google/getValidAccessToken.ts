import { db } from '../../db';
import { oauthTokens } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { refreshAccessToken } from '../oauth';

export async function getValidAccessToken(): Promise<string> {
  const tokens = await db.select()
    .from(oauthTokens)
    .where(and(
      eq(oauthTokens.provider, 'google')
    ))
    .limit(1);

  if (!tokens || tokens.length === 0) {
    throw new Error('Gmail not connected. Please authorize at /api/oauth/authorize');
  }

  const token = tokens[0];

  if (token.expiresAt && new Date(token.expiresAt) <= new Date()) {
    console.log('Access token expired, refreshing...');
    const newTokens = await refreshAccessToken(token.refreshToken!);
    
    await db.update(oauthTokens)
      .set({
        accessToken: newTokens.access_token!,
        expiresAt: new Date(Date.now() + (newTokens.expiry_date || 3600000)),
      })
      .where(eq(oauthTokens.id, token.id));

    return newTokens.access_token!;
  }

  return token.accessToken;
}