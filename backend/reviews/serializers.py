from rest_framework import serializers
from users.serializers import TinyUserSerializer
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user = TinyUserSerializer(read_only=True)
    room_pk = serializers.IntegerField(source="room_id", read_only=True)
    experience_pk = serializers.IntegerField(source="experience_id", read_only=True)
    room_name = serializers.SerializerMethodField()
    room_thumbnail_url = serializers.SerializerMethodField()
    experience_name = serializers.SerializerMethodField()
    experience_thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            "pk",
            "user",
            "payload",
            "rating",
            "room_pk",
            "experience_pk",
            "room_name",
            "room_thumbnail_url",
            "experience_name",
            "experience_thumbnail_url",
            "created_at",
        )

    def _photo_url(self, photos_qs):
        try:
            photo = photos_qs.filter(status="approved").first()
            if not photo or not photo.file:
                return None
            url = photo.file.url
            if url.startswith(("http://", "https://")):
                return url
            request = self.context.get("request")
            return request.build_absolute_uri(url) if request else None
        except Exception:
            return None

    def get_room_name(self, obj):
        return obj.room.name if obj.room_id else None

    def get_room_thumbnail_url(self, obj):
        if not obj.room_id:
            return None
        return self._photo_url(obj.room.photos)

    def get_experience_name(self, obj):
        return obj.experience.name if obj.experience_id else None

    def get_experience_thumbnail_url(self, obj):
        if not obj.experience_id:
            return None
        return self._photo_url(obj.experience.photos)
