/**
 * Login Diagnostic & Password Reset Script
 * 
 * Usage:
 *   node diagnose-login.js                          -- Lists all users & volunteers
 *   node diagnose-login.js test user@email.com pass  -- Tests login for a user
 *   node diagnose-login.js test-volunteer vol@email.com pass -- Tests login for a volunteer
 *   node diagnose-login.js reset user@email.com newpass      -- Resets a user's password
 *   node diagnose-login.js reset-volunteer vol@email.com newpass -- Resets a volunteer's password
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './models/User.js';
import Volunteer from './models/VolunteerModel.js';

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const [,, command, emailArg, passwordArg] = process.argv;

    if (!command || command === 'list') {
      // List all users and volunteers
      console.log('=== ALL USERS ===');
      const users = await User.find({}, 'username email role').lean();
      users.forEach(u => console.log(`  📧 ${u.email} | username: ${u.username} | role: ${u.role}`));
      console.log(`  Total: ${users.length}\n`);

      console.log('=== ALL VOLUNTEERS ===');
      const volunteers = await Volunteer.find({}, 'firstName lastName email applicationStatus centerId').lean();
      volunteers.forEach(v => console.log(`  📧 ${v.email} | name: ${v.firstName} ${v.lastName} | status: ${v.applicationStatus} | centerId: ${v.centerId || 'none'}`));
      console.log(`  Total: ${volunteers.length}\n`);

    } else if (command === 'test') {
      if (!emailArg || !passwordArg) {
        console.log('Usage: node diagnose-login.js test <email> <password>');
        process.exit(1);
      }
      console.log(`🔍 Testing USER login for: ${emailArg}`);
      const user = await User.findOne({ email: emailArg });
      if (!user) {
        console.log('❌ User NOT found in database');
      } else {
        console.log(`✅ User found: ${user.username} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password hash: ${user.password?.substring(0, 20)}...`);
        console.log(`   Hash starts with $2: ${user.password?.startsWith('$2')}`);
        
        if (!user.password?.startsWith('$2')) {
          console.log('⚠️  PASSWORD IS NOT HASHED! This is the problem.');
          console.log('   The password stored in the DB is in plain text.');
        } else {
          const isMatch = await bcrypt.compare(passwordArg, user.password);
          console.log(`   Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
          
          if (!isMatch) {
            console.log('\n   ⚠️  Password mismatch. The stored hash does not match this password.');
            console.log('   Run: node diagnose-login.js reset ' + emailArg + ' <new-password>');
          }
        }
      }

    } else if (command === 'test-volunteer') {
      if (!emailArg || !passwordArg) {
        console.log('Usage: node diagnose-login.js test-volunteer <email> <password>');
        process.exit(1);
      }
      console.log(`🔍 Testing VOLUNTEER login for: ${emailArg}`);
      const vol = await Volunteer.findOne({ email: emailArg });
      if (!vol) {
        console.log('❌ Volunteer NOT found in database');
      } else {
        console.log(`✅ Volunteer found: ${vol.firstName} ${vol.lastName} (${vol.email})`);
        console.log(`   Application Status: ${vol.applicationStatus}`);
        console.log(`   Center ID: ${vol.centerId || 'none'}`);
        console.log(`   Password hash: ${vol.password?.substring(0, 20)}...`);
        console.log(`   Hash starts with $2: ${vol.password?.startsWith('$2')}`);
        
        if (!vol.password?.startsWith('$2')) {
          console.log('⚠️  PASSWORD IS NOT HASHED! This is the problem.');
        } else {
          const isMatch = await bcrypt.compare(passwordArg, vol.password);
          console.log(`   Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
          
          if (!isMatch) {
            console.log('\n   ⚠️  Password mismatch. The stored hash does not match this password.');
            console.log('   Run: node diagnose-login.js reset-volunteer ' + emailArg + ' <new-password>');

            if (vol.applicationStatus === 'Pending') {
              console.log('   ⚠️  Also: Application status is Pending — login would be blocked even with correct password.');
            }
          }

          if (vol.applicationStatus === 'Pending') {
            console.log('   ℹ️  Note: Application status is "Pending" — login is blocked until approved.');
          } else if (vol.applicationStatus === 'Rejected') {
            console.log('   ℹ️  Note: Application status is "Rejected" — login is blocked.');
          }
        }
      }

    } else if (command === 'reset') {
      if (!emailArg || !passwordArg) {
        console.log('Usage: node diagnose-login.js reset <email> <new-password>');
        process.exit(1);
      }
      console.log(`🔧 Resetting USER password for: ${emailArg}`);
      const user = await User.findOne({ email: emailArg });
      if (!user) {
        console.log('❌ User NOT found');
        process.exit(1);
      }
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(passwordArg, salt);
      
      // Use updateOne to avoid any pre-save hooks
      await User.updateOne({ email: emailArg }, { $set: { password: hashed } });
      console.log('✅ Password updated successfully');
      
      // Verify
      const updated = await User.findOne({ email: emailArg });
      const verify = await bcrypt.compare(passwordArg, updated.password);
      console.log(`   Verification: ${verify ? '✅ PASS' : '❌ FAIL'}`);

    } else if (command === 'reset-volunteer') {
      if (!emailArg || !passwordArg) {
        console.log('Usage: node diagnose-login.js reset-volunteer <email> <new-password>');
        process.exit(1);
      }
      console.log(`🔧 Resetting VOLUNTEER password for: ${emailArg}`);
      const vol = await Volunteer.findOne({ email: emailArg });
      if (!vol) {
        console.log('❌ Volunteer NOT found');
        process.exit(1);
      }
      const salt = await bcrypt.genSalt(12);
      const hashed = await bcrypt.hash(passwordArg, salt);

      // Use updateOne to avoid the pre-save hook (which would double-hash)
      await Volunteer.updateOne({ email: emailArg }, { $set: { password: hashed } });
      console.log('✅ Password updated successfully');
      
      // Verify
      const updated = await Volunteer.findOne({ email: emailArg });
      const verify = await bcrypt.compare(passwordArg, updated.password);
      console.log(`   Verification: ${verify ? '✅ PASS' : '❌ FAIL'}`);

    } else {
      console.log('Unknown command:', command);
      console.log('Valid commands: list, test, test-volunteer, reset, reset-volunteer');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

main();
