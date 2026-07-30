import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xvswuznozennnlpgbjkb.supabase.co'
const supabaseKey = 'sb_publishable_2m_NsWBLuICk-goyPqTkSg_XFyEyRPf'

export const supabase = createClient(supabaseUrl, supabaseKey)
