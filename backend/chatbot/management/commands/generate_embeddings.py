"""
숙소와 체험의 embedding 벡터를 생성합니다.

사용법:
  python manage.py generate_embeddings            # 모든 embedding 없는 항목 처리
  python manage.py generate_embeddings --all      # 전체 재생성
  python manage.py generate_embeddings --rooms    # 숙소만
  python manage.py generate_embeddings --experiences  # 체험만
"""

import time
from django.core.management.base import BaseCommand
from chatbot.agents.embeddings import get_embedding, build_room_text, build_experience_text


class Command(BaseCommand):
    help = "숙소/체험 embedding 벡터를 생성합니다."

    def add_arguments(self, parser):
        parser.add_argument("--all", action="store_true", help="전체 재생성")
        parser.add_argument("--rooms", action="store_true", help="숙소만 처리")
        parser.add_argument("--experiences", action="store_true", help="체험만 처리")
        parser.add_argument("--batch", type=int, default=20, help="배치 크기 (기본: 20)")

    def handle(self, *args, **options):
        do_rooms = options["rooms"] or not options["experiences"]
        do_exp = options["experiences"] or not options["rooms"]

        if do_rooms:
            self._process_rooms(options["all"], options["batch"])
        if do_exp:
            self._process_experiences(options["all"], options["batch"])

    def _process_rooms(self, force_all: bool, batch_size: int):
        from rooms.models import Room

        qs = Room.objects.all() if force_all else Room.objects.filter(embedding__isnull=True)
        total = qs.count()
        self.stdout.write(f"숙소 {total}개 처리 시작...")

        done = 0
        for room in qs.iterator():
            text = build_room_text(room)
            room.embedding = get_embedding(text)
            room.save(update_fields=["embedding"])
            done += 1
            if done % batch_size == 0:
                self.stdout.write(f"  숙소 {done}/{total} 완료")
                time.sleep(0.5)  # API rate limit 방지

        self.stdout.write(self.style.SUCCESS(f"숙소 embedding {done}개 완료"))

    def _process_experiences(self, force_all: bool, batch_size: int):
        from experiences.models import Experience

        qs = Experience.objects.all() if force_all else Experience.objects.filter(embedding__isnull=True)
        total = qs.count()
        self.stdout.write(f"체험 {total}개 처리 시작...")

        done = 0
        for exp in qs.iterator():
            text = build_experience_text(exp)
            exp.embedding = get_embedding(text)
            exp.save(update_fields=["embedding"])
            done += 1
            if done % batch_size == 0:
                self.stdout.write(f"  체험 {done}/{total} 완료")
                time.sleep(0.5)

        self.stdout.write(self.style.SUCCESS(f"체험 embedding {done}개 완료"))
