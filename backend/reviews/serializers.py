from rest_framework import serializers
from users.serializers import TinyUserSerializer
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user = TinyUserSerializer(read_only=True)
    room_pk = serializers.IntegerField(source="room_id", read_only=True)
    experience_pk = serializers.IntegerField(source="experience_id", read_only=True)

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
