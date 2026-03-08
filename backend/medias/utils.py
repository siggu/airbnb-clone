import io

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image


def strip_exif(uploaded_file):
    """EXIF 메타데이터(GPS 위치 등) 제거 후 새 파일 반환"""
    uploaded_file.seek(0)
    img = Image.open(uploaded_file)
    fmt = img.format or "JPEG"

    # JPEG는 RGBA/P 모드 저장 불가 → RGB 변환
    if fmt == "JPEG" and img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGB")

    output = io.BytesIO()
    save_kwargs = {"format": fmt}
    if fmt == "JPEG":
        save_kwargs["quality"] = 95

    img.save(output, **save_kwargs)
    output.seek(0)

    return InMemoryUploadedFile(
        file=output,
        field_name="ImageField",
        name=uploaded_file.name,
        content_type=uploaded_file.content_type,
        size=output.getbuffer().nbytes,
        charset=None,
    )
