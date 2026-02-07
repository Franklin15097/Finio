"""
Скрипт миграции данных из старой MySQL базы в новую MySQL базу
"""
import asyncio
import aiomysql
import mysql.connector
from datetime import datetime
from decimal import Decimal
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# Настройки старой MySQL базы
OLD_MYSQL_CONFIG = {
    'host': 'localhost',
    'database': 'a1226566_Finio',  # Из старого конфига
    'user': 'a1226566_Finio',
    'password': 'Maks15097%'
}

# Настройки новой MySQL базы
NEW_MYSQL_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'db': os.getenv('DB_NAME', 'finio'),
    'user': os.getenv('DB_USER', 'finio_user'),
    'password': os.getenv('DB_PASSWORD', 'finio_password'),
    'charset': 'utf8mb4'
}


async def migrate_data():
    """Основная функция миграции"""
    print("Начинаем миграцию данных...")
    
    # Подключение к базам данных
    old_mysql_conn = mysql.connector.connect(**OLD_MYSQL_CONFIG)
    old_mysql_cursor = old_mysql_conn.cursor(dictionary=True)
    
    new_mysql_conn = await aiomysql.connect(**NEW_MYSQL_CONFIG)
    
    try:
        # Миграция пользователей
        await migrate_users(old_mysql_cursor, new_mysql_conn)
        
        # Миграция категорий
        await migrate_categories(old_mysql_cursor, new_mysql_conn)
        
        # Миграция транзакций
        await migrate_transactions(old_mysql_cursor, new_mysql_conn)
        
        # Миграция бюджетов (если есть)
        await migrate_budgets(old_mysql_cursor, new_mysql_conn)
        
        print("Миграция завершена успешно!")
        
    except Exception as e:
        print(f"Ошибка миграции: {e}")
        raise
    finally:
        old_mysql_conn.close()
        new_mysql_conn.close()


async def migrate_users(old_mysql_cursor, new_mysql_conn):
    """Миграция пользователей"""
    print("Миграция пользователей...")
    
    # Получаем пользователей из старой MySQL
    old_mysql_cursor.execute("SELECT * FROM users")
    old_users = old_mysql_cursor.fetchall()
    
    user_mapping = {}  # Маппинг старых ID на новые
    
    async with new_mysql_conn.cursor() as cursor:
        for user in old_users:
            # Вставляем пользователя в новую MySQL
            await cursor.execute("""
                INSERT INTO users (email, hashed_password, full_name, is_active, telegram_id, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user['email'],
                user.get('hashed_password', user.get('password_hash', '')),
                user.get('full_name'),
                user.get('is_active', True),
                user.get('telegram_id'),
                user.get('created_at', datetime.now())
            ))
            
            new_user_id = cursor.lastrowid
            user_mapping[user['id']] = new_user_id
            print(f"Пользователь {user['email']} мигрирован (ID: {user['id']} -> {new_user_id})")
        
        await new_mysql_conn.commit()
    
    return user_mapping


async def migrate_categories(old_mysql_cursor, new_mysql_conn):
    """Миграция категорий"""
    print("Миграция категорий...")
    
    # Получаем категории из старой MySQL
    old_mysql_cursor.execute("SELECT * FROM categories")
    old_categories = old_mysql_cursor.fetchall()
    
    category_mapping = {}  # Маппинг старых ID на новые
    
    async with new_mysql_conn.cursor() as cursor:
        for category in old_categories:
            # Вставляем категорию в новую MySQL
            await cursor.execute("""
                INSERT INTO categories (user_id, name, type, color, icon, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                category['user_id'],
                category['name'],
                category['type'],
                category.get('color', '#3B82F6'),
                category.get('icon'),
                category.get('created_at', datetime.now())
            ))
            
            new_category_id = cursor.lastrowid
            category_mapping[category['id']] = new_category_id
            print(f"Категория {category['name']} мигрирована (ID: {category['id']} -> {new_category_id})")
        
        await new_mysql_conn.commit()
    
    return category_mapping


