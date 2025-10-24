'use client';

import { useEffect, useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/registry/new-york-v4/ui/alert-dialog';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Input } from '@/registry/new-york-v4/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/registry/new-york-v4/ui/resizable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';

import { FileText, Plus, Trash2 } from 'lucide-react';

interface Post {
    id: string;
    title: string;
    slug: string;
    html_content: string;
    js_content: string;
    excerpt: string | null;
    html_excerpt: string | null;
    js_excerpt: string | null;
    author_id: string | null;
    status: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [previewKey, setPreviewKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        html_excerpt: '',
        js_excerpt: '',
        status: 'draft' as 'draft' | 'published' | 'archived',
        html: '',
        js: ''
    });
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/posts?status=published,draft,archived&limit=100');
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

    const handleSelectPost = (post: Post) => {
        setSelectedPostId(post.id);
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            html_excerpt: post.html_excerpt || '',
            js_excerpt: post.js_excerpt || '',
            status: (post.status as any) || 'draft',
            html: post.html_content,
            js: post.js_content || ''
        });
    };

    const handleNewPost = () => {
        setEditingPost(null);
        setSelectedPostId(null);
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            html_excerpt: '',
            js_excerpt: '',
            status: 'draft',
            html: '',
            js: ''
        });
    };

    const generateSlugFromTitle = (title: string): string => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 100);
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'title') {
            const slug = generateSlugFromTitle(value);
            setFormData((prev) => ({ ...prev, title: value, slug }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
        if (['html', 'js', 'html_excerpt', 'js_excerpt'].includes(field)) {
            setPreviewKey((k) => k + 1);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                setPosts(posts.filter((p) => p.id !== id));
                if (selectedPostId === id) {
                    handleNewPost();
                }
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete post');
            }
        } catch (err) {
            setError('An error occurred while deleting the post');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (!formData.title.trim() || !formData.slug.trim()) {
                setError('Title and slug are required');
                setIsSubmitting(false);
                return;
            }

            const payload = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                html_excerpt: formData.html_excerpt,
                js_excerpt: formData.js_excerpt,
                status: formData.status,
                html_content: formData.html,
                js_content: formData.js,
                published_at: formData.status === 'published' ? new Date().toISOString() : null
            };

            const response = await fetch('/api/posts', {
                method: editingPost ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPost ? { id: editingPost.id, ...payload } : payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (editingPost) {
                    setPosts(posts.map((p) => (p.id === editingPost.id ? data : p)));
                } else {
                    setPosts([data, ...posts]);
                }
                handleNewPost();
            } else {
                setError(data.error || 'Failed to save post');
            }
        } catch (err) {
            setError('An error occurred while saving the post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewHtml = `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"><\/script></head><body style="margin: 0; padding: 8px;">${formData.html}<script>${formData.js}<\/script></body></html>`;

    if (loading) {
        return (
            <div className='flex h-screen w-full flex-col'>
                <div className='flex flex-1 items-center justify-center'>
                    <div className='text-center'>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-screen w-full flex-col bg-neutral-100'>
            <div className='flex flex-1'>
                <ResizablePanelGroup direction='horizontal' className='flex-1'>
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={40} collapsible>
                        <div className='flex h-full flex-col border-r border-neutral-300 bg-neutral-50'>
                            <div className='border-b border-neutral-300 p-3'>
                                <Button
                                    onClick={handleNewPost}
                                    className='h-8 w-full gap-2 bg-neutral-900 text-xs text-white hover:bg-neutral-800'>
                                    <Plus className='h-3 w-3' />
                                    New
                                </Button>
                            </div>
                            <div className='flex-1 overflow-y-auto'>
                                {posts.length === 0 ? (
                                    <div className='p-3 text-center text-xs text-neutral-500'>No posts yet</div>
                                ) : (
                                    <div className='space-y-1 p-2'>
                                        {posts.map((post) => (
                                            <div
                                                key={post.id}
                                                className='group flex items-center justify-between gap-1 rounded hover:bg-neutral-200'>
                                                <button
                                                    onClick={() => handleSelectPost(post)}
                                                    className={`flex-1 truncate px-2 py-1.5 text-left text-xs transition-colors ${
                                                        selectedPostId === post.id
                                                            ? 'bg-neutral-300 text-neutral-900'
                                                            : 'text-neutral-700 hover:bg-neutral-100'
                                                    }`}>
                                                    <FileText className='mr-1 mb-0.5 inline h-3 w-3' />
                                                    {post.title || 'Untitled'}
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className='mr-1 rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-200'>
                                                            <Trash2 className='h-3 w-3 text-neutral-600' />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. "{post.title}" will be
                                                            permanently deleted.
                                                        </AlertDialogDescription>
                                                        <div className='flex justify-end gap-3'>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(post.id)}
                                                                className='bg-neutral-900 text-white hover:bg-neutral-800'>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </div>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className='flex h-full flex-col'>
                            <div className='border-b border-neutral-300 bg-white p-4'>
                                <form onSubmit={handleSubmit} className='flex flex-col gap-4 md:flex-row'>
                                    <div className='space-y-1'>
                                        <label className='block text-xs font-medium text-neutral-700'>Title</label>
                                        <Input
                                            placeholder='Post title'
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className='h-8 min-w-48 border-neutral-300 bg-neutral-50 text-xs text-neutral-900 placeholder:text-neutral-400'
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className='block text-xs font-medium text-neutral-700'>Status</label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleInputChange('status', value)}>
                                            <SelectTrigger className='h-8 min-w-32 border-neutral-300 bg-neutral-50 text-xs text-neutral-900'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className='border-neutral-300 bg-neutral-50'>
                                                <SelectItem value='draft' className='text-neutral-900'>
                                                    Draft
                                                </SelectItem>
                                                <SelectItem value='published' className='text-neutral-900'>
                                                    Published
                                                </SelectItem>
                                                <SelectItem value='archived' className='text-neutral-900'>
                                                    Archived
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='flex flex-col gap-2 md:ml-4'>
                                        <Button
                                            type='submit'
                                            disabled={isSubmitting}
                                            className='h-8 w-full gap-2 bg-neutral-900 text-xs text-white hover:bg-neutral-800'>
                                            {isSubmitting ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                                        </Button>
                                        {editingPost && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        type='button'
                                                        className='h-8 w-full gap-2 bg-neutral-900 text-xs text-white hover:bg-neutral-800'>
                                                        <Trash2 className='h-3 w-3' />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. "{editingPost.title}" will be
                                                        permanently deleted.
                                                    </AlertDialogDescription>
                                                    <div className='flex justify-end gap-3'>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(editingPost.id)}
                                                            className='h-8 gap-2 bg-neutral-900 text-xs text-white hover:bg-neutral-800'>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </div>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                    {error && (
                                        <div className='mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700'>
                                            {error}
                                        </div>
                                    )}
                                </form>
                            </div>
                            <ResizablePanelGroup direction='horizontal' className='flex-1'>
                                <ResizablePanel defaultSize={60} minSize={30}>
                                    <div className='flex h-full flex-col border-r border-neutral-300 bg-white'>
                                        <Tabs defaultValue='content' className='flex h-full flex-col'>
                                            <TabsList className='grid w-full grid-cols-2'>
                                                <TabsTrigger value='content'>Content</TabsTrigger>
                                                <TabsTrigger value='excerpt'>Excerpt</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value='content' className='flex flex-1 flex-col'>
                                                <Tabs defaultValue='html' className='flex flex-1 flex-col'>
                                                    <TabsList className='grid w-full grid-cols-2'>
                                                        <TabsTrigger value='html'>HTML</TabsTrigger>
                                                        <TabsTrigger value='js'>JS</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value='html' className='m-0 flex-1 overflow-hidden'>
                                                        <textarea
                                                            placeholder='<div>Hello World</div>'
                                                            className='h-full w-full resize-none border-0 bg-neutral-50 p-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none'
                                                            value={formData.html}
                                                            onChange={(e) => handleInputChange('html', e.target.value)}
                                                            spellCheck={false}
                                                        />
                                                    </TabsContent>
                                                    <TabsContent value='js' className='m-0 flex-1 overflow-hidden'>
                                                        <textarea
                                                            placeholder='console.log(1);'
                                                            className='h-full w-full resize-none border-0 bg-neutral-50 p-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none'
                                                            value={formData.js}
                                                            onChange={(e) => handleInputChange('js', e.target.value)}
                                                            spellCheck={false}
                                                        />
                                                    </TabsContent>
                                                </Tabs>
                                            </TabsContent>
                                            <TabsContent value='excerpt' className='flex flex-1 flex-col'>
                                                <Tabs defaultValue='html_excerpt' className='flex flex-1 flex-col'>
                                                    <TabsList className='grid w-full grid-cols-2'>
                                                        <TabsTrigger value='html_excerpt'>HTML</TabsTrigger>
                                                        <TabsTrigger value='js_excerpt'>JS</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent
                                                        value='html_excerpt'
                                                        className='m-0 flex-1 overflow-hidden'>
                                                        <textarea
                                                            placeholder='<div>Excerpt HTML</div>'
                                                            className='h-full w-full resize-none border-0 bg-neutral-50 p-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none'
                                                            value={formData.html_excerpt}
                                                            onChange={(e) =>
                                                                handleInputChange('html_excerpt', e.target.value)
                                                            }
                                                            spellCheck={false}
                                                        />
                                                    </TabsContent>
                                                    <TabsContent
                                                        value='js_excerpt'
                                                        className='m-0 flex-1 overflow-hidden'>
                                                        <textarea
                                                            placeholder='console.log(2);'
                                                            className='h-full w-full resize-none border-0 bg-neutral-50 p-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none'
                                                            value={formData.js_excerpt}
                                                            onChange={(e) =>
                                                                handleInputChange('js_excerpt', e.target.value)
                                                            }
                                                            spellCheck={false}
                                                        />
                                                    </TabsContent>
                                                </Tabs>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={40} minSize={20} collapsible>
                                    <div className='flex h-full flex-col bg-white'>
                                        <div className='border-b border-neutral-300 bg-neutral-100 px-3 py-2'>
                                            <div className='text-xs font-semibold text-neutral-700'>PREVIEW</div>
                                        </div>
                                        <div className='flex-1 overflow-hidden'>
                                            <iframe
                                                key={previewKey}
                                                srcDoc={previewHtml}
                                                className='h-full w-full border-0 bg-white'
                                                sandbox='allow-scripts'
                                                title='Preview'
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
