import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export const postSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .max(100, 'Slug too long'),
    html_content: z.string().optional().default(''),
    js_content: z.string().optional().default(''),
    excerpt: z.string().max(300, 'Excerpt too long').optional().or(z.literal('')),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    published_at: z.string().nullable().optional()
});

export const sanitizeHtml = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
    });
};
