from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

    EVENTS: list[dict[str, Any]] = [
        {
            "id": 1,
            "title": "Campus Tech Meetup",
            "location": "Student Center",
            "date": "2026-03-30",
            "category": "Tech",
        },
        {
            "id": 2,
            "title": "Community Food Festival",
            "location": "Downtown Park",
            "date": "2026-04-05",
            "category": "Food",
        },
        {
            "id": 3,
            "title": "Live Jazz Night",
            "location": "Riverwalk Stage",
            "date": "2026-04-12",
            "category": "Music",
        },
    ]

    MY_EVENTS: list[dict[str, Any]] = []

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "time": datetime.utcnow().isoformat()})

    @app.get("/api/events")
    def list_events():
        location = request.args.get("location")
        date = request.args.get("date")

        results = EVENTS
        if location:
            results = [e for e in results if e.get("location", "").lower() == location.lower()]
        if date:
            results = [e for e in results if e.get("date") == date]

        return jsonify({"events": results})

    @app.get("/api/my-events")
    def list_my_events():
        return jsonify({"events": MY_EVENTS})

    @app.post("/api/my-events")
    def save_my_event():
        payload = request.get_json(silent=True) or {}
        event_id = payload.get("eventId")
        if not isinstance(event_id, int):
            return jsonify({"error": "eventId must be an integer"}), 400

        event = next((e for e in EVENTS if e["id"] == event_id), None)
        if event is None:
            return jsonify({"error": "event not found"}), 404

        if any(e["id"] == event_id for e in MY_EVENTS):
            return jsonify({"saved": False, "reason": "already saved", "event": event}), 200

        MY_EVENTS.append(event)
        return jsonify({"saved": True, "event": event}), 201

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
