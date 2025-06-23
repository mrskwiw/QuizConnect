// This script promotes a user to the 'premium' subscription tier.
// Usage: node scripts/promote-to-premium.js <username-to-promote>

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Key is not defined in your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const promoteUser = async (usernameToPromote) => {
  if (!usernameToPromote) {
    console.error('Please provide a username to promote.');
    process.exit(1);
  }

  try {
    // Find the user to promote
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('username', usernameToPromote);

    if (findError) throw findError;
    if (!users || users.length === 0) {
      console.error(`User "${usernameToPromote}" not found.`);
      return;
    }

    const userId = users[0].id;

    // Update the user's subscription tier
    const { error: updateError } = await supabase
      .from('users')
      .update({ subscription_tier: 'premium', subscription_status: 'active' })
      .eq('id', userId);

    if (updateError) throw updateError;

    console.log(`Successfully promoted user "${usernameToPromote}" to the premium tier.`);
  } catch (error) {
    console.error('Error promoting user:', error.message);
  }
};

const usernameToPromote = process.argv[2];
promoteUser(usernameToPromote);