import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.trim() || '';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    
    if (!quote) {
      return NextResponse.json({ error: 'Failed to fetch asset details' }, { status: 404 });
    }

    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice ?? 0,
      change: quote.regularMarketChange ?? 0,
      change_percent: quote.regularMarketChangePercent ?? 0,
      market_cap: quote.marketCap ?? null,
      volume: quote.regularMarketVolume ?? null,
      day_high: quote.regularMarketDayHigh ?? null,
      day_low: quote.regularMarketDayLow ?? null,
      pe_ratio: quote.trailingPE ?? null,
      currency: quote.currency ?? 'USD',
    });
  } catch (err) {
    console.error('Asset details API error:', err);
    return NextResponse.json({ error: 'Failed to fetch asset details' }, { status: 500 });
  }
}