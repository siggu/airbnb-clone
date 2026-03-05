from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
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
