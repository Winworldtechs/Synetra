# api/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    email2 = Column(String(150), nullable=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    opt_phone1 = Column(String(20), nullable=True)
    opt_phone2 = Column(String(20), nullable=True)
    opt_phone3 = Column(String(20), nullable=True)
    place_name = Column(String(150), nullable=True)
    address = Column(String(255), nullable=True)
    pin_code = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    devices = relationship("Device", back_populates="user")

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    device_id = Column(String(100), unique=True, index=True)  # e.g SYN12345
    wifi_ssid = Column(String(150), nullable=True)
    wifi_password = Column(String(150), nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User", back_populates="devices")
    nodes = relationship("ESP32Node", back_populates="device")
    rooms = relationship("Room", back_populates="device")

class ESP32Node(Base):
    __tablename__ = "esp32_nodes"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    node_code = Column(String(100), unique=True, index=True)  # NODE01
    relay_count = Column(Integer, default=16)
    connection_status = Column(Boolean, default=False)
    last_online = Column(DateTime, nullable=True)
    metadata = Column(JSON, nullable=True)
    device = relationship("Device", back_populates="nodes")
    appliances = relationship("Appliance", back_populates="esp32_node")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    room_name = Column(String(150))
    assigned_phone = Column(String(20), nullable=True)  # who can control
    device = relationship("Device", back_populates="rooms")
    appliances = relationship("Appliance", back_populates="room")

class Appliance(Base):
    __tablename__ = "appliances"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    esp_node_id = Column(Integer, ForeignKey("esp32_nodes.id"))
    name = Column(String(150))
    relay_number = Column(Integer)  # 1..16 or 1..32
    room = relationship("Room", back_populates="appliances")
    esp32_node = relationship("ESP32Node", back_populates="appliances")

class RelayState(Base):
    __tablename__ = "relay_states"
    id = Column(Integer, primary_key=True, index=True)
    esp_node_id = Column(Integer, ForeignKey("esp32_nodes.id"))
    relay_number = Column(Integer)
    state = Column(String(10))  # ON/OFF
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
