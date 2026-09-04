"""
Application configuration.
Reads database credentials from environment variables (.env file).
"""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Run: pip install -r requirements.txt")


class Config:
    DB_TYPE     = os.getenv("DB_TYPE", "").lower()
    DB_USER     = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST     = os.getenv("DB_HOST", "localhost")
    DB_PORT     = int(os.getenv("DB_PORT", "3306"))
    DB_NAME     = os.getenv("DB_NAME", "movie_mate")

    db_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "movie_mate.db")
    sqlite_uri = f"sqlite:///{db_file_path}"

    explicit_uri = os.getenv("SQLALCHEMY_DATABASE_URI")
    if explicit_uri:
        SQLALCHEMY_DATABASE_URI = explicit_uri
    elif DB_TYPE == "sqlite":
        SQLALCHEMY_DATABASE_URI = sqlite_uri
    else:
        mysql_uri = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        mysql_working = False
        try:
            import pymysql
            conn = pymysql.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASSWORD,
                port=DB_PORT,
                database=DB_NAME,
                connect_timeout=2
            )
            conn.close()
            mysql_working = True
        except Exception as e:
            print(f"MySQL connection check failed ({e}). Using SQLite database.")
            mysql_working = False

        if mysql_working:
            SQLALCHEMY_DATABASE_URI = mysql_uri
        else:
            SQLALCHEMY_DATABASE_URI = sqlite_uri

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "movie-mate-super-secret-2026")

    # Flask session settings
    SESSION_COOKIE_HTTPONLY  = True
    SESSION_COOKIE_SAMESITE  = "None"
    SESSION_COOKIE_SECURE    = True
    PERMANENT_SESSION_LIFETIME = 86400  # 1 day in seconds

    JSON_SORT_KEYS = False



