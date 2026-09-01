"""
Run this ONCE after importing database.sql to create demo users.

Usage:
    cd backend
    python seed_users.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models.user import User

app = create_app()

USERS = [
    {"username": "admin",    "email": "admin@moviemate.com",    "password": "admin123",  "role": "admin"},
    {"username": "santhosh", "email": "santhosh@moviemate.com", "password": "user123",   "role": "user"},
    {"username": "ananya",   "email": "ananya@moviemate.com",   "password": "user123",   "role": "user"},
    {"username": "rahul",    "email": "rahul@moviemate.com",    "password": "user123",   "role": "user"},
]

with app.app_context():
    for data in USERS:
        if User.query.filter_by(username=data["username"]).first():
            print(f"  Skipped (already exists): {data['username']}")
            continue
        u = User(username=data["username"], email=data["email"], role=data["role"])
        u.set_password(data["password"])
        db.session.add(u)
        print(f"  Created: {data['username']} ({data['role']})")
    db.session.commit()
    print("\nDone! You can log in with:")
    print("  admin    / admin123  (admin)")
    print("  santhosh / user123   (user)")
