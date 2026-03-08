from django.contrib import admin
from .models import Photo, Video


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = (
        "description",
        "status",
        "room",
        "experience",
    )
    list_filter = ("status",)
    search_fields = ("description",)
    list_editable = ("status",)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    pass
