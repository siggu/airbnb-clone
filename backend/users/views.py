import jwt
import requests
import cloudinary.uploader
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError, NotFound
from rest_framework.permissions import IsAuthenticated
from users.models import User
from rooms.models import Room
from reviews.models import Review
from reviews.serializers import ReviewSerializer
from rooms.serializers import RoomListSerializer
from experiences.models import Experience
from experiences.serializers import ExperienceListSerializer
from . import serializers


class Me(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = serializers.PrivateUserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = serializers.PrivateUserSerializer(
            user,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            user = serializer.save()
            serializer = serializers.PrivateUserSerializer(user)
            return Response(serializer.data)
        else:
            Response(serializer.errors)


class Users(APIView):
    def post(self, request):
        password = request.data.get("password")
        if not password:
            raise ParseError
        serializer = serializers.PrivateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(password)
            user.save()
            serializer = serializers.PrivateUserSerializer(user)
            return Response(serializer.data)
        else:
            return Response(serializer.errors)


class PublicUser(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise NotFound
        serializer = serializers.PrivateUserSerializer(user)
        return Response(serializer.data)


class UserRooms(APIView):
    def get(self, request, username):
        from django.db.models import Avg, Value
        from django.db.models.functions import Coalesce
        rooms = Room.objects.filter(owner__username=username).prefetch_related("photos").annotate(
            avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
        ).order_by("-created_at")
        paginator = PageNumberPagination()
        paginator.page_size = 12
        result_page = paginator.paginate_queryset(rooms, request)
        serializer = RoomListSerializer(
            result_page,
            many=True,
            context={"request": request},
        )
        return paginator.get_paginated_response(serializer.data)


class UserReviews(APIView):
    def get(self, request, username):
        reviews = Review.objects.filter(user__username=username).order_by("-created_at")
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(reviews, request)
        serializer = ReviewSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


class UserExperiences(APIView):
    def get(self, request, username):
        from django.db.models import Avg, Value
        from django.db.models.functions import Coalesce
        experiences = Experience.objects.filter(host__username=username).prefetch_related("photos").annotate(
            avg_rating=Coalesce(Avg("reviews__rating"), Value(0.0))
        ).order_by("-created_at")
        paginator = PageNumberPagination()
        paginator.page_size = 12
        result_page = paginator.paginate_queryset(experiences, request)
        serializer = ExperienceListSerializer(result_page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class ChangePassword(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        if not old_password or not new_password:
            raise ParseError
        if user.check_password(old_password):
            user.set_password(new_password)
            user.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class LogIn(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            raise ParseError
        user = authenticate(
            request,
            username=username,
            password=password,
        )
        if user:
            login(request, user)
            return Response({"ok": "환영합니다!"})
        else:
            return Response({"error": "아이디 또는 비밀번호가 올바르지 않습니다."}, status=status.HTTP_400_BAD_REQUEST)


class LogOut(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"ok": "로그아웃 되었습니다."})


class JWTLogIn(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            raise ParseError
        user = authenticate(
            request,
            username=username,
            password=password,
        )
        if user:
            token = jwt.encode(
                {"pk": user.pk},
                settings.SECRET_KEY,
                algorithm="HS256",
            )
            return Response({"token": token})
        else:
            return Response({"error": "아이디 또는 비밀번호가 올바르지 않습니다."})


class GithubLogIn(APIView):
    def post(self, request):
        try:
            code = request.data.get("code")
            access_token_response = requests.post(
                "https://github.com/login/oauth/access_token",
                params={
                    "code": code,
                    "client_id": "10136d2489a8c313cbe4",
                    "client_secret": settings.GH_SECRET,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI,
                },
                headers={"Accept": "application/json"},
            )
            access_token_data = access_token_response.json()
            access_token = access_token_data.get("access_token")
            if not access_token:
                return Response(
                    {"error": access_token_data.get("error_description", "액세스 토큰을 가져오는 데 실패했습니다.")},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user_data = requests.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
            user_data = user_data.json()
            user_emails = requests.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
            user_emails = user_emails.json()
            if not isinstance(user_emails, list) or len(user_emails) == 0:
                return Response(
                    {"error": "GitHub에서 이메일 정보를 가져오는 데 실패했습니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            github_id = str(user_data.get("id"))
            github_username = user_data.get("login")
            github_email = user_emails[0]["email"]
            try:
                user = User.objects.get(github_id=github_id)
            except User.DoesNotExist:
                unique_username = github_username
                suffix = 1
                while User.objects.filter(username=unique_username).exists():
                    unique_username = f"{github_username}_gh{suffix}"
                    suffix += 1
                user = User.objects.create(
                    username=unique_username,
                    email=github_email,
                    name=user_data.get("name"),
                    avatar=user_data.get("avatar_url"),
                    github_id=github_id,
                )
                user.set_unusable_password()
                user.save()
            login(request, user)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class KakaoLogIn(APIView):
    def post(self, request):
        try:
            code = request.data.get("code")
            access_token = requests.post(
                "https://kauth.kakao.com/oauth/token",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "grant_type": "authorization_code",
                    "client_id": "564d95aa68dfb025d4f3726ecaac2764",
                    "redirect_uri": settings.KAKAO_REDIRECT_URI,
                    "code": code,
                },
            )
            access_token = access_token.json().get("access_token")
            user_data = requests.get(
                "https://kapi.kakao.com/v2/user/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            user_data = user_data.json()
            kakao_account = user_data.get("kakao_account")
            profile = kakao_account.get("profile")
            try:
                user = User.objects.get(email=kakao_account.get("email"))
                login(request, user)
                return Response(status=status.HTTP_200_OK)
            except User.DoesNotExist:
                user = User.objects.create(
                    email=kakao_account.get("email"),
                    username=profile.get("nickname"),
                    name=profile.get("nickname"),
                    avatar=profile.get("profile_image_url"),
                )
                user.set_unusable_password()
                user.save()
                login(request, user)
                return Response(status=status.HTTP_200_OK)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UploadAvatar(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from medias.validators import validate_image_upload
        from medias.utils import strip_exif
        from django.core.exceptions import ValidationError as DjangoValidationError

        file = request.FILES.get("avatar")
        if not file:
            raise ParseError("파일이 없습니다.")
        try:
            validate_image_upload(file)
        except DjangoValidationError as e:
            raise ParseError(e.message)
        clean_file = strip_exif(file)
        result = cloudinary.uploader.upload(clean_file, folder="avatars/")
        request.user.avatar = result["secure_url"]
        request.user.save()
        serializer = serializers.PrivateUserSerializer(request.user)
        return Response(serializer.data)


class SignUp(APIView):
    def post(self, request):
        try:
            name = request.data.get("name")
            email = request.data.get("email")
            username = request.data.get("username")
            password = request.data.get("password")

            if User.objects.filter(email=email):
                return Response(
                    {"fail": "이미 사용 중인 이메일입니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if User.objects.filter(username=username):
                return Response(
                    {"fail": "이미 사용 중인 아이디입니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = User.objects.create(
                name=name,
                email=email,
                username=username,
            )
            user.set_password(password)
            user.save()
            login(request, user)
            return Response(status=status.HTTP_200_OK)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)
