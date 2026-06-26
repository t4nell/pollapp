import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';


@Injectable({
  providedIn: 'root',
})


export class Supabase {
  supabaseUrl = 'https://jnbhsxeqhbdrgisdrpdp.supabase.co'
  supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYmhzeGVxaGJkcmdpc2RycGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NTgwMTMsImV4cCI6MjA5NzUzNDAxM30.tPIZgMnhMmZrTpB1xafTkumvI-8QL3khYhb3eBtH64o"
  supabase = createClient(this.supabaseUrl, this.supabaseKey) 
}