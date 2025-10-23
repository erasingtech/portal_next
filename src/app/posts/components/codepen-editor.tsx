'use client';

import { useState } from 'react';

import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Textarea } from '@/registry/new-york-v4/ui/textarea';

interface PostFormData {
    title: string;
    slug: string;
    excerpt: string;
    status: 'draft' | 'published' | 'archived';
    html: string;
    css: string;
    js: string;
}

interface CodepenEditorProps {
    onSuccess?: () => void;
    initialData?: any;
}

export const CodepenEditor = ({ onSuccess, initialData }: CodepenEditorProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [previewKey, setPreviewKey] = useState(0);

    // Parse initial content if it exists
    const parseContent = (content: string) => {
        if (!content) return { html: '', css: '', js: '' };

        const htmlMatch = content.match(/<!--HTML-->([\s\S]*?)(?=<!--CSS-->|$)/);
        const cssMatch = content.match(/<!--CSS-->([\s\S]*?)(?=<!--JS-->|$)/);
        const jsMatch = content.match(/<!--JS-->([\s\S]*?)$/);

        return {
            html: htmlMatch ? htmlMatch[1].trim() : '',
            css: cssMatch ? cssMatch[1].trim() : '',
            js: jsMatch ? jsMatch[1].trim() : ''
        };
    };

    const initialParsed = initialData ? parseContent(initialData.html_content) : { html: '', css: '', js: '' };

    const [formData, setFormData] = useState<PostFormData>({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        status: initialData?.status || 'draft',
        html: initialParsed.html,
        css: initialParsed.css,
        js: initialParsed.js
    });

    const handleInputChange = (field: keyof PostFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Validate required fields
            if (!formData.title.trim() || !formData.slug.trim()) {
                setSubmitError('Title and slug are required');
                setIsSubmitting(false);
                return;
            }

            // Compose HTML, CSS, and JS into single content
            const html_content = `<!--HTML-->
${formData.html}
<!--CSS-->
${formData.css}
<!--JS-->
${formData.js}`;

            const url = '/api/posts';
            const method = initialData ? 'PUT' : 'POST';

            const payload = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                status: formData.status,
                html_content,
                published_at: formData.status === 'published' ? new Date().toISOString() : null
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(initialData ? { id: initialData.id, ...payload } : payload)
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({
                    title: '',
                    slug: '',
                    excerpt: '',
                    status: 'draft',
                    html: '',
                    css: '',
                    js: ''
                });
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setSubmitError(data.error || 'Failed to save post');
            }
        } catch (error) {
            setSubmitError('An error occurred while saving the post');
        } finally {
            setIsSubmitting(false);
        }
    }

    const previewHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>${formData.css}</style>
</head>
<body>
    ${formData.html}
    <script>${formData.js}</script>
</body>
</html>
    `;

    return (
        <div className='space-y-6'>
            {/* Form Header */}
            <Card>
                <CardHeader>
                    <CardTitle>{initialData ? 'Edit Post' : 'Create New Post'}</CardTitle>
                    <CardDescription>
                        {initialData ? 'Update your post details' : 'Create a new post with HTML, CSS, and JavaScript'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className='space-y-6'>
                        {/* Title and Slug */}
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Title</label>
                                <Input
                                    placeholder='Post title'
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                />
                            </div>

                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Slug</label>
                                <Input
                                    placeholder='post-slug'
                                    value={formData.slug}
                                    onChange={(e) => handleInputChange('slug', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Excerpt (Optional)</label>
                            <Textarea
                                placeholder='Brief summary'
                                className='resize-none'
                                value={formData.excerpt}
                                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                            />
                        </div>

                        {/* Status */}
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Status</label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='draft'>Draft</SelectItem>
                                    <SelectItem value='published'>Published</SelectItem>
                                    <SelectItem value='archived'>Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {submitError && <div className='text-sm text-red-500'>{submitError}</div>}

                        <Button type='submit' disabled={isSubmitting} className='w-full'>
                            {isSubmitting ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Code Editor Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Code Editor</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='html' className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='html'>HTML</TabsTrigger>
                            <TabsTrigger value='css'>CSS</TabsTrigger>
                            <TabsTrigger value='js'>JavaScript</TabsTrigger>
                        </TabsList>

                        <TabsContent value='html' className='mt-4 space-y-2'>
                            <label className='text-sm font-medium'>HTML</label>
                            <Textarea
                                placeholder='<div>Hello World</div>'
                                className='min-h-64 resize-none font-mono'
                                value={formData.html}
                                onChange={(e) => {
                                    handleInputChange('html', e.target.value);
                                    setPreviewKey((k) => k + 1);
                                }}
                            />
                        </TabsContent>

                        <TabsContent value='css' className='mt-4 space-y-2'>
                            <label className='text-sm font-medium'>CSS</label>
                            <Textarea
                                placeholder='div { color: blue; }'
                                className='min-h-64 resize-none font-mono'
                                value={formData.css}
                                onChange={(e) => {
                                    handleInputChange('css', e.target.value);
                                    setPreviewKey((k) => k + 1);
                                }}
                            />
                        </TabsContent>

                        <TabsContent value='js' className='mt-4 space-y-2'>
                            <label className='text-sm font-medium'>JavaScript</label>
                            <Textarea
                                placeholder='console.log("Hello");'
                                className='min-h-64 resize-none font-mono'
                                value={formData.js}
                                onChange={(e) => {
                                    handleInputChange('js', e.target.value);
                                    setPreviewKey((k) => k + 1);
                                }}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='min-h-96 overflow-hidden rounded-lg border bg-white'>
                        <iframe
                            key={previewKey}
                            srcDoc={previewHtml}
                            className='h-96 w-full border-0'
                            sandbox='allow-scripts'
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
