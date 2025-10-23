import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export const postSchema = z.object({
    title: z.string().min(1).max(200),
    slug: z
        .string()
        .regex(/^[a-z0-9-]+$/)
        .min(1)
        .max(100),
    html_content: z.string().min(1),
    js_content: z.string().optional().default(''),
    excerpt: z.string().max(300).optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    published_at: z.coerce.date().optional()
});

export const sanitizeHtml = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
    });
};
