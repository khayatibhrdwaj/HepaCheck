from app.models.notification import Notification


def create_notification(db, user_id, message):
    notif = Notification(user_id=user_id, message=message)
    db.add(notif)
    db.commit()