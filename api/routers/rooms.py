# api/routers/rooms.py
from fastapi import APIRouter, Depends, HTTPException
from ..deps import get_db
from ..models import Room, Device
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/rooms", tags=["rooms"])

@router.post("/add")
def add_room(device_id: str, room_name: str, assigned_phone: str = None, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.device_id==device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    r = Room(device_id=device.id, room_name=room_name, assigned_phone=assigned_phone)
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"status":"success","room_id":r.id}
