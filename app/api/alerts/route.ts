import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://oapahwsqehtxawrvsqkg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YFvoGX2PUJTIyWWHGctD-Q_-A-EKzOr';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, companies, alert_type } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({ error: 'At least one company required' }, { status: 400 });
    }
    const validTypes = ['waitlist_open', 'price_drop', 'new_state', 'new_model'];
    if (!validTypes.includes(alert_type)) {
      return NextResponse.json({ error: 'Invalid alert_type' }, { status: 400 });
    }

    const rows = companies.map((c: string) => ({
      email: email.trim().toLowerCase(),
      company_name: c,
      alert_type,
    }));

    const res = await fetch(`${SUPABASE_URL}/rest/v1/prefab_alerts`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  // Health check / count
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/prefab_alerts?select=id&limit=1`,
      { headers: { apikey: SUPABASE_ANON_KEY } }
    );
    return NextResponse.json({ status: 'ok', supabase: res.ok });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
