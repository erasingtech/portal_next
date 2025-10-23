'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { supabase } from '@/utils/supabase/client';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                setError(error.message);
            } else {
                // Redirect to posts page after successful login
                router.push('/posts');
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) {
                setError(error.message);
            } else {
                setError('Check your email for confirmation link');
            }
        } catch (err) {
            setError('An error occurred during sign up');
        }
    };

    return (
        <div className='container mx-auto p-4'>
            <h1 className='mb-4 text-2xl font-bold'>Login</h1>

            {error && <div className='mb-4 rounded bg-red-100 p-2 text-red-700'>{error}</div>}

            <form onSubmit={handleLogin} className='mb-4 space-y-4'>
                <div>
                    <label className='mb-1 block'>Email</label>
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full rounded border p-2'
                        required
                    />
                </div>
                <div>
                    <label className='mb-1 block'>Password</label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full rounded border p-2'
                        required
                    />
                </div>
                <div className='flex gap-2'>
                    <button type='submit' className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'>
                        Login
                    </button>
                    <button
                        type='button'
                        onClick={handleSignUp}
                        className='rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600'>
                        Sign Up
                    </button>
                </div>
            </form>

            <div className='mt-4'>
                <p>
                    Don't have an account?{' '}
                    <a href='/login' className='text-blue-500 hover:underline'>
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
