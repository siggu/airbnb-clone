#목차
1. [SET UP](#set-up)
2. [DJANGO BASICS](#django-basics)

## SET UP

- `python`
    - 터미널에서 `python`을 입력했을 때 `python 2.x`일 경우 python3.x를 다운받는다.
    - clone coding을 진행할 장소를 만든다.
        ```python
        git init    # 새로운 git 저장소를 초기화 시킴
        ```

<br>

- `poetry`
    - `python-poetry.org` 사이트에서 자신의 환경에 맞는 명령어를 터미널에 입력한다.
    `(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -`
            ([windows 오류 해결방안](https://takeknowledge.tistory.com/145))
    - `poetry init`을 통해 poetry 패키지를 만든다.(라이센스: MIT)
    
        ```python
        poetry add django   # django 설치
        ```

<br>

- start project
    - `poetry shell`을 통해 가상 환경으로 접속해준다.
        ```python
        django-admin startproject config .  # 현재 위치한 폴더에 생성
        ```

    - `gitignore` 익스텐션 설치 후 `python` 프로젝트에 대한 gitignore를 만들어 준다.

---

## DJANGO BASICS
- Run Server
    - `poetry shell`로 버블 안에 들어가준 다음
    ```python
    python manage.py runserver  # 서버 실행
    ```

    위의 명령어를 작성하면 ![Alt text](image.png)
    18개의 `migration`이 적용되지 않았다고 뜨지만 `http://127.0.0.1:8000`의 주소로 서버를 작동시켰다.(`Ctrl + C: 서버 끄기`)
    <br>
    - `/admin`으로 접속했을 때 원래는
    ```python
    OperationalError at /admin/
    no such table: django_session
    ...
    ``` 
    위의 오류가 떠야 정상이지만 ![Alt text](image-1.png)
    어째서인지 오류가 발생하지 않는다.(당연히 로그인은 안된다.)