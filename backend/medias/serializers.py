from rest_framework.serializers import ModelSerializer
from .models import Photo


class PhotoSerializer(ModelSerializer):
    class Meta:
        model = Photo
        fields = (
            "pk",
            "file",
            "description",
        )

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        file_value = str(instance.file)
        if file_value.startswith("http://") or file_value.startswith("https://"):
            ret["file"] = file_value
        return ret
