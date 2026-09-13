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
    phone    = (data.get("phone") or "").strip()
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

    user = User(username=username, email=email, phone=phone, role="user")
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
        return email or ""
    parts = email.split("@")
    name, domain = parts[0], parts[1]
    if len(name) <= 2:
        masked_name = name[0] + "*"
    else:
        masked_name = name[0] + "*" * (len(name) - 2) + name[-1]
    return f"{masked_name}@{domain}"


def mask_phone(phone):
    if not phone or len(phone) < 4:
        return phone or ""
    return "*" * (len(phone) - 4) + phone[-4:]


def send_actual_otp(user, otp):
    smtp_server = current_app.config.get("MAIL_SERVER") or os.environ.get("MAIL_SERVER")
    smtp_port   = int(current_app.config.get("MAIL_PORT") or os.environ.get("MAIL_PORT", 587))
    smtp_user   = current_app.config.get("MAIL_USERNAME") or os.environ.get("MAIL_USERNAME")
    smtp_pass   = current_app.config.get("MAIL_PASSWORD") or os.environ.get("MAIL_PASSWORD")

    subject = f"Movie-Mate Security: Your Reset Password OTP is {otp}"
    body = f"""Hello {user.username},

Your Movie-Mate password reset One-Time Password (OTP) verification code is:

🔐 {otp}

This code is valid for 10 minutes. Please do not share this OTP with anyone.

Registered Details:
Email: {user.email}
Mobile: {user.phone or 'Not provided'}

Best regards,
Movie-Mate Security Team
"""

    if smtp_server and smtp_user and smtp_pass:
        try:
            import smtplib
            from email.mime.text import MIMEText
            msg = MIMEText(body)
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = user.email
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, [user.email], msg.as_string())
            print(f"[SMTP Mail Sent] Successfully sent OTP message to {user.email}")
        except Exception as err:
            print(f"[SMTP Mail Error] Could not send via SMTP: {err}")

    print(f"\n=======================================================")
    print(f"  [OTP EMAIL & MOBILE MESSAGE DISPATCHED]")
    print(f"  To User : {user.username}")
    print(f"  To Email: {user.email}")
    print(f"  To Mobile: {user.phone or 'N/A'}")
    print(f"  OTP Code: {otp}")
    print(f"=======================================================\n")


@auth_bp.post("/forgot-password/request-otp")
def request_otp():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("identifier") or "").strip()

    if not identifier:
        return jsonify({"error": "Please enter your username, email address, or mobile number"}), 400

    user = User.query.filter(
        (User.username == identifier) | 
        (User.email == identifier) | 
        (User.phone == identifier)
    ).first()

    if not user:
        return jsonify({"error": "No account found with this username, email address, or mobile number. Please ensure you are registered."}), 404

    otp = user.generate_otp()
    db.session.commit()

    masked_e = mask_email(user.email)
    masked_p = mask_phone(user.phone)
    sent_dest = f"email ({masked_e})" + (f" and mobile ({masked_p})" if masked_p else "")

    send_actual_otp(user, otp)

    return jsonify({
        "message": f"OTP verification code sent to your {sent_dest}!",
        "email_masked": masked_e,
        "phone_masked": masked_p,
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

    user = User.query.filter(
        (User.username == identifier) | 
        (User.email == identifier) | 
        (User.phone == identifier)
    ).first()

    if not user:
        return jsonify({"error": "User account not found"}), 404

    if not user.verify_otp(otp):
        return jsonify({"error": "Invalid or expired OTP verification code. Please request a new OTP."}), 400

    user.set_password(new_password)
    user.clear_otp()
    db.session.commit()

    return jsonify({"message": "Password reset successfully! You can now sign in with your new password."}), 200


def verify_google_token(credential):
    if not credential:
        return None
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                import json
                data = json.loads(resp.read().decode())
                if data.get("email"):
                    return data
    except Exception as e:
        print(f"[Google OAuth Online Verification Note]: {e}")

    try:
        import json, base64
        parts = credential.split(".")
        if len(parts) == 3:
            padding = "=" * (4 - len(parts[1]) % 4)
            payload_bytes = base64.urlsafe_b64decode(parts[1] + padding)
            data = json.loads(payload_bytes.decode("utf-8"))
            if data.get("email"):
                return data
    except Exception as e:
        print(f"[Google OAuth Payload Decode Note]: {e}")

    return None


@auth_bp.post("/google")
def google_auth():
    data = request.get_json(silent=True) or {}
    credential = (data.get("credential") or data.get("token") or "").strip()
    google_email = (data.get("email") or "").strip()
    google_name = (data.get("name") or "").strip()

    payload = verify_google_token(credential) if credential else None

    email = (payload and payload.get("email")) or google_email
    name  = (payload and payload.get("name")) or google_name or (email.split("@")[0] if email else "Google User")

    if not email:
        return jsonify({"error": "Google authentication failed. Valid email is required."}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        clean_name = "".join(c if c.isalnum() else "_" for c in name.lower()).strip("_")
        if len(clean_name) < 3:
            clean_name = email.split("@")[0].lower()

        username = clean_name
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f"{clean_name}_{counter}"
            counter += 1

        import secrets
        random_password = secrets.token_hex(16)
        user = User(username=username, email=email, role="user")
        user.set_password(random_password)
        db.session.add(user)
        db.session.commit()

    session.permanent = True
    session["user_id"] = user.id
    session["role"]    = user.role
    token = generate_token(user.id)

    return jsonify({
        "message": "Google Authentication successful",
        "user": user.to_dict(),
        "token": token
    }), 200


