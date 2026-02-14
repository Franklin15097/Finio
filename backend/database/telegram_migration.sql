-- Add Telegram fields to users table
ALTER TABLE users 
  ADD COLUMN telegram_id BIGINT UNIQUE AFTER id,
  ADD COLUMN telegram_username VARCHAR(255) AFTER telegram_id,
  MODIFY COLUMN email VARCHAR(255) NULL,
  MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- Create index for faster Telegram lookups
CREATE INDEX idx_telegram_id ON users(telegram_id);
