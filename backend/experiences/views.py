from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied, ParseError
from .models import Perk, Experience
from . import serializers
from medias.serializers import PhotoSerializer
from bookings.models import Booking
from bookings.serializers import PublicBookingSerializer, CreateExperienceBookingSerializer
from reviews.serializers import ReviewSerializer


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
        qs = Experience.objects.prefetch_related("photos", "reviews")

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
        elif ordering == "rating":
            from django.db.models import Avg, Value
            from django.db.models.functions import Coalesce
            qs = qs.annotate(
                avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
            ).order_by("-avg_rating")
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
                "photos", "perks", "reviews"
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


class ExperienceReviews(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
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
        experience = self.get_object(pk)
        reviews = experience.reviews.select_related("user")[start:end]
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        experience = self.get_object(pk)
        has_booking = Booking.objects.filter(
            experience=experience,
            user=request.user,
            kind=Booking.BookingKindChoices.EXPERIENCE,
        ).exists()
        if not has_booking:
            raise ParseError("이 체험을 예약한 사용자만 리뷰를 작성할 수 있습니다.")
        if experience.reviews.filter(user=request.user).exists():
            raise ParseError("이미 이 체험에 리뷰를 작성하셨습니다.")
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(
                user=request.user,
                experience=experience,
            )
            return Response(ReviewSerializer(review).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExperienceBookingCheckMine(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Experience.objects.get(pk=pk)
        except Experience.DoesNotExist:
            raise NotFound

    def get(self, request, pk):
        if not request.user.is_authenticated:
            return Response({"has_booking": False})
        experience = self.get_object(pk)
        has_booking = Booking.objects.filter(
            experience=experience,
            user=request.user,
            kind=Booking.BookingKindChoices.EXPERIENCE,
        ).exists()
        return Response({"has_booking": has_booking})


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
