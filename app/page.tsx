'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type Pair = { id: string; left_url: string; right_url: string };

const TARGET = 20; // 원하는 문항 수 (예: 20로 설정)

export default function Page() {
  const [pair, setPair] = useState<Pair | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const t0 = useRef<number>(0);

  const progress = useMemo(
    () => Math.min(100, Math.round((count / TARGET) * 100)),
    [count]
  );

  const fetchNext = async () => {
    // 완료되면 더 불러오지 않음
    if (count >= TARGET) {
      setFinished(true);
      setPair(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch('/api/nextPair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seenIds }),
    });
    const data = await res.json();
    setPair(data.pair ?? null);
    setLoading(false);
    t0.current = performance.now();
  };

  useEffect(() => {
    const saved = localStorage.getItem('seenIds');
    const cnt = localStorage.getItem('count');
    if (saved) setSeenIds(JSON.parse(saved));
    if (cnt) setCount(parseInt(cnt, 10));
    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    setCount((c) => {
      const next = c + 1;
      if (next >= TARGET) {
        setFinished(true);
        setPair(null);
      }
      return next;
    });

    fetchNext();
  };

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 12 }}>
      {/* 진행 바 */}
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1, paddingBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span>진행도</span>
          <span>{count}/{TARGET}</span>
        </div>
        <div style={{ height: 8, background: '#eee', borderRadius: 8 }}>
          <div style={{ width: `${progress}%`, height: '100%', borderRadius: 8, background: '#111' }} />
        </div>
      </div>

      {/* 완료 화면 */}
      {finished && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            오늘의 선택을 마쳤습니다.
          </div>
          <p style={{ opacity: 0.7, marginBottom: 16 }}>
            초기화하면 처음부터 다시 시작합니다.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('seenIds');
              localStorage.removeItem('count');
              location.reload();
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #111',
              background: '#fff',
              fontWeight: 600
            }}
          >
            초기화하고 다시 시작
          </button>
        </div>
      )}

      {/* 문항 카드 */}
      {!finished && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
          {loading || !pair ? (
            <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: 32 }}>
              불러오는 중…
            </div>
          ) : (
            <>
              <button onClick={() => submit('L')} style={{ border: 'none', padding: 0, background: 'transparent' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pair.left_url} alt="A" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 12 }} />
                <div style={{ textAlign: 'center', marginTop: 6, fontWeight: 600 }}>왼쪽 선택</div>
              </button>
              <button onClick={() => submit('R')} style={{ border: 'none', padding: 0, background: 'transparent' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pair.right_url} alt="B" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 12 }} />
                <div style={{ textAlign: 'center', marginTop: 6, fontWeight: 600 }}>오른쪽 선택</div>
              </button>
            </>
          )}
        </div>
      )}

      {!finished && (
        <p style={{ opacity: 0.6, marginTop: 12, fontSize: 13 }}>
          Tip: 가볍게 탭해서 빠르게 진행하세요.
        </p>
      )}
    </main>
  );
}
