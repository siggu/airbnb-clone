from django.contrib import admin
from .models import Experience, Perk


@admin.action(description="선택한 체험의 embedding 재생성")
def regenerate_embeddings(model_admin, request, queryset):
    from chatbot.agents.embeddings import get_embedding, build_experience_text
    count = 0
    for exp in queryset.prefetch_related("perks"):
        exp.embedding = get_embedding(build_experience_text(exp))
        exp.save(update_fields=["embedding"])
        count += 1
    model_admin.message_user(request, f"{count}개 체험의 embedding이 재생성되었습니다.")


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    actions = (regenerate_embeddings,)
    list_display = (
        "name",
        "host",
        "has_embedding",
    )
    list_filter = ("category",)
    search_fields = ("name",)
    readonly_fields = ("has_embedding",)

    @admin.display(description="임베딩", boolean=True)
    def has_embedding(self, exp):
        return exp.embedding is not None


@admin.register(Perk)
class PerkAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "detail",
        "explanation",
    )
