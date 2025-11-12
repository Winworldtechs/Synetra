# api/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterUser(BaseModel):
    email: EmailStr
    password: str
    phone: str
    email2: Optional[EmailStr] = None
    opt_phone1: Optional[str] = None
    opt_phone2: Optional[str] = None
    opt_phone3: Optional[str] = None
    place_name: Optional[str] = None
    address: Optional[str] = None
    pin_code: Optional[str] = None

class DeviceCreate(BaseModel):
    device_id: str
    wifi_ssid: Optional[str] = None
    wifi_password: Optional[str] = None
