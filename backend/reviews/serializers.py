from rest_framework import serializers
from users.serializers import TinyUserSerializer
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user = TinyUserSerializer(read_only=True)
    room_pk = serializers.SerializerMethodField()
    experience_pk = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            "pk",
            "user",
            "payload",
            "rating",
            "room_pk",
            "experience_pk",
            "created_at",
        )

    def get_room_pk(self, obj):
        return obj.room.pk if obj.room else None

    def get_experience_pk(self, obj):
        return obj.experience.pk if obj.experience else None
