"""
Session management – in-memory store keyed by UUID session_id.
Each session holds: raw_df, cleaned_df, analysis_results, model objects.
"""
import uuid
from typing import Any, Dict, Optional

_store: Dict[str, Dict[str, Any]] = {}


def create_session() -> str:
    sid = str(uuid.uuid4())
    _store[sid] = {}
    return sid


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    return _store.get(session_id)


def set_session(session_id: str, key: str, value: Any):
    if session_id not in _store:
        _store[session_id] = {}
    _store[session_id][key] = value


def clear_session(session_id: str):
    _store.pop(session_id, None)


def list_sessions():
    return list(_store.keys())
