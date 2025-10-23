import { getSupabaseServerClient } from '../../supabase/server';

describe('Supabase server client', () => {
    it('should be defined', async () => {
        const supabase = await getSupabaseServerClient();
        expect(supabase).toBeDefined();
    });

    it('should have the expected methods', async () => {
        const supabase = await getSupabaseServerClient();
        expect(supabase.auth).toBeDefined();
        expect(supabase.from).toBeDefined();
        expect(supabase.rpc).toBeDefined();
    });
});
