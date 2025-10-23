import { postSchema, sanitizeHtml } from '../validation';

describe('Validation utilities', () => {
    describe('postSchema', () => {
        it('should validate a valid post', () => {
            const validPost = {
                title: 'Test Post',
                slug: 'test-post',
                html_content: '<p>This is a test post</p>',
                excerpt: 'This is a test excerpt',
                status: 'published',
                published_at: '2023-10-23T10:00:00Z'
            };

            const result = postSchema.safeParse(validPost);
            expect(result.success).toBe(true);
        });

        it('should reject invalid title', () => {
            const invalidPost = {
                title: '',
                slug: 'test-post',
                html_content: '<p>This is a test post</p>'
            };

            const result = postSchema.safeParse(invalidPost);
            expect(result.success).toBe(false);
        });

        it('should reject invalid slug', () => {
            const invalidPost = {
                title: 'Test Post',
                slug: 'test post',
                html_content: '<p>This is a test post</p>'
            };

            const result = postSchema.safeParse(invalidPost);
            expect(result.success).toBe(false);
        });
    });

    describe('sanitizeHtml', () => {
        it('should sanitize HTML content', () => {
            const dirtyHtml = '<script>alert("XSS");</script><p>This is a test</p>';
            const cleanHtml = sanitizeHtml(dirtyHtml);

            expect(cleanHtml).not.toContain('<script>');
            expect(cleanHtml).toContain('<p>This is a test</p>');
        });

        it('should allow iframes with specific attributes', () => {
            const dirtyHtml =
                '<iframe src="https://example.com" allowfullscreen frameborder="0" scrolling="yes"></iframe>';
            const cleanHtml = sanitizeHtml(dirtyHtml);

            expect(cleanHtml).toContain('<iframe');
            expect(cleanHtml).toContain('allowfullscreen');
            expect(cleanHtml).toContain('frameborder="0"');
            expect(cleanHtml).toContain('scrolling="yes"');
        });
    });
});
