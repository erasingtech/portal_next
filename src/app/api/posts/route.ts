import { NextResponse } from 'next/server';

import type { Database } from '@/utils/database.types';
import { getSupabaseServiceClient } from '@/utils/supabase/server';
import { postSchema, sanitizeHtml } from '@/utils/validation';

// Helper to map Supabase rows to public shape (omit internal fields)
type PostRow = Database['public']['Tables']['posts']['Row'];
type PostPublic = Omit<PostRow, 'author_id'> & { authorId: string | null };

const toPublic = (row: PostRow): PostPublic => ({
    ...row,
    authorId: row.author_id
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const offset = Number(searchParams.get('offset')) || 0;

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const posts = (data as PostRow[]).map(toPublic);
    return NextResponse.json({ posts, limit, offset });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const parsed = postSchema.safeParse(body);
        if (!parsed.success) {
            const errorMessages = Object.entries(parsed.error.flatten().fieldErrors)
                .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
                .join('; ');
            console.error('❌ Validation error:', errorMessages);
            return NextResponse.json({ error: errorMessages }, { status: 400 });
        }

        const supabase = getSupabaseServiceClient();
        const cleanHtml = sanitizeHtml(parsed.data.html_content);

        console.log('📝 Creating post with data:', { ...parsed.data, html_content: '...' });

        const { error, data } = await supabase
            .from('posts')
            .insert({
                ...parsed.data,
                html_content: cleanHtml,
                author_id: null
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('✅ Post created successfully');
        return NextResponse.json(toPublic(data as PostRow), { status: 201 });
    } catch (err) {
        console.error('❌ Exception in POST:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// ---- UPDATE ------------------------------------------------------
export async function PUT(request: Request) {
    try {
        const { id, ...rest } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
        }

        const parsed = postSchema.partial().safeParse(rest);
        if (!parsed.success) {
            const errorMessages = Object.entries(parsed.error.flatten().fieldErrors)
                .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
                .join('; ');
            console.error('❌ Validation error:', errorMessages);
            return NextResponse.json({ error: errorMessages }, { status: 400 });
        }

        const supabase = getSupabaseServiceClient();

        const updatePayload = {
            ...parsed.data,
            ...(parsed.data?.html_content && {
                html_content: sanitizeHtml(parsed.data.html_content)
            })
        };

        console.log('📝 Updating post with payload:', { id, updatePayload });

        const { error, data } = await supabase.from('posts').update(updatePayload).eq('id', id).select().single();

        if (error) {
            console.error('❌ Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('✅ Post updated successfully');
        return NextResponse.json(toPublic(data as PostRow));
    } catch (err) {
        console.error('❌ Exception in PUT:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// ---- DELETE ------------------------------------------------------
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
