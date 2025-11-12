# api/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from ..schemas import RegisterUser
from ..deps import get_db
from ..models import User
from ..utils import hash_password, verify_password
from sqlalchemy.orm import Session
from fastapi import status

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
def register(payload: RegisterUser, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    u = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        email2=payload.email2,
        opt_phone1=payload.opt_phone1,
        opt_phone2=payload.opt_phone2,
        opt_phone3=payload.opt_phone3,
        address=payload.address,
        pin_code=payload.pin_code,
        place_name=payload.place_name
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"status":"success", "user_id": u.id}
