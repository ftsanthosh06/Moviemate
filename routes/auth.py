"""Auth blueprint — register, login, logout, current user."""
from flask import Blueprint, request, jsonify, session, current_app
from itsdangerous import URLSafeTimedSerializer
from extensions import db
from models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

TOKEN_SALT = "movie-mate-auth-salt"


def generate_token(user_id):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps({"user_id": user_id}, salt=TOKEN_SALT)


def verify_token(token):
    if not token:
        return None
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        data = serializer.loads(token, salt=TOKEN_SALT, max_age=30 * 86400)
        return data.get("user_id")
    except Exception:
        return None


def get_current_user_id():
    # 1. Check session cookie
    if "user_id" in session:
        return session["user_id"]

    # 2. Check Authorization Bearer header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        user_id = verify_token(token)
        if user_id:
            return user_id

    # 3. Check X-Auth-Token header
    token_header = request.headers.get("X-Auth-Token")
    if token_header:
        user_id = verify_token(token_header.strip())
        if user_id:
            return user_id

    return None


def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"error": "Login required"}), 401
        session["user_id"] = user_id
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"error": "Login required"}), 401
        user = User.query.get(user_id)
        if not user or not user.is_admin():
            return jsonify({"error": "Admin access required"}), 403
        session["user_id"] = user_id
        return f(*args, **kwargs)
    return decorated


@auth_bp.post("/register")
def register():
    data     = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email    = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if not email:
        email = f"{username}@moviemate.local"

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(username=username, email=email, role="user")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    session.permanent = True
    session["user_id"] = user.id
    session["role"]    = user.role
    token = generate_token(user.id)

    return jsonify({"message": "Registered successfully", "user": user.to_dict(), "token": token}), 201


@auth_bp.post("/login")
def login():
    data     = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Invalid Username! Please ensure you are registered."}), 401
    if not user.check_password(password):
        return jsonify({"error": "Invalid password. Please try again."}), 401

    session.permanent = True
    session["user_id"] = user.id
    session["role"]    = user.role
    token = generate_token(user.id)

    return jsonify({"message": "Logged in", "user": user.to_dict(), "token": token}), 200


@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


@auth_bp.after_request
def disable_caching(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0, private"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@auth_bp.get("/me")
def me():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "User not found"}), 401
    token = generate_token(user.id)
    return jsonify({"user": user.to_dict(), "token": token}), 200


def mask_email(email):
    if not email or "@" not in email:
        return email
    parts = email.split("@")
    name, domain = parts[0], parts[1]
    if len(name) <= 2:
        masked_name = name[0] + "*"
    else:
        masked_name = name[0] + "*" * (len(name) - 2) + name[-1]
    return f"{masked_name}@{domain}"


@auth_bp.post("/forgot-password/request-otp")
def request_otp():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("identifier") or "").strip()

    if not identifier:
        return jsonify({"error": "Please enter your username or email address"}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user:
        return jsonify({"error": "No account found with this username or email address. Please ensure you are registered."}), 404

    otp = user.generate_otp()
    db.session.commit()

    masked = mask_email(user.email)
    print(f"[OTP Email Verification] Sent OTP {otp} to {user.email} (Username: {user.username})")

    return jsonify({
        "message": f"OTP verification code sent to {masked}!",
        "email_masked": masked,
        "username": user.username,
        "demo_otp": otp
    }), 200


@auth_bp.post("/forgot-password/reset")
def reset_password_with_otp():
    data = request.get_json(silent=True) or {}
    identifier   = (data.get("identifier") or "").strip()
    otp          = (data.get("otp") or "").strip()
    new_password = (data.get("new_password") or "").strip()

    if not identifier or not otp or not new_password:
        return jsonify({"error": "All fields are required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user:
        return jsonify({"error": "User account not found"}), 404

    if not user.verify_otp(otp):
        return jsonify({"error": "Invalid or expired OTP verification code. Please request a new OTP."}), 400

    user.set_password(new_password)
    user.clear_otp()
    db.session.commit()

    return jsonify({"message": "Password reset successfully! You can now sign in with your new password."}), 200


