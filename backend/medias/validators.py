from PIL import Image, UnidentifiedImageError
from django.core.exceptions import ValidationError

ALLOWED_FORMATS = {"JPEG", "PNG", "GIF", "WEBP"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_DIMENSION = 10_000  # 10,000px per side


def validate_image_upload(file):
    """파일 크기, 형식, 무결성, 해상도 동기 검사"""
    # 1. 파일 크기
    if file.size > MAX_FILE_SIZE:
        raise ValidationError("파일 크기는 10MB 이하여야 합니다.")

    # 2. Pillow로 형식 식별 (magic bytes 기반)
    try:
        file.seek(0)
        img = Image.open(file)
        fmt = img.format  # 헤더 읽기
    except UnidentifiedImageError:
        raise ValidationError(
            "지원하지 않는 이미지 형식입니다. JPEG, PNG, GIF, WEBP 파일을 사용해주세요."
        )
    except Exception:
        raise ValidationError("유효하지 않은 이미지 파일입니다.")

    # 3. 허용 형식 검사
    if fmt not in ALLOWED_FORMATS:
        raise ValidationError(
            f"JPEG, PNG, GIF, WEBP 형식만 허용됩니다. (현재: {fmt or '알 수 없음'})"
        )

    # 4. 해상도 검사 (decompression bomb 방지) + 실제 디코딩으로 무결성 확인
    try:
        img.load()
    except Exception:
        raise ValidationError("이미지 파일이 손상되었습니다.")

    if img.width > MAX_DIMENSION or img.height > MAX_DIMENSION:
        raise ValidationError(f"이미지 해상도는 {MAX_DIMENSION:,}px 이하여야 합니다.")

    file.seek(0)
