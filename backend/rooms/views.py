from django.conf import settings
from django.utils import timezone
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import (
    NotFound,
    ParseError,
    PermissionDenied,
)
from .models import Amenity, Room
from categories.models import Category
from . import serializers
from reviews.serializers import ReviewSerializer
from medias.serializers import PhotoSerializer
from bookings.models import Booking
from bookings.serializers import PublicBookingSerializer, CreateRoomBookingSerializer
from django.db.models import Avg, Value
from django.db.models.functions import Coalesce


class Amenities(APIView):
    def get(self, request):
        all_amenities = Amenity.objects.all()
        serializer = serializers.AmenitySerializer(all_amenities, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = serializers.AmenitySerializer(data=request.data)
        if serializer.is_valid():
            amenity = serializer.save()
            return Response(
                serializers.AmenitySerializer(amenity).data,
            )
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )


class AmenityDetail(APIView):
    def get_object(self, pk):
        try:
            return Amenity.objects.get(pk=pk)
        except Amenity.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        amenity = self.get_object(pk)
        serializer = serializers.AmenitySerializer(amenity)
        return Response(serializer.data)

    def put(self, request, pk):
        amenity = self.get_object(pk)
        serializer = serializers.AmenitySerializer(
            amenity,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            updated_amenity = serializer.save()
            return Response(
                serializers.AmenitySerializer(updated_amenity).data,
            )
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

    def delete(self, request, pk):
        amenity = self.get_object(pk)
        amenity.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class Rooms(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        qs = Room.objects.prefetch_related("photos", "reviews")

        # 검색 필터
        keyword = request.query_params.get("keyword")
        if keyword:
            from django.db.models import Q

            qs = qs.filter(
                Q(name__icontains=keyword)
                | Q(city__icontains=keyword)
                | Q(country__icontains=keyword)
            )

        countries = request.query_params.getlist("country")
        if countries:
            qs = qs.filter(country__in=countries)

        cities = request.query_params.getlist("city")
        if cities:
            qs = qs.filter(city__in=cities)

        kinds = request.query_params.getlist("kind")
        if kinds:
            qs = qs.filter(kind__in=kinds)

        pet_friendly = request.query_params.get("pet_friendly")
        if pet_friendly is not None:
            qs = qs.filter(pet_friendly=pet_friendly.lower() == "true")

        min_price = request.query_params.get("min_price")
        if min_price:
            qs = qs.filter(price__gte=int(min_price))

        max_price = request.query_params.get("max_price")
        if max_price:
            qs = qs.filter(price__lte=int(max_price))

        # 정렬
        ordering = request.query_params.get("ordering")
        if ordering == "price_asc":
            qs = qs.order_by("price")
        elif ordering == "price_desc":
            qs = qs.order_by("-price")
        elif ordering == "rating":
            qs = qs.annotate(
                avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
            ).order_by("-avg_rating")
        else:
            qs = qs.order_by("-created_at")

        serializer = serializers.RoomListSerializer(
            qs,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = serializers.RoomDetailSerializer(data=request.data)
        if serializer.is_valid():
            category_pk = request.data.get("category")
            if not category_pk:
                raise ParseError("카테고리를 선택해주세요.")
            try:
                category = Category.objects.get(pk=category_pk)
                if category.kind == Category.CategoryKindChoices.EXPERIENCES:
                    raise ParseError("숙소 카테고리만 선택할 수 있습니다.")
            except Category.DoesNotExist:
                raise ParseError("카테고리를 찾을 수 없습니다.")
            try:
                with transaction.atomic():
                    room = serializer.save(
                        owner=request.user,
                        category=category,
                    )
                    amenities = request.data.get("amenities")
                    for amenity_pk in amenities:
                        amenity = Amenity.objects.get(pk=amenity_pk)
                        room.amenities.add(amenity)
                    serializer = serializers.RoomDetailSerializer(
                        room,
                        context={"request": request},
                    )
                    return Response(serializer.data)
            except Exception:
                raise ParseError("편의시설을 찾을 수 없습니다.")
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )


class RoomDetail(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return (
                Room.objects.prefetch_related("photos", "amenities", "reviews")
                .select_related("owner", "category")
                .get(pk=pk)
            )
        except Room.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        room = self.get_object(pk)
        serializer = serializers.RoomDetailSerializer(
            room,
            context={"request": request},
        )
        return Response(serializer.data)

    def put(self, request, pk):
        room = self.get_object(pk)
        if room.owner != request.user:
            raise PermissionDenied
        serializer = serializers.RoomDetailSerializer(
            room,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            category_pk = request.data.get("category")
            if category_pk:
                try:
                    category = Category.objects.get(pk=category_pk)
                    if category.kind == Category.CategoryKindChoices.EXPERIENCES:
                        raise ParseError("숙소 카테고리만 선택할 수 있습니다.")
                except Category.DoesNotExist:
                    raise ParseError("카테고리를 찾을 수 없습니다.")
            try:
                with transaction.atomic():
                    if category_pk:
                        updated_room = serializer.save(
                            category=category,
                        )
                    else:
                        updated_room = serializer.save()
                    amenities = request.data.get("amenities")
                    if amenities:
                        room.amenities.clear()
                        for amenity_pk in amenities:
                            amenity = Amenity.objects.get(pk=amenity_pk)
                            room.amenities.add(amenity)
                    return Response(
                        serializers.RoomDetailSerializer(updated_room).data,
                    )
            except Exception:
                raise ParseError("편의시설을 찾을 수 없습니다.")
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

    def delete(self, request, pk):
        room = self.get_object(pk)
        if room.owner != request.user:
            raise PermissionDenied
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RoomReviews(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        try:
            page = request.query_params.get("page", 1)
            page = int(page)
        except ValueError:
            page = 1
        page_size = 3
        start = (page - 1) * page_size
        end = start + page_size
        room = self.get_object(pk)
        reviews = room.reviews.select_related("user")[start:end]
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        room = self.get_object(pk)
        has_booking = Booking.objects.filter(
            room=room,
            user=request.user,
            kind=Booking.BookingKindChoices.ROOM,
        ).exists()
        if not has_booking:
            raise ParseError("이 숙소를 예약한 사용자만 리뷰를 작성할 수 있습니다.")
        if room.reviews.filter(user=request.user).exists():
            raise ParseError("이미 이 숙소에 리뷰를 작성하셨습니다.")
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(
                user=request.user,
                room=room,
            )
            serializer = ReviewSerializer(review)
            return Response(serializer.data)


class RoomAmenities(APIView):
    def get_object(self, pk):
        try:
            return Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        try:
            page = request.query_params.get("page", 1)
            page = int(page)
        except ValueError:
            page = 1
        page_size = settings.PAGE_SIZE
        start = (page - 1) * page_size
        end = start + page_size
        room = self.get_object(pk)
        serializer = serializers.AmenitySerializer(
            room.amenities.all()[start:end],
            many=True,
        )
        return Response(serializer.data)


class RoomPhotos(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            raise NotFound

    def post(self, request, pk):
        room = self.get_object(pk)
        if request.user != room.owner:
            raise PermissionDenied
        serializer = PhotoSerializer(data=request.data)
        if serializer.is_valid():
            photo = serializer.save(
                room=room,
            )
            serializer = PhotoSerializer(photo, context={"request": request})
            return Response(serializer.data)
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )


class RoomBookings(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Room.objects.get(pk=pk)
        except:
            raise NotFound

    def get(self, request, pk):
        room = self.get_object(pk)
        now = timezone.localtime(timezone.now()).date()
        bookings = Booking.objects.filter(
            room=room,
            kind=Booking.BookingKindChoices.ROOM,
            check_out__gte=now,
        )
        serializer = PublicBookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        room = self.get_object(pk)
        serializer = CreateRoomBookingSerializer(
            data=request.data,
            context={"room": room},
        )
        if serializer.is_valid():
            booking = serializer.save(
                room=room,
                user=request.user,
                kind=Booking.BookingKindChoices.ROOM,
            )
            serializer = PublicBookingSerializer(booking)
            return Response(serializer.data)
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )


class RoomBookingCheck(APIView):
    def get_object(self, pk):
        try:
            return Room.objects.get(pk=pk)
        except:
            raise NotFound

    def get(self, request, pk):
        room = self.get_object(pk)
        check_out = request.query_params.get("check_out")
        check_in = request.query_params.get("check_in")
        exists = Booking.objects.filter(
            room=room,
            check_in__lte=check_out,
            check_out__gte=check_in,
        ).exists()
        if exists:
            return Response({"ok": False})
        return Response({"ok": True})


class RoomBookingCheckMine(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        if not request.user.is_authenticated:
            return Response({"has_booking": False})
        room = self.get_object(pk)
        has_booking = Booking.objects.filter(
            room=room,
            user=request.user,
            kind=Booking.BookingKindChoices.ROOM,
        ).exists()
        return Response({"has_booking": has_booking})
