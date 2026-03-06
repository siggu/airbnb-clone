from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Perk, Experience
from . import serializers
from medias.serializers import PhotoSerializer
from bookings.models import Booking
from bookings.serializers import PublicBookingSerializer, CreateExperienceBookingSerializer


class Perks(APIView):
    def get(self, request):
        all_perks = Perk.objects.all()
        serializer = serializers.PerkSerializer(all_perks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = serializers.PerkSerializer(data=request.data)
        if serializer.is_valid():
            perk = serializer.save()
            return Response(
                serializers.PerkSerializer(perk).data,
            )
        else:
            return Response(serializer.errors)


class PerkDetail(APIView):
    def get_object(self, pk):
        try:
            return Perk.objects.get(pk=pk)
        except Perk.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        perk = self.get_object(pk)
        serializer = serializers.PerkSerializer(perk)
        return Response(serializer.data)

    def put(self, request, pk):
        perk = self.get_object(pk)
        serializer = serializers.PerkSerializer(
            perk,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            updated_perk = serializer.save()
            return Response(
                serializers.PerkSerializer(updated_perk).data,
            )
        else:
            return Response(serializer.errors)

    def delete(self, request, pk):
        perk = self.get_object(pk)
        perk.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class Experiences(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        qs = Experience.objects.prefetch_related("photos")

        # 검색 필터
        keyword = request.query_params.get("keyword")
        if keyword:
            from django.db.models import Q
            qs = qs.filter(
                Q(name__icontains=keyword) |
                Q(city__icontains=keyword) |
                Q(country__icontains=keyword)
            )

        countries = request.query_params.getlist("country")
        if countries:
            qs = qs.filter(country__in=countries)

        cities = request.query_params.getlist("city")
        if cities:
            qs = qs.filter(city__in=cities)

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
        else:
            qs = qs.order_by("-created_at")

        serializer = serializers.ExperienceListSerializer(
            qs,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = serializers.ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            experience = serializer.save(
                host=request.user,
            )
            return Response(
                serializers.ExperienceSerializer(experience).data,
            )
        else:
            return Response(serializer.errors)


class ExperienceDetail(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Experience.objects.prefetch_related(
                "photos", "perks"
            ).select_related("host", "category").get(pk=pk)
        except Experience.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        experience = self.get_object(pk)
        serializer = serializers.ExperienceSerializer(experience, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk):
        experience = self.get_object(pk)
        if request.user != experience.host:
            raise PermissionDenied
        serializer = serializers.ExperienceSerializer(
            experience,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(serializers.ExperienceSerializer(updated, context={"request": request}).data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        experience = self.get_object(pk)
        if request.user != experience.host:
            raise PermissionDenied
        experience.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ExperiencePhotos(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
            raise NotFound

    def post(self, request, pk):
        experience = self.get_object(pk)
        if request.user != experience.host:
            raise PermissionDenied
        serializer = PhotoSerializer(data=request.data)
        if serializer.is_valid():
            photo = serializer.save(experience=experience)
            serializer = PhotoSerializer(photo, context={"request": request})
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExperienceBookings(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        experience = self.get_object(pk)
        bookings = Booking.objects.filter(
            experience=experience,
            kind=Booking.BookingKindChoices.EXPERIENCE,
        )
        serializer = PublicBookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        experience = self.get_object(pk)
        serializer = CreateExperienceBookingSerializer(
            data=request.data,
            context={"experience": experience},
        )
        if serializer.is_valid():
            check_in = serializer.validated_data["check_in"]
            booking = serializer.save(
                experience=experience,
                user=request.user,
                kind=Booking.BookingKindChoices.EXPERIENCE,
                check_out=check_in,
            )
            return Response(PublicBookingSerializer(booking).data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExperienceBookingCheck(APIView):
    def get_object(self, pk):
        try:
            return Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        experience = self.get_object(pk)
        check_in = request.query_params.get("check_in")
        from django.db.models import Sum
        booked_guests = (
            Booking.objects.filter(experience=experience, check_in=check_in)
            .aggregate(total=Sum("guests"))["total"]
            or 0
        )
        max_participants = experience.max_participants
        remaining = max_participants - booked_guests
        return Response({
            "ok": remaining > 0,
            "booked_guests": booked_guests,
            "max_participants": max_participants,
            "remaining": remaining,
        })
