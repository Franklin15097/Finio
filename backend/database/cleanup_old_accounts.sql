-- Cleanup script: Remove old email/password accounts
-- Keep only Telegram-authenticated users

-- Show accounts that will be deleted
SELECT 
    id, 
    email, 
    name, 
    telegram_id,
    created_at
FROM users 
WHERE telegram_id IS NULL;

-- Uncomment the following lines to actually delete old accounts
-- WARNING: This will permanently delete all non-Telegram users and their data!

-- DELETE FROM users WHERE telegram_id IS NULL;

-- Verify remaining users
SELECT 
    COUNT(*) as total_users,
    COUNT(telegram_id) as telegram_users
FROM users;
