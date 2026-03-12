import threading
from django.db.models.signals import post_save
from django.dispatch import receiver


def _update_embedding(exp_pk: int):
    """백그라운드 스레드에서 임베딩을 업데이트합니다."""
    try:
        from experiences.models import Experience
        from chatbot.agents.embeddings import get_embedding, build_experience_text

        exp = Experience.objects.prefetch_related("perks").get(pk=exp_pk)
        exp.embedding = get_embedding(build_experience_text(exp))
        exp.save(update_fields=["embedding"])
    except Exception:
        pass


@receiver(post_save, sender="experiences.Experience")
def on_experience_saved(sender, instance, **kwargs):
    if "embedding" in (kwargs.get("update_fields") or []):
        return
    thread = threading.Thread(target=_update_embedding, args=(instance.pk,), daemon=True)
    thread.start()
