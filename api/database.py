# api/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("MYSQL_USER","synetra")
DB_PASS = os.getenv("MYSQL_PASSWORD","root")
DB_HOST = os.getenv("MYSQL_HOST","mysql")
DB_PORT = os.getenv("MYSQL_PORT","3306")
DB_NAME = os.getenv("MYSQL_DB","synetra_home_automation")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
