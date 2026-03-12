from django.contrib import admin
from .models import Room, Amenity


@admin.action(description="Set all prices to 0")
def reset_prices(model_admin, request, rooms):
    for room in rooms.all():
        room.price = 0
        room.save()


@admin.action(description="선택한 숙소의 embedding 재생성")
def regenerate_embeddings(model_admin, request, queryset):
    from chatbot.agents.embeddings import get_embedding, build_room_text
    count = 0
    for room in queryset.prefetch_related("amenities"):
        room.embedding = get_embedding(build_room_text(room))
        room.save(update_fields=["embedding"])
        count += 1
    model_admin.message_user(request, f"{count}개 숙소의 embedding이 재생성되었습니다.")


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    actions = (reset_prices, regenerate_embeddings)

    list_display = (
        "name",
        "rating",
        "owner",
        "has_embedding",
    )
    list_filter = (
        "country",
        "city",
        "pet_friendly",
        "kind",
        "owner__username",
    )
    search_fields = ("owner__username",)
    readonly_fields = ("has_embedding",)

    @admin.display(description="임베딩", boolean=True)
    def has_embedding(self, room):
        return room.embedding is not None

    def total_amenities(self, room):
        return room.amenities.count()


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "description",
        "created_at",
        "updated_at",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )
