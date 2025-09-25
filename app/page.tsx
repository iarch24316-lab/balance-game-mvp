'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

type Pair = { id: string; left_url: string; right_url: string };

type NextPairResponse = {
  pair: Pair | null;
  targetCount: number; // 목표 문항수
};

const TARGET = 30; // 목표 문항수

export default function Page() {
  const [pair, setPair] = useState<Pair | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const t0 = useRef<number>(0);

  const progress = useMemo(() => Math.min(100, Math.round((count / TARGET) * 100)), [count]);

  const fetchNext = async () => {
    setLoading(true);
    const res = await fetch('/api/nextPair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seenIds }),
    });
    const data: NextPairResponse = await res.json();
    setPair(data.pair);
    setLoading(false);
    t0.current = performance.now();
  };

  useEffect(() => {
    const saved = localStorage.getItem('seenIds');
    const cnt = localStorage.getItem('count');
    if (saved) setSeenIds(JSON.parse(saved));
    if (cnt) setCount(parseInt(cnt, 10));
    fetchNext();
  }, []);

  useEffect(() => {
    localStorage.setItem('seenIds', JSON.stringify(seenIds));
    localStorage.setItem('count', String(count));
  }, [seenIds, count]);

  const submit = async (picked: 'L' | 'R') => {
    if (!pair) return;
    const dt = Math.max(0, Math.round(performance.now() - t0.current));
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairId: pair.id, picked, timeMs: dt }),
    });
    setSeenIds((s) => [...s, pair.id]);
    setCount((c) => c + 1);
    fetchNext();
  };

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 12 }}>
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1, paddingBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span>진행도</span>
          <span>{count}/{TARGET}</span>
        </div>
        <div style={{ height: 8, background: '#eee', borderRadius: 8 }}>
          <div style={{ width: `${progress}%`, height: '100%', borderRadius: 8, background: '#111' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        {loading || !pair ? (
          <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: 32 }}>불러오는 중…</div>
        ) : (
          <>
            <button onClick={() => submit('L')} className={clsx('btn')}
              style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <img src={pair.left_url} alt="A" style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', borderRadius: 12 }} />
              <div style={{ textAlign: 'center', marginTop: 6, fontWeight: 600 }}>왼쪽 선택</div>
            </button>
            <button onClick={() => submit('R')} className={clsx('btn')}
              style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <img src={pair.right_url} alt="B" style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', borderRadius: 12 }} />
              <div style={{ textAlign: 'center', marginTop: 6, fontWeight: 600 }}>오른쪽 선택</div>
            </button>
          </>
        )}
      </div>

      <p style={{ opacity: 0.6, marginTop: 12, fontSize: 13 }}>Tip: 가볍게 탭해서 빠르게 진행하세요. (뒤로가기는 지원하지 않습니다)</p>
    </main>
  );
}
