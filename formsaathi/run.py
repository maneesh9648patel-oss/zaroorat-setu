"""
FormSaathi Runner Script
Configured for http://formsaathi.in
"""

import sys
import os
import socket

# Add formsaathi directory to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from app import app
from models import init_db

def is_port_available(port):
    """Checks if a given port can be bound."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('0.0.0.0', port))
            return True
        except OSError:
            return False

def check_hosts_file():
    """Checks if formsaathi.in is mapped in Windows hosts file."""
    try:
        hosts_path = os.path.join(os.environ.get('WINDIR', r'C:\Windows'), r'System32\drivers\etc\hosts')
        if os.path.exists(hosts_path):
            with open(hosts_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                return 'formsaathi.in' in content.lower()
    except Exception:
        pass
    return False

if __name__ == '__main__':
    print("=" * 65)
    print(" FormSaathi — Smart Scholarship & Government Document Assistant")
    print(" Official Domain URL: http://formsaathi.in")
    print("=" * 65)
    print(" Initializing SQLite database...")
    init_db()

    has_domain = check_hosts_file()
    
    # Try port 80 first so user can access http://formsaathi.in directly without :5000
    if is_port_available(80):
        port = 80
        url = "http://formsaathi.in" if has_domain else "http://localhost"
    else:
        port = 5000
        url = "http://formsaathi.in:5000" if has_domain else "http://localhost:5000"

    print(f" Server running on: {url}")
    if not has_domain:
        print(" Note: To map http://formsaathi.in on your PC, run 'setup_domain.bat' as Administrator.")
        print(f" Alternatively, access via: http://localhost:{port}")
    print(" Press CTRL+C to stop the server.")
    print("=" * 65)

    app.run(host='0.0.0.0', port=port, debug=True)
