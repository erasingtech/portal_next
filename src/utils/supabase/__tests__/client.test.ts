import { supabase } from '../../supabase/client';

describe('Supabase client', () => {
    it('should be defined', () => {
        expect(supabase).toBeDefined();
    });

    it('should have the expected methods', () => {
        expect(supabase.auth).toBeDefined();
        expect(supabase.from).toBeDefined();
        expect(supabase.rpc).toBeDefined();
    });
});
