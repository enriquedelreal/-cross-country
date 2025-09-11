import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Check for secret to confirm this is a valid request
    const secret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.REVALIDATE_SECRET;
    
    if (!expectedSecret) {
      return NextResponse.json({ message: 'Revalidation not configured' }, { status: 500 });
    }
    
    if (secret !== expectedSecret) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate all pages that depend on the Google Sheets data
    revalidatePath('/');
    revalidatePath('/compare');
    
    // Revalidate all runner pages
    // Note: In a real app, you might want to get the list of runners and revalidate each one
    // For now, we'll revalidate the pattern
    revalidatePath('/runner/[name]', 'page');

    return NextResponse.json({ 
      message: 'Revalidation successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Revalidation failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
