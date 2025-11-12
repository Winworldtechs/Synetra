# api/routers/relays.py
from fastapi import APIRouter, Depends, HTTPException
from ..deps import get_db
from ..models import ESP32Node, RelayState
from sqlalchemy.orm import Session
from paho.mqtt.publish import single
import os
import json

router = APIRouter(prefix="/api/relays", tags=["relays"])
MQTT_HOST = os.getenv("MQTT_BROKER_HOST","mosquitto")

@router.post("/toggle")
def toggle(device_id: str, node_code: str, relay_number: int, state: str, db: Session = Depends(get_db)):
    # state = "ON" or "OFF"
    node = db.query(ESP32Node).filter(ESP32Node.node_code==node_code).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    # publish to MQTT topic for that node:
    topic = f"synetra/device/{device_id}/relay/{node_code}/{relay_number}"
    payload = json.dumps({"state": state})
    try:
        single(topic, payload, hostname=MQTT_HOST, port=int(os.getenv("MQTT_BROKER_PORT",1883)))
    except Exception as e:
        print("MQTT publish error", e)
    # Save state in DB
    rs = RelayState(esp_node_id=node.id, relay_number=relay_number, state=state)
    db.add(rs); db.commit()
    return {"status":"ok","topic":topic,"payload":payload}
