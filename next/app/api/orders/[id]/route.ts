import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const orderId = params.id;

    await query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [
      status,
      orderId,
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
