// ==========================================================================
// Supabase client
//
// SUPABASE_URL と SUPABASE_ANON_KEY は「公開しても問題ない」値です。
// これはパスワードではなく、あなたのSupabaseプロジェクトの「住所」のようなもの。
// 実際のログイン（メール+パスワード）はSupabase Auth側で管理されるので、
// ここに書いても安全です（README.mdの説明を参照）。
// ==========================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://nylftyidqzsbkxoggoci.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4UEMJK2sZw6XelqODkUyuw_uk03akSM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
