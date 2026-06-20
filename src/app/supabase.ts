import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';


@Injectable({
  providedIn: 'root',
})


export class Supabase {
    supabaseUrl = 'https://jnbhsxeqhbdrgisdrpdp.supabase.co/rest/v1/'
    supabaseKey = "sb_publishable_0OpwVvdcIOavIHP0-0Y5Jg_QrpYxsxI"
    supabase = createClient(this.supabaseUrl, this.supabaseKey)
}