import firebase_admin
from firebase_admin import credentials, messaging
from app.config import get_settings

settings = get_settings()

_firebase_app: firebase_admin.App | None = None


def init_firebase():
    global _firebase_app
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            _firebase_app = firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"[WARNING] Firebase init skipped: {e}. Push notifications will be disabled.")


async def send_push_notification(
    fcm_token: str,
    title: str,
    body: str,
    data: dict[str, str] | None = None,
) -> bool:
    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            token=fcm_token,
        )
        messaging.send(message)
        return True
    except Exception:
        return False


async def send_application_status_notification(
    fcm_token: str,
    task_title: str,
    status: str,
    task_id: str,
) -> bool:
    status_messages = {
        "approved": ("Application Approved!", f"You've been approved for: {task_title}"),
        "rejected": ("Application Update", f"Your application for '{task_title}' was not selected."),
    }
    title, body = status_messages.get(status, ("Application Update", f"Status update for {task_title}"))
    return await send_push_notification(
        fcm_token,
        title=title,
        body=body,
        data={"task_id": task_id, "status": status, "type": "application_status"},
    )
