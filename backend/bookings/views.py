from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from .models import Booking
from .serializers import PublicBookingSerializer
from rooms.serializers import RoomListSerializer


class MyBookings(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(
            user=request.user,
            kind=Booking.BookingKindChoices.ROOM,
        ).select_related("room").order_by("-check_in")
        serializer = PublicBookingSerializer(bookings, many=True)
        data = []
        for booking, item in zip(bookings, serializer.data):
            entry = dict(item)
            if booking.room:
                room_serializer = RoomListSerializer(
                    booking.room, context={"request": request}
                )
                entry["room"] = room_serializer.data
            data.append(entry)
        return Response(data)


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
        if booking.check_in <= now:
            return Response(
                {"detail": "이미 시작된 예약은 취소할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
