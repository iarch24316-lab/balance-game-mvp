import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase';

export async function POST(req: Request) {
  const { seenIds = [] } = await req.json().catch(() => ({ seenIds: [] }));

  // 먼저 RPC 시도
  let exclude = Array.isArray(seenIds) && seenIds.length ? seenIds : null;
  let rpcData = null;
  try {
    const { data, error } = await supabaseServer.rpc('get_random_pair', { exclude_ids: exclude });
    if (!error) rpcData = data;
  } catch (e) {}

  let pair = rpcData?.[0] ?? null;

  if (!pair) {
    const { data: rows, error: err2 } = await supabaseServer
      .from('pairs')
      .select('id, left_url, right_url')
      .eq('active', true)
      .limit(50);

    if (err2) return NextResponse.json({ pair: null, targetCount: 30 }, { status: 500 });

    const candidates = (rows || []).filter(r => !(seenIds || []).includes(r.id));
    if (candidates.length === 0) return NextResponse.json({ pair: null, targetCount: 30 });

    pair = candidates[Math.floor(Math.random() * candidates.length)];
  }

  return NextResponse.json({ pair, targetCount: 30 });
}
