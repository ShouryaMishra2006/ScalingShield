from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import queue
import time
from datetime import datetime, timezone
import hashlib
import json
import requests
from processor_features import extract_and_score

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=True,
    engineio_logger=True
)


EXTERNAL_API_URL = os.getenv["EXTERNAL_URL"]

def send_to_external_api(alert_data):
    """
    Send filtered alert data to external API
    Only sends: threat_level, risk_score, and reason
    """
    try:
        
        filtered_data = {
            "threat_level": alert_data.get("threat_level", "unknown"),
            "risk_score": alert_data.get("rule_score", 0),
            "reason": alert_data.get("reason", "No reason provided"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_id": alert_data.get("event_id", "unknown")
        }
        
    
        response = requests.post(
            EXTERNAL_API_URL,
            json=filtered_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"[EXTERNAL API] Successfully sent alert to {EXTERNAL_API_URL}")
        else:
            print(f"[EXTERNAL API] Failed to send alert. Status: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print(f"[EXTERNAL API] Request timeout to {EXTERNAL_API_URL}")
    except requests.exceptions.RequestException as e:
        print(f"[EXTERNAL API] Error sending to external API: {e}")
    except Exception as e:
        print(f"[EXTERNAL API] Unexpected error: {e}")


class Block:
    def __init__(self, index, data, previous_hash):
        self.index = index
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.compute_hash()

    def compute_hash(self):
        return hashlib.sha256(
            json.dumps({
                "index": self.index,
                "timestamp": self.timestamp,
                "data": self.data,
                "previous_hash": self.previous_hash
            }, sort_keys=True).encode()
        ).hexdigest()

class Blockchain:
    def __init__(self):
        self.chain = [Block(0, [], "0")]
        self.lock = threading.Lock()

    def add_block(self, data):
        with self.lock:
            prev_hash = self.chain[-1].hash
            block = Block(len(self.chain), data, prev_hash)
            self.chain.append(block)
            return block

    def verify_chain(self):
        with self.lock:
            for i in range(1, len(self.chain)):
                if self.chain[i].previous_hash != self.chain[i-1].hash:
                    return False
                if self.chain[i].hash != self.chain[i].compute_hash():
                    return False
            return True

    def get_chain(self):
        with self.lock:
            return [{
                "index": block.index,
                "timestamp": block.timestamp,
                "data": block.data,
                "hash": block.hash,
                "previous_hash": block.previous_hash
            } for block in self.chain]

log_queue = queue.Queue()
blockchain = Blockchain()


def blockchain_consumer(batch_size=5):
    print("[STARTUP] Blockchain consumer started")
    while True:
        batch = []
        try:
            
            for _ in range(batch_size):
                try:
                    result = log_queue.get(timeout=1.0)
                    if result.get("rule_score", 0) > 0:
                        batch.append(result)
                    log_queue.task_done()
                except queue.Empty:
                    break

            if batch:
                block = blockchain.add_block(batch)
                
                
                socketio.emit("blockchain_update", {
                    "block_index": block.index,
                    "chain_valid": blockchain.verify_chain(),
                    "logs": batch
                }, namespace='/')
                
               
                for alert in batch:
                    socketio.emit("new_alert", alert, namespace='/')
                    
                    # Send to external API in a separate thread to avoid blocking
                    threading.Thread(
                        target=send_to_external_api,
                        args=(alert,),
                        daemon=True
                    ).start()
                
                print(f"[BLOCKCHAIN] Mined block {block.index} with {len(batch)} alerts")

            time.sleep(0.1)
            
        except Exception as e:
            print(f"[ERROR] Blockchain consumer error: {e}")
            time.sleep(1)


consumer_thread = None

def start_background_tasks():
    global consumer_thread
    if consumer_thread is None or not consumer_thread.is_alive():
        consumer_thread = threading.Thread(
            target=blockchain_consumer,
            args=(5,),
            daemon=True
        )
        consumer_thread.start()
        print("[STARTUP] Background thread started")


@app.route('/logs', methods=['POST'])
def receive_logs():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400
        
        results = extract_and_score(data)
        log_queue.put(results)
        
        print(f"[RECEIVED] Event {data.get('event_id', 'unknown')} queued")
        return jsonify({"status": "queued"}), 200
    
    except Exception as e:
        print(f"[ERROR] Error processing log: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "blockchain_length": len(blockchain.chain),
        "chain_valid": blockchain.verify_chain(),
        "queue_size": log_queue.qsize()
    }), 200

@app.route('/blockchain', methods=['GET'])
def get_blockchain():
    return jsonify({
        "chain": blockchain.get_chain(),
        "length": len(blockchain.chain),
        "valid": blockchain.verify_chain()
    }), 200


@socketio.on('connect')
def handle_connect():
    print(f"[SOCKET] Client connected: {request.sid}")
    emit('connection_response', {
        'status': 'connected',
        'message': 'Successfully connected to server'
    })

@socketio.on('disconnect')
def handle_disconnect():
    print(f"[SOCKET] Client disconnected: {request.sid}")

@socketio.on('request_blockchain')
def handle_blockchain_request():
    print(f"[SOCKET] Blockchain requested by: {request.sid}")
    emit('blockchain_data', {
        "chain": blockchain.get_chain(),
        "length": len(blockchain.chain),
        "valid": blockchain.verify_chain()
    })


if __name__ == '__main__':

    start_background_tasks()

    socketio.run(
        app,
        host='0.0.0.0',
        port=8000,
        debug=True,
        use_reloader=False  
    )
