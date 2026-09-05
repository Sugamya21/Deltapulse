import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // Fetch live quote summary from Yahoo Finance API
    const res = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryDetail,financialData,defaultKeyStatistics,assetProfile,recommendationTrend`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch asset details');
    }

    const data = await res.json();
    const result = data.quoteSummary?.result?.[0];

    return NextResponse.json(result || {});
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching details' }, { status: 500 });
  }
}