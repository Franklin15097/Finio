-- Cleanup all user data from database
-- This will remove ALL users, accounts, categories, and transactions

SET FOREIGN_KEY_CHECKS = 0;

-- Delete all transactions
DELETE FROM transactions;

-- Delete all categories
DELETE FROM categories;

-- Delete all accounts
DELETE FROM accounts;

-- Delete all users
DELETE FROM users;

-- Reset auto-increment counters
ALTER TABLE transactions AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE accounts AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify cleanup
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Categories:', COUNT(*) FROM categories
UNION ALL
SELECT 'Accounts:', COUNT(*) FROM accounts
UNION ALL
SELECT 'Transactions:', COUNT(*) FROM transactions;
