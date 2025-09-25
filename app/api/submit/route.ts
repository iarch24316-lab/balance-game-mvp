import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase';

export async function POST(req: Request) {
  const { pairId, picked, timeMs, userId = '' } = await req.json();
  if (!pairId || !['L','R'].includes(picked)) {
    return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
    }

  const { error } = await supabaseServer.from('choices').insert({
    pair_id: pairId,
    picked,
    time_ms: typeof timeMs === 'number' ? Math.round(timeMs) : null,
    user_id: String(userId || '')
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
