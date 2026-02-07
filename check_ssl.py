#!/usr/bin/env python3
"""
Проверка SSL сертификата и HTTPS для домена studiofinance.ru
"""
import ssl
import socket
import requests
from datetime import datetime

def check_ssl_certificate(hostname, port=443):
    """Проверка SSL сертификата"""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                
                print(f"✅ SSL сертификат для {hostname}:")
                print(f"   Выдан: {cert.get('subject', 'N/A')}")
                print(f"   Выдавший орган: {cert.get('issuer', 'N/A')}")
                print(f"   Действителен до: {cert.get('notAfter', 'N/A')}")
                
                return True
    except Exception as e:
        print(f"❌ Ошибка SSL для {hostname}: {e}")
        return False

def check_https_redirect(url):
    """Проверка редиректа с HTTP на HTTPS"""
    try:
        response = requests.get(f"http://{url}", allow_redirects=False, timeout=10)
        if response.status_code in [301, 302, 307, 308]:
            location = response.headers.get('Location', '')
            if location.startswith('https://'):
                print(f"✅ HTTP -> HTTPS редирект работает: {location}")
                return True
            else:
                print(f"❌ Неправильный редирект: {location}")
                return False
        else:
            print(f"❌ Нет редиректа с HTTP на HTTPS (код: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Ошибка проверки редиректа: {e}")
        return False

def check_domain_accessibility():
    """Проверка доступности домена"""
    domain = "studiofinance.ru"
    
    print(f"🔍 Проверка домена {domain}...")
    
    # Проверка SSL
    ssl_ok = check_ssl_certificate(domain)
    
    # Проверка HTTPS редиректа
    redirect_ok = check_https_redirect(domain)
    
    # Проверка HTTPS доступности
    try:
        response = requests.get(f"https://{domain}", timeout=10)
        print(f"✅ HTTPS доступность: {response.status_code}")
        https_ok = True
    except Exception as e:
        print(f"❌ HTTPS недоступен: {e}")
        https_ok = False
    
    # Проверка API
    try:
        response = requests.get(f"https://{domain}/health", timeout=10)
        print(f"✅ API Health: {response.status_code} - {response.json()}")
        api_ok = True
    except Exception as e:
        print(f"❌ API недоступен: {e}")
        api_ok = False
    
    # Итоговый результат
    print(f"\n📊 Результат проверки {domain}:")
    print(f"   SSL сертификат: {'✅' if ssl_ok else '❌'}")
    print(f"   HTTP -> HTTPS: {'✅' if redirect_ok else '❌'}")
    print(f"   HTTPS доступность: {'✅' if https_ok else '❌'}")
    print(f"   API работает: {'✅' if api_ok else '❌'}")
    
    if all([ssl_ok, redirect_ok, https_ok, api_ok]):
        print(f"\n🎉 Домен {domain} полностью настроен!")
    else:
        print(f"\n⚠️ Домен {domain} требует настройки")

if __name__ == "__main__":
    check_domain_accessibility()