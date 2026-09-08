import random
from datetime import datetime, timedelta
from extensions import db, bcrypt


class User(db.Model):
    __tablename__ = "users"

    id         = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(50), nullable=False, unique=True)
    email      = db.Column(db.String(120), nullable=False, unique=True)
    password   = db.Column(db.String(255), nullable=False)
    role       = db.Column(db.Enum("user", "admin"), nullable=False, default="user")
    otp_code   = db.Column(db.String(10), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    ratings = db.relationship("Rating", backref="user", cascade="all, delete-orphan")
    reviews = db.relationship("Review", backref="user", cascade="all, delete-orphan")

    def set_password(self, plain_text):
        self.password = bcrypt.generate_password_hash(plain_text).decode("utf-8")

    def check_password(self, plain_text):
        return bcrypt.check_password_hash(self.password, plain_text)

    def is_admin(self):
        return self.role == "admin"

    def generate_otp(self):
        otp = f"{random.randint(100000, 999999)}"
        self.otp_code = otp
        self.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        return otp

    def verify_otp(self, code):
        if not self.otp_code or not self.otp_expiry:
            return False
        if datetime.utcnow() > self.otp_expiry:
            return False
        return self.otp_code.strip() == str(code).strip()

    def clear_otp(self):
        self.otp_code = None
        self.otp_expiry = None

    def to_dict(self):
        return {
            "id":         self.id,
            "username":   self.username,
            "email":      self.email,
            "role":       self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
