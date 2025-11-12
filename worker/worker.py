# worker/worker.py
import time
print("Worker started")
while True:
    # Here you can poll Redis or process long tasks
    time.sleep(5)
