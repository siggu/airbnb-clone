from django.utils import timezone
from rest_framework import serializers
from .models import Booking


class CreateRoomBookingSerializer(serializers.ModelSerializer):
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    check_in_time = serializers.TimeField(required=False, allow_null=True)
    check_out_time = serializers.TimeField(required=False, allow_null=True)

    class Meta:
        model = Booking
        fields = (
            "check_in",
            "check_out",
            "check_in_time",
            "check_out_time",
            "guests",
        )

    def validate_check_in(self, value):
        now = timezone.localtime(timezone.now()).date()
        if now > value:
            raise serializers.ValidationError("과거 날짜로는 예약할 수 없습니다.")
        return value

    def validate_check_out(self, value):
        now = timezone.localtime(timezone.now()).date()
        if now > value:
            raise serializers.ValidationError("과거 날짜로는 예약할 수 없습니다.")
        return value

    def validate(self, data):
        room = self.context.get("room")
        if data["check_out"] <= data["check_in"]:
            raise serializers.ValidationError(
                "체크아웃 날짜는 체크인 날짜보다 이후여야 합니다."
            )
        if Booking.objects.filter(
            room=room,
            check_in__lte=data["check_out"],
            check_out__gte=data["check_in"],
        ).exists():
            raise serializers.ValidationError(
                "해당 날짜는 이미 예약되어 있습니다."
            )
        return data


class CreateExperienceBookingSerializer(serializers.ModelSerializer):
    check_in = serializers.DateField()
    check_in_time = serializers.TimeField(required=False, allow_null=True)
    check_out_time = serializers.TimeField(required=False, allow_null=True)

    class Meta:
        model = Booking
        fields = (
            "check_in",
            "check_in_time",
            "check_out_time",
            "guests",
        )

    def validate_check_in(self, value):
        now = timezone.localtime(timezone.now()).date()
        if now > value:
            raise serializers.ValidationError("과거 날짜로는 예약할 수 없습니다.")
        return value

    def validate(self, data):
        experience = self.context.get("experience")
        if Booking.objects.filter(
            experience=experience,
            check_in=data["check_in"],
        ).exists():
            raise serializers.ValidationError(
                "해당 날짜는 이미 예약되어 있습니다."
            )
        return data


class PublicBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = (
            "pk",
            "check_in",
            "check_out",
            "check_in_time",
            "check_out_time",
            "experience_time",
            "guests",
        )
