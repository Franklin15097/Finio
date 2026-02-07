#!/usr/bin/env python3
"""
Скрипт для тестирования API Finio на продакшн сервере
"""
import requests
import json

def test_api():
    base_url = "https://studiofinance.ru"
    
    print("🧪 Тестирование Finio API на продакшн сервере...")
    
    # Тест 1: Проверка здоровья
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
    
    # Тест 2: Проверка статуса бота
    try:
        response = requests.get(f"{base_url}/bot-status", timeout=10)
        print(f"✅ Bot status: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Bot status failed: {e}")
    
    # Тест 3: Инициализация демо данных
    try:
        response = requests.post(f"{base_url}/api/init-demo-data", timeout=10)
        print(f"✅ Demo data init: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Demo data init failed: {e}")
    
    # Тест 4: Получение статистики
    try:
        response = requests.get(f"{base_url}/api/users/1/stats", timeout=10)
        print(f"✅ User stats: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ User stats failed: {e}")
    
    # Тест 5: Получение транзакций
    try:
        response = requests.get(f"{base_url}/api/users/1/transactions", timeout=10)
        print(f"✅ User transactions: {response.status_code} - {len(response.json())} transactions")
    except Exception as e:
        print(f"❌ User transactions failed: {e}")
    
    # Тест 6: Проверка Mini App
    try:
        response = requests.get(f"{base_url}/miniapp", timeout=10)
        print(f"✅ Mini App: {response.status_code} - HTML loaded")
    except Exception as e:
        print(f"❌ Mini App failed: {e}")

if __name__ == "__main__":
    test_api()