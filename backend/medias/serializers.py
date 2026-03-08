from rest_framework.serializers import ModelSerializer
from .models import Photo


class PhotoSerializer(ModelSerializer):
    class Meta:
        model = Photo
        fields = (
            "pk",
            "file",
            "description",
            "status",
        )

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.status != Photo.StatusChoices.APPROVED:
            ret["file"] = None
        elif instance.file:
            url = instance.file.url
            if url.startswith("http://") or url.startswith("https://"):
                ret["file"] = url
            else:
                request = self.context.get("request")
                if request:
                    ret["file"] = request.build_absolute_uri(url)
        return ret
