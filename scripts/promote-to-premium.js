// This script promotes a user to the 'premium' subscription tier.
// It first checks if the user running the script is an admin.
// Usage: node scripts/promote-to-premium.js <admin-username> <username-to-promote>

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

const promoteUser = async (adminUsername, usernameToPromote) => {
  if (!adminUsername || !usernameToPromote) {
    console.error('Please provide both an admin username and a username to promote.');
    process.exit(1);
  }

  try {
    // Check if the user running the script is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('username', adminUsername)
      .single();

    if (adminError) throw adminError;
    if (!adminUser || adminUser.subscription_tier !== 'premium') {
      console.error(`User "${adminUsername}" is not an admin and cannot perform this action.`);
      return;
    }

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

const adminUsername = process.argv[2];
const usernameToPromote = process.argv[3];
promoteUser(adminUsername, usernameToPromote);