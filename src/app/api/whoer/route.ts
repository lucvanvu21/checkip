export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return NextResponse.json({ error: 'Missing ip' }, { status: 400 });
  }

  try {
    const start = performance.now();

    const res = await fetch(`https://whoer.com/api_v1/index/index?language=vi-vn&ip=${ip}`, {
      // QUAN TRỌNG
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'application/json',
      },
      // không cache mặc định
      cache: 'no-store',
    });

    const data = await res.json();

    const end = performance.now();
    console.log(`[WHOER SERVER] ${Math.round(end - start)} ms`);

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Whoer fetch failed' }, { status: 500 });
  }
}
