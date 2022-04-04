import redis from 'redis';

export async function getCurrentPfp(
  client: redis.RedisClientType<any, Record<string, never>>
): Promise<string | null> {
  const res = await client.get('current_pfp');
  return res;
}

export async function setPfp(
  client: redis.RedisClientType<any, Record<string, never>>,
  pfp: string
): Promise<void> {
  await client.set('current_pfp', pfp);
}
