from django.db import models
from common.models import CommonModel


class Photo(CommonModel):
    class StatusChoices(models.TextChoices):
        PENDING = "pending_scan", "검토 중"
        APPROVED = "approved", "승인됨"
        REJECTED = "rejected", "거부됨"

    file = models.ImageField(upload_to="photos/")
    description = models.CharField(
        max_length=140,
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
    )
    room = models.ForeignKey(
        "rooms.Room",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="photos",
    )
    experience = models.ForeignKey(
        "experiences.Experience",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="photos",
    )

    def __str__(self):
        if self.description:
            return self.description
        if self.room:
            return self.room.name
        return "Photo File"


class Video(CommonModel):
    file = models.URLField()
    experience = models.OneToOneField(
        "experiences.Experience",
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return "Video File"
