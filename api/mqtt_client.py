# api/mqtt_client.py
import os
import json
import threading
import time
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
from .database import SessionLocal
from .models import ESP32Node, RelayState
load_dotenv()

MQTT_HOST = os.getenv("MQTT_BROKER_HOST","mosquitto")
MQTT_PORT = int(os.getenv("MQTT_BROKER_PORT",1883))

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print("MQTT Connected", rc)
    # Subscribe to global status topic
    client.subscribe("synetra/status/#")

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = msg.payload.decode()
        print("MQTT MSG", topic, payload)
        # Example topic: synetra/status/<device_id>/<node_code>
        parts = topic.split('/')
        if len(parts) >= 4 and parts[1] == 'status':
            device_id = parts[2]
            node_code = parts[3]
            # payload JSON with relay states
            data = json.loads(payload)
            # Save states to DB
            db = SessionLocal()
            node = db.query(ESP32Node).filter(ESP32Node.node_code==node_code).first()
            if node:
                for key,v in data.items():
                    # key e.g. relay_1
                    if key.startswith("relay_"):
                        num = int(key.split("_")[1])
                        state = v
                        rs = RelayState(esp_node_id=node.id, relay_number=num, state=state)
                        db.add(rs)
                db.commit()
            db.close()
    except Exception as e:
        print("mqtt on_message error", e)

def start_mqtt():
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_HOST, MQTT_PORT, 60)
    thread = threading.Thread(target=client.loop_forever, daemon=True)
    thread.start()
