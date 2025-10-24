'use client';

import { useEffect, useState } from 'react';

interface Post {
    id: string;
    title: string;
    slug: string;
    html_excerpt: string | null;
    js_excerpt: string | null;
    excerpt: string | null;
}

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [iframeKeys, setIframeKeys] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'resize') {
                const iframe = document.getElementById(`iframe-${event.data.id}`) as HTMLIFrameElement;
                if (iframe) {
                    iframe.style.height = event.data.height + 'px';
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/posts?status=published&limit=100');
            const data = await response.json();

            if (response.ok) {
                setPosts(data.posts);
            } else {
                setError(data.error || 'Failed to fetch posts');
            }
        } catch (err) {
            setError('An error occurred while fetching posts');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className='flex items-center justify-center p-8'>Loading posts...</div>;
    }

    if (error) {
        return <div className='flex items-center justify-center p-8 text-red-500'>{error}</div>;
    }

    const generateExcerptHtml = (post: Post) => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; }
    </style>
</head>
<body>
    ${post.html_excerpt || ''}
    <script>
        ${post.js_excerpt || ''}
        // Notify parent of content height
        window.addEventListener('load', () => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: 'resize', height, id: '${post.id}' }, '*');
        });
    </script>
</body>
</html>`;
    };

    const getColSpanClass = (html: string | null) => {
        if (!html) return 'col-span-12';
        const match = html.match(/col-span-(\d+)/);
        if (!match) return 'col-span-12';

        const span = match[1];
        const spanMap: { [key: string]: string } = {
            '1': 'col-span-1',
            '2': 'col-span-2',
            '3': 'col-span-3',
            '4': 'col-span-4',
            '5': 'col-span-5',
            '6': 'col-span-6',
            '7': 'col-span-7',
            '8': 'col-span-8',
            '9': 'col-span-9',
            '10': 'col-span-10',
            '11': 'col-span-11',
            '12': 'col-span-12'
        };
        return spanMap[span] || 'col-span-12';
    };

    return (
        <div className='min-h-screen bg-white'>
            <div className='grid grid-cols-12'>
                {posts.map((post) => (
                    <iframe
                        key={post.id}
                        id={`iframe-${post.id}`}
                        srcDoc={generateExcerptHtml(post)}
                        className={`${getColSpanClass(post.html_excerpt)} w-full border-0`}
                        sandbox='allow-scripts allow-same-origin'
                        style={{ minHeight: '200px', display: 'block' }}
                    />
                ))}
                {posts.length === 0 && <div className='col-span-12 text-center text-gray-500'>No posts found</div>}
            </div>
        </div>
    );
}
