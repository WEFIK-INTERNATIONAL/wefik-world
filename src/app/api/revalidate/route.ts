import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const secret =
      request.nextUrl.searchParams.get('secret') ||
      request.headers.get('x-revalidate-secret') ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    const expectedSecret = process.env.REVALIDATION_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid or missing revalidation secret' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { path, tag } = body as { path?: string; tag?: string };

    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        path,
        timestamp: Date.now(),
      });
    }

    if (tag) {
      revalidateTag(tag, 'max');
      return NextResponse.json({
        revalidated: true,
        type: 'tag',
        tag,
        timestamp: Date.now(),
      });
    }

    // Default: revalidate home and blog
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/marketplace');

    return NextResponse.json({
      revalidated: true,
      scope: 'default',
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
