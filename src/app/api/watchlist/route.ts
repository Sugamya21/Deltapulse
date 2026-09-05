import { NextResponse } from 'next/server';

let userStorage: Array<{
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  asset_class: string;
  type: 'watchlist' | 'portfolio';
}> = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'watchlist';

  const filtered = userStorage.filter(item => item.type === type);
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, name, price, change, change_percent, asset_class, type } = body;

    if (!symbol || !type) {
      return NextResponse.json({ error: 'Symbol and type are required' }, { status: 400 });
    }

    const existingIndex = userStorage.findIndex(item => item.symbol === symbol && item.type === type);

    if (existingIndex > -1) {
      userStorage[existingIndex] = {
        symbol,
        name: name || userStorage[existingIndex].name,
        price: price ?? userStorage[existingIndex].price,
        change: change ?? userStorage[existingIndex].change,
        change_percent: change_percent ?? userStorage[existingIndex].change_percent,
        asset_class: asset_class || userStorage[existingIndex].asset_class,
        type
      };
    } else {
      userStorage.push({
        symbol,
        name: name || symbol,
        price: price || 0,
        change: change || 0,
        change_percent: change_percent || 0,
        asset_class: asset_class || 'Stock',
        type
      });
    }

    return NextResponse.json({ success: true, data: userStorage });
  } catch (err) {
    console.error('Watchlist/Portfolio API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}