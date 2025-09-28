import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy for DOMA GraphQL
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_DOMA_GRAPHQL_URL || 'https://api-testnet.doma.xyz/graphql'
  const apiKey = process.env.NEXT_PUBLIC_DOMA_API_KEY || ''

  try {
    const body = await req.json()

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(body),
      // You can tweak cache as needed
      cache: 'no-store',
    })

    const text = await res.text()
    const data = safeJson(text)

    if (!res.ok) {
      return NextResponse.json(
        { errors: [{ message: `Proxy error ${res.status}: ${data?.message || text}` }] },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { errors: [{ message: error?.message || 'Unknown proxy error' }] },
      { status: 502 }
    )
  }
}

function safeJson(s: string) {
  try {
    return JSON.parse(s)
  } catch {
    return { message: s }
  }
}
