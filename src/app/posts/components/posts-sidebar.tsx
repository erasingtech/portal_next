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
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from '@/registry/new-york-v4/ui/sidebar';

import { FileText, Plus, Trash2 } from 'lucide-react';

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

interface PostsSidebarProps {
    posts: Post[];
    selectedPostId: string | null;
    onSelectPost: (post: Post | null) => void;
    onDeletePost: (id: string) => void;
}

export function PostsSidebar({ posts, selectedPostId, onSelectPost, onDeletePost }: PostsSidebarProps) {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className='flex items-center justify-between gap-2'>
                    <div className='flex flex-col'>
                        <span className='text-sm font-semibold'>Posts</span>
                        <span className='text-xs text-gray-500'>{posts.length} posts</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>All Posts</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {posts.length === 0 ? (
                                <div className='px-2 py-4 text-center text-sm text-gray-500'>No posts yet</div>
                            ) : (
                                posts.map((post) => (
                                    <SidebarMenuItem key={post.id}>
                                        <div className='group flex items-center justify-between gap-2'>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={selectedPostId === post.id}
                                                onClick={() => onSelectPost(post)}
                                                className='flex-1'>
                                                <button className='flex items-center gap-2 text-left'>
                                                    <FileText className='h-4 w-4' />
                                                    <span className='truncate text-sm'>{post.title || 'Untitled'}</span>
                                                </button>
                                            </SidebarMenuButton>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100'>
                                                        <Trash2 className='h-3 w-3' />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{post.title}"? This action
                                                        cannot be undone.
                                                    </AlertDialogDescription>
                                                    <div className='flex justify-end gap-4'>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => onDeletePost(post.id)}
                                                            className='bg-red-600 hover:bg-red-700'>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </div>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Button onClick={() => onSelectPost(null)} className='w-full' size='sm'>
                    <Plus className='mr-2 h-4 w-4' />
                    New Post
                </Button>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
