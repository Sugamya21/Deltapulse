import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function getSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled by middleware/proxy
          }
        },
      },
    }
  );
}

/*
  Meaningful-change rules

  < 1%       = Normal
  1% - <3%   = Moderate
  3% - <5%   = Meaningful
  >= 5%      = Major
*/
function getChangeStatus(changePercent: number) {
  const absChange = Math.abs(changePercent);

  if (absChange >= 5) return 'major';
  if (absChange >= 3) return 'meaningful';
  if (absChange >= 1) return 'moderate';

  return 'normal';
}

/* GET: Fetch user's saved items + calculate current changes */
export async function GET() {
  const supabase = await getSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from('watchlist_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  /*
    Get live prices for the user's assets.
    We don't overwrite the last-checked price here.
  */
  const updatedItems = await Promise.all(
    (data || []).map(async (item) => {
      let currentPrice = Number(item.price || 0);
      let currentChange = Number(item.change || 0);
      let currentChangePercent = Number(item.change_percent || 0);

      try {
        const quote: any = await yahooFinance.quote(item.symbol);

        currentPrice =
          Number(quote.regularMarketPrice ?? currentPrice);

        currentChange =
          Number(quote.regularMarketChange ?? currentChange);

        currentChangePercent =
          Number(
            quote.regularMarketChangePercent ??
              currentChangePercent
          );
      } catch {
        // Keep stored values if Yahoo fails
      }

      /*
        If there is no previous check,
        use the saved price as the baseline.
      */
      const baselinePrice =
        item.last_checked_price !== null &&
        item.last_checked_price !== undefined
          ? Number(item.last_checked_price)
          : Number(item.price || currentPrice);

      let sinceLastCheck = 0;

      if (baselinePrice > 0) {
        sinceLastCheck =
          ((currentPrice - baselinePrice) / baselinePrice) * 100;
      }

      const changeStatus = getChangeStatus(sinceLastCheck);

      return {
        ...item,

        // Current live market information
        current_price: currentPrice,
        current_change: currentChange,
        current_change_percent: currentChangePercent,

        // Smart Watchlist information
        since_last_check: sinceLastCheck,
        change_status: changeStatus,

        // Whether this deserves attention
        needs_attention: Math.abs(sinceLastCheck) >= 3,
      };
    })
  );

  return NextResponse.json(updatedItems);
}

/* POST: Add/update watchlist or portfolio item */
export async function POST(request: Request) {
  const supabase = await getSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const {
      symbol,
      name,
      price,
      change,
      change_percent,
      asset_class,
      item_type,
    } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const resolvedItemType =
      item_type || 'watchlist';

    const numericPrice = Number(price || 0);

    const { data, error } = await supabase
      .from('watchlist_items')
      .upsert(
        {
          user_id: user.id,
          symbol,
          name: name || symbol,
          price: numericPrice,
          change: Number(change || 0),
          change_percent: Number(change_percent || 0),
          asset_class: asset_class || 'Equity',
          item_type: resolvedItemType,

          /*
            When an asset is first added,
            its current price becomes the first baseline.
          */
          last_checked_price: numericPrice,
          last_checked_at: new Date().toISOString(),
        },
        {
          onConflict:
            'user_id, symbol, item_type',
        }
      )
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data?.[0]);
  } catch (err) {
    console.error('Watchlist POST error:', err);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/*
  PATCH:
  Mark an asset as checked.

  The current price becomes the new baseline.
*/
export async function PATCH(request: Request) {
  const supabase = await getSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const { id, current_price } = body;

    if (!id || current_price === undefined) {
      return NextResponse.json(
        { error: 'id and current_price are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('watchlist_items')
      .update({
        price: Number(current_price),
        last_checked_price: Number(current_price),
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Mark checked error:', err);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/* DELETE: Remove item */
export async function DELETE(request: Request) {
  const supabase = await getSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);

  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Missing id parameter' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('watchlist_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}