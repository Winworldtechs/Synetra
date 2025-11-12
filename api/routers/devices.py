# api/routers/devices.py
from fastapi import APIRouter, Depends, HTTPException
from ..schemas import DeviceCreate
from ..deps import get_db
from ..models import Device, User, ESP32Node
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.post("/add")
def add_device(payload: DeviceCreate, user_id: int = None, db: Session = Depends(get_db)):
    # For simplicity user_id param; in real app use token
    if not user_id:
        raise HTTPException(status_code=401, detail="Provide user_id (dev only)")
    user = db.query(User).filter(User.id==user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    d = Device(user_id=user.id, device_id=payload.device_id, wifi_ssid=payload.wifi_ssid, wifi_password=payload.wifi_password)
    db.add(d)
    db.commit()
    db.refresh(d)
    return {"status":"success","device_id":d.device_id,"id":d.id}

@router.get("/{device_id}")
def get_device(device_id: str, db: Session = Depends(get_db)):
    d = db.query(Device).filter(Device.device_id==device_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Device not found")
    nodes = [{"node_code": n.node_code, "relay_count": n.relay_count, "status": n.connection_status} for n in d.nodes]
    return {"device_id": d.device_id, "nodes": nodes}