async def migrate_transactions(old_mysql_cursor, new_mysql_conn):
    """Миграция транзакций"""
    print("Миграция транзакций...")
    
    # Получаем транзакции из старой MySQL
    old_mysql_cursor.execute("SELECT * FROM transactions ORDER BY created_at")
    old_transactions = old_mysql_cursor.fetchall()
    
    transaction_count = 0
    
    async with new_mysql_conn.cursor() as cursor:
        for transaction in old_transactions:
            # Вставляем транзакцию в новую MySQL
            await cursor.execute("""
                INSERT INTO transactions (user_id, type, amount, category_id, title, description, transaction_date, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                transaction['user_id'],
                transaction['type'],
                Decimal(str(transaction['amount'])),
                transaction.get('category_id'),
                transaction['title'],
                transaction.get('description'),
                transaction['transaction_date'],
                transaction.get('created_at', datetime.now())
            ))
            
            transaction_count += 1
            if transaction_count % 100 == 0:
                print(f"Мигрировано {transaction_count} транзакций...")
        
        await new_mysql_conn.commit()
    
    print(f"Всего мигрировано {transaction_count} транзакций")


async def migrate_budgets(old_mysql_cursor, new_mysql_conn):
    """Миграция бюджетов"""
    print("Миграция бюджетов...")
    
    try:
        # Проверяем, есть ли таблица budgets в старой MySQL
        old_mysql_cursor.execute("SHOW TABLES LIKE 'budgets'")
        if not old_mysql_cursor.fetchone():
            print("Таблица budgets не найдена в старой базе, пропускаем...")
            return
        
        # Получаем бюджеты из старой MySQL
        old_mysql_cursor.execute("SELECT * FROM budgets")
        old_budgets = old_mysql_cursor.fetchall()
        
        budget_count = 0
        
        async with new_mysql_conn.cursor() as cursor:
            for budget in old_budgets:
                # Вставляем бюджет в новую MySQL
                await cursor.execute("""
                    INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    budget['user_id'],
                    budget.get('category_id'),
                    Decimal(str(budget['amount'])),
                    budget.get('period', 'MONTHLY'),
                    budget.get('start_date'),
                    budget.get('end_date'),
                    budget.get('created_at', datetime.now())
                ))
                
                budget_count += 1
            
            await new_mysql_conn.commit()
        
        print(f"Мигрировано {budget_count} бюджетов")
        
    except Exception as e:
        print(f"Ошибка при миграции бюджетов: {e}")


def create_backup():
    """Создание бэкапа старой базы данных"""
    print("Создание бэкапа старой базы данных...")
    
    backup_filename = f"mysql_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
    
    import subprocess
    
    try:
        subprocess.run([
            'mysqldump',
            f"--host={OLD_MYSQL_CONFIG['host']}",
            f"--user={OLD_MYSQL_CONFIG['user']}",
            f"--password={OLD_MYSQL_CONFIG['password']}",
            OLD_MYSQL_CONFIG['database']
        ], stdout=open(backup_filename, 'w'), check=True)
        
        print(f"Бэкап создан: {backup_filename}")
        
    except subprocess.CalledProcessError as e:
        print(f"Ошибка создания бэкапа: {e}")
        raise


if __name__ == "__main__":
    print("=== Миграция данных Finio ===")
    print("Этот скрипт перенесет данные из старой MySQL базы в новую MySQL базу")
    
    response = input("Продолжить? (y/N): ")
    if response.lower() != 'y':
        print("Миграция отменена")
        exit()
    
    # Создаем бэкап перед миграцией
    try:
        create_backup()
    except Exception as e:
        print(f"Не удалось создать бэкап: {e}")
        response = input("Продолжить без бэкапа? (y/N): ")
        if response.lower() != 'y':
            print("Миграция отменена")
            exit()
    
    # Запускаем миграцию
    asyncio.run(migrate_data())