"""
Скрипт миграции данных из старой MySQL базы в новую PostgreSQL
"""
import asyncio
import asyncpg
import mysql.connector
from datetime import datetime
from decimal import Decimal
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# Настройки старой MySQL базы
MYSQL_CONFIG = {
    'host': 'localhost',
    'database': 'a1226566_Finio',  # Из старого конфига
    'user': 'a1226566_Finio',
    'password': 'Maks15097%'
}

# Настройки новой PostgreSQL базы
POSTGRES_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'finio'),
    'user': os.getenv('DB_USER', 'finio_user'),
    'password': os.getenv('DB_PASSWORD', 'finio_password')
}


async def migrate_data():
    """Основная функция миграции"""
    print("Начинаем миграцию данных...")
    
    # Подключение к базам данных
    mysql_conn = mysql.connector.connect(**MYSQL_CONFIG)
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    
    postgres_conn = await asyncpg.connect(
        host=POSTGRES_CONFIG['host'],
        port=POSTGRES_CONFIG['port'],
        database=POSTGRES_CONFIG['database'],
        user=POSTGRES_CONFIG['user'],
        password=POSTGRES_CONFIG['password']
    )
    
    try:
        # Миграция пользователей
        await migrate_users(mysql_cursor, postgres_conn)
        
        # Миграция категорий
        await migrate_categories(mysql_cursor, postgres_conn)
        
        # Миграция транзакций
        await migrate_transactions(mysql_cursor, postgres_conn)
        
        # Миграция бюджетов (если есть)
        await migrate_budgets(mysql_cursor, postgres_conn)
        
        print("Миграция завершена успешно!")
        
    except Exception as e:
        print(f"Ошибка миграции: {e}")
        raise
    finally:
        mysql_conn.close()
        await postgres_conn.close()


async def migrate_users(mysql_cursor, postgres_conn):
    """Миграция пользователей"""
    print("Миграция пользователей...")
    
    # Получаем пользователей из MySQL
    mysql_cursor.execute("SELECT * FROM users")
    mysql_users = mysql_cursor.fetchall()
    
    user_mapping = {}  # Маппинг старых ID на новые
    
    for user in mysql_users:
        # Вставляем пользователя в PostgreSQL
        new_user_id = await postgres_conn.fetchval("""
            INSERT INTO users (email, password_hash, full_name, created_at, settings)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        """, 
            user['email'],
            user['password_hash'],
            user['full_name'],
            user['created_at'],
            user.get('settings', {})
        )
        
        user_mapping[user['id']] = new_user_id
        print(f"Пользователь {user['email']} мигрирован (ID: {user['id']} -> {new_user_id})")
    
    return user_mapping


async def migrate_categories(mysql_cursor, postgres_conn):
    """Миграция категорий"""
    print("Миграция категорий...")
    
    # Получаем категории из MySQL
    mysql_cursor.execute("SELECT * FROM categories")
    mysql_categories = mysql_cursor.fetchall()
    
    category_mapping = {}  # Маппинг старых ID на новые
    
    for category in mysql_categories:
        # Вставляем категорию в PostgreSQL
        new_category_id = await postgres_conn.fetchval("""
            INSERT INTO categories (user_id, name, type, color, icon, is_default)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        """,
            category['user_id'],
            category['name'],
            category['type'],
            category.get('color', '#3B82F6'),
            category.get('icon'),
            category.get('is_default', False)
        )
        
        category_mapping[category['id']] = new_category_id
        print(f"Категория {category['name']} мигрирована (ID: {category['id']} -> {new_category_id})")
    
    return category_mapping


async def migrate_transactions(mysql_cursor, postgres_conn):
    """Миграция транзакций"""
    print("Миграция транзакций...")
    
    # Получаем транзакции из MySQL
    mysql_cursor.execute("SELECT * FROM transactions ORDER BY created_at")
    mysql_transactions = mysql_cursor.fetchall()
    
    transaction_count = 0
    
    for transaction in mysql_transactions:
        # Вставляем транзакцию в PostgreSQL
        await postgres_conn.execute("""
            INSERT INTO transactions (user_id, type, amount, category_id, title, description, transaction_date, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
            transaction['user_id'],
            transaction['type'],
            Decimal(str(transaction['amount'])),
            transaction.get('category_id'),
            transaction['title'],
            transaction.get('description'),
            transaction['transaction_date'],
            transaction['created_at']
        )
        
        transaction_count += 1
        if transaction_count % 100 == 0:
            print(f"Мигрировано {transaction_count} транзакций...")
    
    print(f"Всего мигрировано {transaction_count} транзакций")


async def migrate_budgets(mysql_cursor, postgres_conn):
    """Миграция бюджетов"""
    print("Миграция бюджетов...")
    
    try:
        # Проверяем, есть ли таблица budgets в MySQL
        mysql_cursor.execute("SHOW TABLES LIKE 'budgets'")
        if not mysql_cursor.fetchone():
            print("Таблица budgets не найдена в старой базе, пропускаем...")
            return
        
        # Получаем бюджеты из MySQL
        mysql_cursor.execute("SELECT * FROM budgets")
        mysql_budgets = mysql_cursor.fetchall()
        
        budget_count = 0
        
        for budget in mysql_budgets:
            # Вставляем бюджет в PostgreSQL
            await postgres_conn.execute("""
                INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date)
                VALUES ($1, $2, $3, $4, $5, $6)
            """,
                budget['user_id'],
                budget.get('category_id'),
                Decimal(str(budget['amount'])),
                budget.get('period', 'monthly'),
                budget.get('start_date'),
                budget.get('end_date')
            )
            
            budget_count += 1
        
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
            f"--host={MYSQL_CONFIG['host']}",
            f"--user={MYSQL_CONFIG['user']}",
            f"--password={MYSQL_CONFIG['password']}",
            MYSQL_CONFIG['database']
        ], stdout=open(backup_filename, 'w'), check=True)
        
        print(f"Бэкап создан: {backup_filename}")
        
    except subprocess.CalledProcessError as e:
        print(f"Ошибка создания бэкапа: {e}")
        raise


if __name__ == "__main__":
    print("=== Миграция данных Finio ===")
    print("Этот скрипт перенесет данные из старой MySQL базы в новую PostgreSQL")
    
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