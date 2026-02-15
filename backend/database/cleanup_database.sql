-- Cleanup script to remove all test data
-- This will delete all users, transactions, categories, and accounts

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all transactions
DELETE FROM transactions;

-- Delete all accounts
DELETE FROM accounts;

-- Delete all categories
DELETE FROM categories;

-- Delete all users
DELETE FROM users;

-- Reset auto-increment counters
ALTER TABLE transactions AUTO_INCREMENT = 1;
ALTER TABLE accounts AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Show results
SELECT 'Database cleaned successfully!' as status;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as accounts_count FROM accounts;
SELECT COUNT(*) as transactions_count FROM transactions;
