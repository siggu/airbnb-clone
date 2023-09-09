## SET UP

- `python`
    - 터미널에서 `python`을 입력했을 때 `python 2.x`일 경우 python3.x를 다운받는다.
    - clone coding을 진행할 장소를 만들고
        ```
        git init
        ```
        명령어를 작성한다.

<br>

- `poetry`
    - `python-poetry.org` 사이트에서 자신의 환경에 맞는 명령어를 터미널에 입력한다.
    `(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -`
            ([windows 오류 해결방안](https://takeknowledge.tistory.com/145))
    - `poetry init`을 통해 poetry 패키지를 만든다.(라이센스: MIT)
    
    - ```python
        poetry add django
        ```
        django를 설치한다.

<br>

- start project
    - `poetry shell`을 통해 가상 환경으로 접속해준다.
        ```
        django-admin startproject config .
        ```
        현재 위치한 폴더에 config 폴더를 생성해준다.

    - `gitignore` 익스텐션 설치 후 `python` 프로젝트에 대한 gitignore를 만들어 준다.

<br>

## DJANGO BASICS
- Run Server
    - `poetry shell`로 버블 안에 들어가준 다음
    ```
    python manage.py runserver
    ```
    위의 명령어를 작성하면 ![Alt text](image.png)
    18개의 `migrations`가 적용되지 않았다고 뜨지만 `http://127.0.0.1:8000`의 주소로 서버를 작동시켰다.
    (`Ctrl + C: 서버 끄기`)