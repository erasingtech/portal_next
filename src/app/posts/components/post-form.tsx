'use client';

import { useState } from 'react';

import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/registry/new-york-v4/ui/form';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Textarea } from '@/registry/new-york-v4/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

const postFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .max(100, 'Slug must be less than 100 characters'),
    html_content: z.string().min(1, 'Content is required'),
    excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
    status: z.enum(['draft', 'published', 'archived']),
    published_at: z.string().optional()
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface PostFormProps {
    onSuccess?: () => void;
    initialData?: any;
}

export const PostForm = ({ onSuccess, initialData }: PostFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postFormSchema),
        defaultValues: initialData || {
            title: '',
            slug: '',
            html_content: '',
            excerpt: '',
            status: 'draft',
            published_at: ''
        }
    });

    async function onSubmit(values: PostFormValues) {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const url = initialData ? '/api/posts' : '/api/posts';
            const method = initialData ? 'PUT' : 'POST';

            // Set published_at to now if status is published
            const payload = {
                ...values,
                published_at: values.status === 'published' ? new Date().toISOString() : null
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
                form.reset();
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>{initialData ? 'Edit Post' : 'Create New Post'}</CardTitle>
                <CardDescription>
                    {initialData ? 'Update an existing post' : 'Add a new post to your collection'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                            control={form.control}
                            name='title'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter post title' {...field} />
                                    </FormControl>
                                    <FormDescription>The title of your post</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='slug'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input placeholder='post-slug' {...field} />
                                    </FormControl>
                                    <FormDescription>URL-friendly slug for your post</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='excerpt'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Excerpt (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Brief summary of your post'
                                            className='resize-none'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>A short summary displayed on the post list</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='html_content'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Your post content (supports HTML)'
                                            className='min-h-64 resize-none'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The main content of your post (supports HTML tags)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='status'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select a status' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='draft'>Draft</SelectItem>
                                            <SelectItem value='published'>Published</SelectItem>
                                            <SelectItem value='archived'>Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Choose whether to publish this post</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {submitError && <div className='text-sm text-red-500'>{submitError}</div>}

                        <Button type='submit' disabled={isSubmitting} className='w-full'>
                            {isSubmitting ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
