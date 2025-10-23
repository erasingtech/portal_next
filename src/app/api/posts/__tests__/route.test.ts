import { NextRequest } from 'next/server';

import { DELETE, GET, POST, PUT } from '../route';

// Mock the necessary modules
jest.mock('@/utils/supabase/server', () => ({
    getSupabaseServerClient: jest.fn().mockResolvedValue({
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        range: jest.fn().mockReturnValue({
                            data: [],
                            error: null
                        })
                    })
                })
            }),
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockReturnValue({
                        data: { id: '1', title: 'Test Post' },
                        error: null
                    })
                })
            }),
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockReturnValue({
                            data: { id: '1', title: 'Updated Post' },
                            error: null
                        })
                    })
                })
            }),
            delete: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        data: null,
                        error: null
                    })
                })
            })
        }),
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: null } })
        }
    })
}));

jest.mock('@/utils/validation', () => ({
    postSchema: {
        safeParse: jest.fn().mockReturnValue({ success: true, data: {} })
    },
    sanitizeHtml: jest.fn().mockImplementation((html) => html)
}));

describe('Posts API', () => {
    describe('GET', () => {
        it('should return posts', async () => {
            const request = new NextRequest('http://localhost:3000/api/posts?status=published');
            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toBeDefined();
        });
    });

    describe('POST', () => {
        it('should create a post', async () => {
            // Mock authenticated user
            const { getSupabaseServerClient } = require('@/utils/supabase/server');
            getSupabaseServerClient.mockResolvedValue({
                from: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockReturnValue({
                                range: jest.fn().mockReturnValue({
                                    data: [],
                                    error: null
                                })
                            })
                        })
                    }),
                    insert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockReturnValue({
                                data: { id: '1', title: 'Test Post' },
                                error: null
                            })
                        })
                    })
                }),
                auth: {
                    getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } } })
                }
            });

            const request = new NextRequest('http://localhost:3000/api/posts', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Test Post',
                    slug: 'test-post',
                    html_content: '<p>This is a test post</p>'
                })
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).toBeDefined();
        });
    });
});
