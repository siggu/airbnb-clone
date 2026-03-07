from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import Perk, Experience
from categories.serializers import CategorySerializer
from users.serializers import TinyUserSerializer
from medias.serializers import PhotoSerializer


class PerkSerializer(ModelSerializer):
    class Meta:
        model = Perk
        fields = "__all__"


class ExperienceListSerializer(ModelSerializer):
    photos = PhotoSerializer(read_only=True, many=True)
    is_owner = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = (
            "pk",
            "name",
            "country",
            "city",
            "price",
            "start",
            "end",
            "description",
            "photos",
            "is_owner",
            "rating",
        )

    def get_is_owner(self, experience):
        request = self.context.get("request")
        if request:
            return experience.host == request.user
        return False

    def get_rating(self, experience):
        reviews = experience.reviews.all()
        if not reviews:
            return None
        ratings = [r.rating for r in reviews]
        return round(sum(ratings) / len(ratings), 2)


class ExperienceSerializer(ModelSerializer):
    category = CategorySerializer(read_only=True)
    perks = PerkSerializer(read_only=True, many=True)
    host = TinyUserSerializer(read_only=True)
    photos = PhotoSerializer(read_only=True, many=True)
    is_owner = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = (
            "pk",
            "created_at",
            "updated_at",
            "country",
            "city",
            "name",
            "host",
            "price",
            "address",
            "start",
            "end",
            "description",
            "max_participants",
            "perks",
            "category",
            "photos",
            "is_owner",
            "rating",
        )

    def get_is_owner(self, experience):
        request = self.context.get("request")
        if request:
            return experience.host == request.user
        return False

    def get_rating(self, experience):
        reviews = experience.reviews.all()
        if not reviews:
            return None
        ratings = [r.rating for r in reviews]
        return round(sum(ratings) / len(ratings), 2)
