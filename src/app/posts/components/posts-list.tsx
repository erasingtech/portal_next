'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';

interface Post {
    id: string;
    title: string;
    slug: string;
    html_content: string;
    excerpt: string | null;
    author_id: string | null;
    status: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

const PostsList = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
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
        return (
            <div className='container mx-auto py-8'>
                <div className='text-center'>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='container mx-auto py-8'>
                <div className='text-center text-red-500'>Error: {error}</div>
            </div>
        );
    }

    return (
        <div className='container mx-auto py-8'>
            <div className='mb-8 flex items-center justify-between'>
                <div>
                    <h1 className='mb-2 text-4xl font-bold'>Posts</h1>
                    <p className='text-gray-600'>Browse all published posts</p>
                </div>
                <Link href='/posts'>
                    <Button>Create Post</Button>
                </Link>
            </div>

            {posts.length === 0 ? (
                <Card>
                    <CardContent className='pt-6 text-center text-gray-500'>
                        <p>No posts found. Start creating one!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {posts.map((post) => (
                        <Card key={post.id} className='flex flex-col transition-shadow hover:shadow-lg'>
                            <CardHeader>
                                <CardTitle className='line-clamp-2'>{post.title}</CardTitle>
                                {post.published_at && (
                                    <CardDescription>
                                        {new Date(post.published_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className='flex-grow'>
                                {post.excerpt && <p className='line-clamp-3 text-sm text-gray-600'>{post.excerpt}</p>}
                                {!post.excerpt && post.html_content && (
                                    <p className='line-clamp-3 text-sm text-gray-600'>
                                        {post.html_content.replace(/<[^>]*>/g, '')}
                                    </p>
                                )}
                            </CardContent>
                            <div className='p-6 pt-0'>
                                <Link href={`/posts/${post.slug}`}>
                                    <Button variant='outline' className='w-full'>
                                        Read More
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostsList;
