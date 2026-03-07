from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from .models import Booking
from .serializers import PublicBookingSerializer
from rooms.serializers import RoomListSerializer
from experiences.serializers import ExperienceListSerializer


class MyBookings(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        room_bookings = Booking.objects.filter(
            user=request.user,
            kind=Booking.BookingKindChoices.ROOM,
        ).select_related("room").order_by("-check_in")

        experience_bookings = Booking.objects.filter(
            user=request.user,
            kind=Booking.BookingKindChoices.EXPERIENCE,
        ).select_related("experience").order_by("-check_in")

        data = []

        room_serializer = PublicBookingSerializer(room_bookings, many=True)
        for booking, item in zip(room_bookings, room_serializer.data):
            entry = dict(item)
            entry["kind"] = "room"
            if booking.room:
                entry["room"] = RoomListSerializer(
                    booking.room, context={"request": request}
                ).data
            data.append(entry)

        exp_serializer = PublicBookingSerializer(experience_bookings, many=True)
        for booking, item in zip(experience_bookings, exp_serializer.data):
            entry = dict(item)
            entry["kind"] = "experience"
            if booking.experience:
                entry["experience"] = ExperienceListSerializer(
                    booking.experience, context={"request": request}
                ).data
            data.append(entry)

        data.sort(key=lambda x: x.get("check_in") or "", reverse=True)
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(data, request)
        return paginator.get_paginated_response(result_page)


class BookingDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Booking.objects.get(pk=pk, user=user)
        except Booking.DoesNotExist:
            raise NotFound

    def delete(self, request, pk):
        booking = self.get_object(pk, request.user)
        now = timezone.localtime(timezone.now()).date()
        if booking.check_in and booking.check_in <= now:
            return Response(
                {"detail": "이미 시작된 예약은 취소할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
