import threading
from django.db.models.signals import post_save
from django.dispatch import receiver


def _update_embedding(room_pk: int):
    """백그라운드 스레드에서 임베딩을 업데이트합니다."""
    try:
        import django
        from rooms.models import Room
        from chatbot.agents.embeddings import get_embedding, build_room_text

        room = Room.objects.prefetch_related("amenities").get(pk=room_pk)
        room.embedding = get_embedding(build_room_text(room))
        room.save(update_fields=["embedding"])
    except Exception:
        pass  # 임베딩 실패가 저장을 막으면 안 됨


@receiver(post_save, sender="rooms.Room")
def on_room_saved(sender, instance, **kwargs):
    if "embedding" in (kwargs.get("update_fields") or []):
        return  # 임베딩 저장 자체는 무시 (재귀 방지)
    thread = threading.Thread(target=_update_embedding, args=(instance.pk,), daemon=True)
    thread.start()
