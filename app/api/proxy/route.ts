import { NextRequest, NextResponse } from 'next/server';

const N8N_BASE = process.env.N8N_WEBHOOK_BASE || 'https://automation.preo-ia.info/webhook';

// Whitelist of allowed endpoints — only these can be proxied
const ALLOWED_ENDPOINTS = new Set([
  '/login',
  '/reset-password',
  '/check-access',
  '/list-produits',
  '/produit-create',
  '/produit-update',
  '/delete-produit',
  '/enregistrer-livraison',
  '/enregistrer-inventaire',
  '/vente-batch',
  '/list-ventes',
  '/insert-depense',
  '/list-depenses',
  '/list-serveurs',
  '/create-serveur',
  '/delete-serveur',
  '/sortie-insert',
  '/sortie-update',
  '/list-sorties-service',
  '/delete-sorties',
  '/list-rappels',
  '/create-rappel',
  '/delete-rappel',
]);

function isAllowed(endpoint: string | null): boolean {
  if (!endpoint) return false;
  // Must start with / and be in the whitelist
  return endpoint.startsWith('/') && ALLOWED_ENDPOINTS.has(endpoint);
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');

  if (!isAllowed(endpoint)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const res = await fetch(`${N8N_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');

  if (!isAllowed(endpoint)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const res = await fetch(`${N8N_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');

  if (!isAllowed(endpoint)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const res = await fetch(`${N8N_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}
