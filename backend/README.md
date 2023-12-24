#목차

1. [SET UP](#set-up)
2. [DJANGO BASICS](#django-basics)
   <br>
   2.1 [Run Server](#run-server)
   <br>
   2.2 [Migrations](#migrations)
   <br>
   2.3 [Super User](#super-user)
3. [DANGO APPS](#django-apps)
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

- ### Run Server

  - `poetry shell`로 버블 안에 들어가준 다음

  ```python
  python manage.py runserver  # 서버 실행
  ```

  위의 명령어를 작성하면 ![Alt text](./images/python_manage.py_runserver.png)
  18개의 `migration`이 적용되지 않았다고 뜨지만 `http://127.0.0.1:8000`의 주소로 서버를 작동시켰다.(`Ctrl + C: 서버 끄기`)
  <br>

  - `/admin`으로 접속했을 때 원래는

    ```python
    OperationalError at /admin/
    no such table: django_session
    ...
    ```

    위의 오류가 떠야 정상이지만

    어째서인지 오류가 발생하지 않는다.(당연히 로그인은 안된다.)

<br>

- ### Migrations

  - admin 접속이 안되는 이유는 데이터베이스에 `django_session`이라는 테이블이 없기 때문.
  - 현재 `db.sqlite3` 데이터베이스 파일은 비어있음.
    > DB에 `django_session` 이라는 테이블을 생성하는 `migration`을 실행해야 한다.
  - migration은 데이터베이스의 state를 수정하는 것이다.

  - Django는 18개의 어딘가에 어떤 파일(Migration)들을 가지고 있다. 이는 DB의 state를 변경할 파일들이다. 그 파일을 실행하면 파일이 DB를 변경할 것이다.

  - 서버를 끄고`python manage.py migrate` 입력하면 됨.
    ![Alt text](./images/python_manage.py_migrate.png)

  - 다시 `/admin`으로 들어가보면
    ![Alt text](./images/administraion.png)
    - `Django administration`이 나온다.
      <br>
      1. 이 페이지를 얻기 위해 어느 코드도 작성하지 않았다.
      2. 자동으로 `validation`을 해준다.    
        ![Alt text](./images/validation.png)


<br>

- ### Super user
  - `Django`가 돌아가고 있는 터미널 외에 추가로 터미널을 하나 열어준다.
    > 한 터미널에서는 `Django` 서버를 실행해야 하고, 다른 터미널에서는 명령어를 실행해야 하기 때문

  - 다음 명령어를 작성한다.
    <br>
    `python manage.py createsuperuser`
      ![Alt text](./images/python_manage.py_createsuperuser.png)
      - `Django`는 비밀번호 유효성 검사를 내포하고 있는 것을 알 수 있다.
  - 일단 우회하고 `Superuser`를 생성할 수 있다.
    - 로그인 해보면
      ![Alt text](./images/Django_admin_panel.png)
      - `admin` 패널을 볼 수 있다.

## DJANGO APPS
- 첫 번째 어플리케이션을 아래 명령어를 이용해 만들어보자.
  
  - `python manage.py startapp houses`
    > `houses`는 어플리케이션의 이름

  - `houses`라는 폴더가 생기고 여러 파일들이 생긴다.
    ![Alt text](./images/startapp_houses.png)
    - 장고는 프레임워크이기 때문에 이 파일들이 꼭 필요하다.

    `models.py`
    ```python
    from django.db import models

    # Create your models here.
    ```
    - `model`이 뭔지는 모르겠지만 `models.py`에 `model`을 생성해야 하는 것은 알 수 있다.

    `admin.py`
    ```python
    from django.contrib import admin

    # Register your models here.
    ```
    - `model`이 뭔지는 모르겠지만 `admin.py`에 `model`을 등록해야 하는 것은 알 수 있다.

- `model`은 어플리케이션에서 데이터의 모양을 묘사하는 것이다.
  - 여기서는 `houses` 어플리케이션이 가지는 `house`가 될 수 있다.

  - `house`는 주소, 사진, 이름, 가격 등의 데이터가 존재할 것이다. 데이터를 설명하고 데이터의 `type`을 정해야 한다.

- 첫 `model`을 생성해보자.
  ```python
  from django.db import models

  class House(model.Model):    # 모델이기 때문에 model을 상속받음
    
    """ Model Definition for Houses """

    name = models.CharField(max_length=140)
    price = models.PositiveIntegerField()
    description = models.TextField()
    address = models.CharField(max_length=140) 
  ```
  > 예를 들어, `name`은 내 데이터베이스에 있는 House는 name을 가지고, 형식은 CharField가 될거다. 최대길이는 140이다. 를 알려주는 것임

- 하지만 이렇게 작성만 해서는 `Django`가 알지 못한다. 이유는 `Houses` 어플리케이션을 설치하지 않았기 때문이다.
  - `config/settings.py`
    ```python
    # Application definition

    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'houses.apps.HousesConfig', # 추가해야 함
    ]
    ```
    - 어플리케이션을 작성하면 `Django`에게 직접 알려주어야 한다.
      `houses.apps.HousesConfig` 추가