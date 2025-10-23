import { NextRequest } from 'next/server';

import { middleware } from '../../supabase/middleware';

// Mock the necessary modules
jest.mock('next/headers', () => ({
    cookies: jest.fn().mockResolvedValue({
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn()
    })
}));

jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn().mockReturnValue({
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
            refreshSession: jest.fn().mockResolvedValue({ error: null })
        }
    })
}));

describe('Supabase middleware', () => {
    it('should handle requests without errors', async () => {
        const request = new NextRequest('http://localhost:3000');
        const response = await middleware(request);

        expect(response).toBeDefined();
    });

    it('should refresh session for authenticated users', async () => {
        // Mock authenticated user
        const mockUser = { id: '123', email: 'test@example.com' };

        // Update the mock to return a user
        const { cookies } = require('next/headers');
        const { createServerClient } = require('@supabase/ssr');

        cookies.mockResolvedValue({
            getAll: jest.fn().mockReturnValue([]),
            set: jest.fn()
        });

        createServerClient.mockReturnValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
                refreshSession: jest.fn().mockResolvedValue({ error: null })
            }
        });

        const request = new NextRequest('http://localhost:3000');
        await middleware(request);

        expect(createServerClient().auth.refreshSession).toHaveBeenCalled();
    });
});
