export type Database = {
    public: {
        Tables: {
            posts: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    html_content: string;
                    js_content: string;
                    excerpt: string | null;
                    author_id: string | null;
                    status: string;
                    published_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    html_content: string;
                    js_content?: string;
                    excerpt?: string | null;
                    author_id?: string | null;
                    status?: string;
                    published_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    html_content?: string;
                    js_content?: string;
                    excerpt?: string | null;
                    author_id?: string | null;
                    status?: string;
                    published_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
};
