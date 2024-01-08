#목차

1. [SET UP](#set-up)
2. [DJANGO BASICS](#django-basics)
   <br>
   2.1 [Run Server](#run-server)
   <br>
   2.2 [Migrations](#migrations)
   <br>
   2.3 [Super User](#super-user)
   <br>
3. [DANGO APPS](#django-apps)
   <br>
   3.1 [Models](#models)
   <br>
   3.2 [Migrations](#migrations-1)
   <br>
   3.3 [Admin](#admin)
   <br>
   3.4 [Documentation](#documentation)
   <br>
4. [USERS APP](#users-app)
   <br>
   4.1 [Introduction](#introduction)
   <br>
   4.2 [Custom Model](#custom-model)
   <br>
   4.3 [Custom Fields](#custom-fields)
   <br>
   4.4 [Defaults](#defaults)
   <br>
   4.5 [Custom Adin](#custom-admin)
   <br>
   4.6 [Foreign Keys](#foreign-keys)
   <br>
5. [MODELS AND ADMIN](#models-and-admin)
   <br>
   5.1 [User Model](#user-model)
   <br>
   5.2 [Room Model](#room-model)
   <br>
   5.2 [Many to Many](#many-to-many)
   <br>
   5.3 [Rooms Admin](#rooms-admin)

<br>

## SET UP

- `python`

  - 터미널에서 `python`을 입력했을 때 `python 2.x`일 경우 python3.x를 다운받는다.
  - clone coding을 진행할 장소를 만든다.

    ```python
    git init    # 새로운 git 저장소를 초기화 시킴
    ```

- `poetry`

  - `python-poetry.org` 사이트에서 자신의 환경에 맞는 명령어를 터미널에 입력한다.
    `(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -`
    ([windows 오류 해결방안](https://takeknowledge.tistory.com/145))

  - `poetry init`을 통해 poetry 패키지를 만든다.(라이센스: MIT)

        ```python
        poetry add django   # django 설치
        ```

- start project

  - `poetry shell`을 통해 가상 환경으로 접속해준다.

    ```python
    django-admin startproject config .  # 현재 위치한 폴더에 생성
    ```

  - `gitignore` 익스텐션 설치 후 `python` 프로젝트에 대한 gitignore를 만들어 준다.

---

## DJANGO BASICS

### Run Server

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

### Migrations

- admin 접속이 안되는 이유는 데이터베이스에 `django_session`이라는 테이블이 없기 때문.
- 현재 `db.sqlite3` 데이터베이스 파일은 비어있음.
  > DB에 `django_session` 이라는 테이블을 생성하는 `migration`을 실행해야 한다.
- migration은 데이터베이스의 state를 수정하는 것이다.

- Django는 18개의 어딘가에 어떤 파일(Migration)들을 가지고 있다. 이는 DB의 state를 변경할 파일들이다. 그 파일을 실행하면 파일이 DB를 변경할 것이다.

- 서버를 끄고`python manage.py migrate` 입력하면 됨.

  ![Alt text](./images/python_manage.py_migrate1.png)

- 다시 `/admin`으로 들어가보면

  ![Alt text](./images/administraion.png)

  - `Django administration`이 나온다.
    <br>

    1. 이 페이지를 얻기 위해 어느 코드도 작성하지 않았다.
    2. 자동으로 `validation`을 해준다.

       ![Alt text](./images/validation.png)

<br>

### Super user

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

---

## DJANGO APPS

### Models

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

<br>

### Migrations

- 왜 이런 식으로 `Django`에게 데이터를 설명해야 하는가?

  ```python
  class House(models.Model):

      """ Model Definition for Houses """

      name = models.CharField(max_length=140)
      price = models.PositiveIntegerField()
      description = models.TextField()
      address = models.CharField(max_length=140)
  ```

  - 데이터베이스는 `SQL` 코드로 소통한다. 하지만 이런 식으로 작성해도 `Django`는 데이터가 어떻게 생겼는지 이해할 수 있다. 즉, `python` 코드를 작성하면 `Django`는 `SQL` 코드로 번역할 것이다.
  - `Django`는 데이터의 형식을 알고 있기 때문에, 데이터에 대한 관리 패널을 자동으로 생성할 수 있다.

    `houses/admin.py`

    ```python
    from django.contrib import admin
    from .models import House # House model import

    @admin.register(House)  # admin 패널에 House라는 model을 등록하겠다.
    class HouseAdmin(admin.ModelAdmin): # HouseAdmin이라는 class는 model을 위한 admin 패널을 만들어주는 ModelAdmin을 전체 상속받는다.
        pass # 별로 수정하지 않거나 아예 수정하지 않을 때 pass 사용
    ```

    > class HouseAdmin은 ModelAdmin(admin 패널)의 모든 것을 상속받는다. 그리고 이 class가 House model을 통제할 것이다.

    ![Alt text](./images/House_model_panel.png)

    - `admin` 패널을 얻을 수 있다.

- `Django`에게 데이터가 어떻게 생겼는지 알려주었지만, 데이터베이스는 아직 `House model`에 대해 모르는 상태이다.

  - 데이터베이스의 형태를 수정해야 한다는 말이다.
    <br>
    -> `migration`([migrations](#migrations))

- `migration`을 직접 생성한 후 적용해볼 것이다.

  `python manage.py makemigrations`

  ![Alt text](./images/python_manage.py_makemigrations.png)

  - `Django`가 `houses/migrations` 내부 폴더에 파일을 만들었다.

    `houses/migrations/0001_initial.py`

    ```python
    # Generated by Django 4.2.5 on 2023-12-24 07:28

    from django.db import migrations, models


    class Migration(migrations.Migration):

        initial = True

        dependencies = [
        ]

        operations = [
            migrations.CreateModel(
                name='House',
                fields=[
                    ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                    ('name', models.CharField(max_length=140)),
                    ('price', models.PositiveIntegerField()),
                    ('description', models.TextField()),
                    ('address', models.CharField(max_length=140)),
                ],
            ),
        ]

    ```

    - 이 `migration`을 적용시키면 데이터베이스의 상태가 변경될 것이다.

- `migration` 적용시키기

  - `python manage.py migrate`

    > 데이터베이스의 모양을 업데이트하면(model 안의 어떤 것을 수정하면) `migration`을 생성한 후 `migrate`하면 된다.

    ![Alt text](./images/python_manage.py_migrate2.png)

    ![Alt text](./images/Add_house.png)

    - 아까 작성했던 `field`가 `form`에 반영되었다.

<br>

### Admin

- `ADD HOUSE`를 통해 집을 하나 생성해보면

  ![Alt text](./images/House_object.png)

  > `House object`라는 이름으로 하나 생성된다.

- 어차피 `models.py`는 하나의 `class`로 작성되었으므로, `class`의 `Magic Method`를 작성할 수 있다.

  `houses/models.py`

  ```python
  from django.db import models

  class House(models.Model):

      """ Model Definition for Houses """

      ...

      def __str__(self):
          return self.name
  ```

  ![Alt text](./images/magic_method.png)

  > 직접 설정한 이름으로 보여지게 된다.

- `HOUSE`의 `admin` 패널에 기능을 추가할 수 있다.

  - `houses/admin.py`

    ```python
    from django.contrib import admin
    from .models import House


    @admin.register(House)
    class HouseAdmin(admin.ModelAdmin):
        list_display = (  # column 추가
            "name",
            "price_per_night",
            "address",
            "pets_allowed",
        )
        list_filter = (   # filter 추가
            "price_per_night",
            "pets_allowed",
        )
        search_fields = ("address",)  # address search 추가
    ```

    ![Alt text](./images/admin_panel_expansion.png)

<br>

### Documentation

- [장고 공식 문서 사이트](https://docs.djangoproject.com/en/5.0/)

---

## USERS APP

### Introduction

- 이미 `User`에는 많은 기능을 제공하지만, 만들 페이지에 따라 기능을 제거하거나 추가할 상황이 생긴다.

  > `Custom Model`을 만들자.

  - 첫 번째 방법

    - `Django`의 `User`를 사용하면서 추가적인 기능은 `Profile`을 만들어 `User`에 추가하는 것

  - 두 번째 방법
    - `User` 모델을 `Custom Model`로 교체하는 방법
      - `User application`을 만들고 `User Model`을 만들면 된다.
        > 공식 문서에서 적극 추천하는 방식

> 인터프리터에서 `poetry`에 있는 인터프리터 적용하기
> `poetry env info --path`

<br>

### Custom Model

- `python manage.py startapp users` 명령어로 `users` 어플리케이션을 만든다.

  - `Django`의 `user`를 상속받고 기능을 추가해보자.

    `users/models.py`

    ```python
    from django.db import models
    from django.contrib.auth.models import AbstractUser


    class User(AbstractUser):
        pass
    ```

- 다음은 `Django`에게 기본 `user`를 사용하지 않고 `user` 모델을 사용한다고 얘기해야 한다.

  - `config/settings.py`에서

    `AUTH_USER_MODEL = 'myapp.MyUser'`와 같은 형태로 설정하면 된다.

- 하지만 이미 데이터베이스에 `user`가 있는 상황에서 `custom model`을 만드는 것은 오류를 계속 발생시킨다. 따라서 프로젝트를 다시 시작해보자.

- `db.sqlite3` 지우기, `migrations(0001~00003)` 지우기

  - 서버 실행 전 `makemigrations`
    ![Alt text](./images/makemigrations_houses_users.png)
  - 이후 `migrate` 수행

- 다음은 `user` 모델을 관리자 페이지에 추가해야 한다.

  - 기존 `user` 모델을 그대로 사용하지 않고 `Custom` 모델을 등록하기 때문에 `import` 해와야 한다.

  - `users/admin.py`

    ```python
    from django.contrib import admin
    from django.contrib.auth.admin import UserAdmin
    from .models import User


    @admin.register(User)
    class CustomUserAdmin(UserAdmin):
        pass
    ```

- 데이터베이스를 삭제했기 때문에 `superuser`를 다시 생성하고 로그인 해야 한다.

- `user`에 들어가면 전에 있던 기능은 다 남았지만 다른 점은 `user admin` 패널을 조작할 수 있게 되었다는 점이다.

<br>

### Custom Fields

- `User` 모델을 `Custom` 하기 위해 먼저 `AbstractUser` 소스코드를 살펴보면

  ```python
  class AbstractUser(AbstractBaseUser, PermissionsMixin):
      """
      An abstract base class implementing a fully featured User model with
      admin-compliant permissions.

      Username and password are required. Other fields are optional.
      """

      ...

      username = models.CharField(
        _("username"),
        max_length=150,
        unique=True,
        help_text=_(
            "Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only."
        ),
        validators=[username_validator],
        error_messages={
            "unique": _("A user with that username already exists."),
        },
      )
      first_name = models.CharField(_("first name"), max_length=150, blank=True)
      last_name = models.CharField(_("last name"), max_length=150, blank=True)
      email = models.EmailField(_("email address"), blank=True)

      ...

  ```

  - `username`, `first_name`, `last_name` 등이 있다.
    - 만약 `first_name`과 `last_name`을 원하지 않는다면 소스코드는 건들지 않고 `modles.py`에서 overriding` 해야 한다.
      > `editable`을 `False`로 설정하면 `admin` 패널에 보이지 않는다.

- `AbstractUser`에 `username`과 `email`이 있는데, 어플리케이션에 `username`인 `email`이 없는 경우가 있다.
- 현재 어플리케이션에는 `username`이 없으므로 새로운 `user`를 만들 때 이메일을 받아서 `email`로 지정하고 `username` 또한 받은 이메일로 설정해야 한다.
- 다른 방법은 `AbstarctUser`의 `username`을 `overriding`할 수 있다.

`users/models.py`

```python
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    first_name = models.CharField(
        max_length=150,
        editable=False,
    )
    last_name = models.CharField(
        max_length=150,
        editable=False,
    )
    name = models.CharField(
        max_length=150,
    )
    is_host = models.BooleanField() # 방을 빌려주는 사용자인지 방을 빌리려는 사용자인지
```

- `models.py`를 수정한 후 `makemigrations`를 하면 다음과 같은 오류를 볼 수 있다.
  ![Alt text](./images/booleanfield_error.png)

<br>

### Defaults

- 위와 같은 에러가 발생한 이유는 `non-nullable field`인 `is_host`에 `null`값이 들어가있기 때문이다.

  - 이미 데이터베이스는 `user`를 가지고 있는데 데이터베이스에 `is_host`를 추가하게 된다면 기존 `user`에는 `is_host`가 정의되어 있지 않기 때문에 `null`값이 들어가게 될 것이다.

- 따라서 `is_host` `column`을 추가하는데 기존 `user`를 어떻게 할 것인지 두 가지 옵션을 준다.

  - `default` 값을 추가할 것인가
    - `default=True`, `default=False`
  - `null`값으로 데이터를 처리할 것인가

    - `null=True`

  - 첫 번째 방법으로 `default=False`를 부여해보자.

    - `name`에도 `default=""`를 부여해주자.

  - `migrations`을 정상적으로 만들고 `migrate` 해주면 잘 작동한다.

<br>

### Custom Admin

- `admin.py`에서는 `UserAdmin`을 전체 상속 받고 있는데, `UserAdmin`의 소스코드에서는 `first_name`과 `last_name`을 수정하려고 하고 있다.

  - 하지만, `users`의 `models.py`에서 `first_name`과 `last_name`을 `editable=False`로 설정했기 때문에 수정할 수 없는 상태이다.

- 따라서 `Admin class`를 수정하거나 `overriding`해야 한다.

  - `UserAdmin`
    ```python
    @admin.register(User)
    class UserAdmin(admin.ModelAdmin):
        add_form_template = "admin/auth/user/add_form.html"
        change_user_password_template = None
        fieldsets = (
            (None, {"fields": ("username", "password")}),
            (_("Personal info"), {"fields": ("first_name", "last_name", "email")}),
            (
                _("Permissions"),
                {
                    "fields": (
                        "is_active",
                        "is_staff",
                        "is_superuser",
                        "groups",
                        "user_permissions",
                    ),
                },
            ),
            (_("Important dates"), {"fields": ("last_login", "date_joined")}),
        )
    ```
    - `field set`은 `admin` 패널에서 `model`의 `field`가 보이는 순서를 설정할 수 있게 해준다.
    - 또한, `field`를 일종의 섹션 안에 넣고 제목을 붙일 수 있다.

- `users.admin.py`

  ```python
  from django.contrib import admin
  from django.contrib.auth.admin import UserAdmin
  from .models import User


  @admin.register(User)
  class CustomUserAdmin(UserAdmin):
      fieldsets = (
          (
              "Profile",
              {
                  "fields": ("username", "password", "name", "email", "is_host"),
              },
          ),
      )
  ```

  - 이렇게 `Profile` 섹션 안에 `field`를 넣을 수 있다.

    ![Alt text](./images/field_set.png)

- `UserAdmin`에서 `Permissions`과 `Important Dates`를 복사해서 붙여넣자.

  > 사용할 예정이기 때문

  - `users/admin.py`

    ```python
    from django.contrib import admin
    from django.contrib.auth.admin import UserAdmin
    from .models import User


    @admin.register(User)
    class CustomUserAdmin(UserAdmin):
        fieldsets = (
            (
                "Profile",
                {
                    "fields": ("username", "password", "name", "email", "is_host"),
                },
            ),
            (
                "Permissions",
                {
                    "fields": (
                        "is_active",
                        "is_staff",
                        "is_superuser",
                        "groups",
                        "user_permissions",
                    ),
                },
            ),
            (
                "Important Dates",
                {
                    "fields": ("last_login", "date_joined"),
                },
            ),
        )
    ```

    - `"classes": ("collapse",),`를 추가하면 숨기기 기능을 추가할 수 있다.

- `admin` 패널에서 보이는 `column`을 조정해보자.
  ```python
  list_display = (
    "username",
    "email",
    "name",
    "is_host",
  )
  ```

<br>

### Foreign Keys

- `house`와 `user`를 `Foreign Key`를 통해 연결해보자.

  - `houses/models.py`

    ```python
    class House(models.Model):

        ...

        pets_allowed = models.BooleanField(
            verbose_name="Pets Allowed?",
            default=True,
            help_text="Does this house allow pets?",
        )

        owner = models.ForeignKey("users.User", on_delete=models.CASCADE)

        def __str__(self):
            return self.name
    ```

    > `Django`에게 `house`가 `user`의 `ForeignKey`를 가지고 있다고 한 것

- `owner = models.ForeignKey("users.User", on_delete=models.CASCADE)` 코드를 추가한 다음 `migrations`를 지우고 다시 `migration`을 만든 다음 `migrate` 해주면

  ![Alt text](./images/Foreign_keys.png)

  - `house`를 생성할 때 `user`를 정할 수 있다.

- 다음 섹션으로 가기 전에 데이터베이스를 지우고 `houses` 어플리케이션도 지우고 `settings.py`에서 `houses` 어플리케이션을 지우자. `users`에 있는 `migrations` 파일도 지우자.

> `VS Code`에서 `SQLite Viewer Extension`을 설치하면 데이터베이스를 시각화하여 보여준다.

---

## MODELS AND ADMIN

### User Model

- `user` 모델을 확장해보자.

  - `user`가 프로필을 가지도록 해보자.

    `users/models.py`

    ```python
    class User(AbstractUser):
        first_name = models.CharField(
          max_length=150,
          editable=False,
        )
        last_name = models.CharField(
          max_length=150,
          editable=False,
        )
        avatar = models.ImageField()

        ...
    ```

    - `ImageField`를 사용하기 위해서는 `Pillow`를 설치해주어야 한다.
      > `poetry` 안에 있으므로 `poetry add Pillow`와 같은 형식으로 적어야 함

- `admin` 패널에서 옵션을 선택할 수 있는 기능을 만들어보자.

  - `User` 클래스 안에 다른 클래스를 만들고 필드의 옵션에 `choices=` 옵션을 추가해주면 된다.

    ```python
    class User(AbstractUser):
        class GenderChoices(models.TextChoices):
            MALE = ("male", "Male")
            FEMALE = ("female", "Female")

        class LanguageChoices(models.TextChoices):
            KR = ("kr", "Korean")
            EN = ("en", "English")

        class CurrencyChoices(models.TextChoices):
            WON = ("won", "Korean Won")
            USD = ("usd", "Dollar")

        ...

        avatar = models.ImageField(blank=True)  # 이미지 선택 안해도 됨
        gender = models.CharField(
            max_length=10,
            choices=GenderChoices.choices,
        )
        language = models.CharField(
            max_length=2,
            choices=LanguageChoices.choices,
        )
        currency = models.CharField(
            max_length=5,
            choices=CurrencyChoices.choices,
        )
    ```

    > `MALE = ("male", "Male")`에서 `"male"`은 데이터베이스에 들어가고 `"Male"`은 `admin` 패널에서 볼 `label`이다.

- 프로필 이미지 넣기, 성별 선택, 언어 선택, 화폐 선택을 할 수 있는 `field`가 생겼다.

  ![Alt text](./images/User_model.png)

<br>

### Room Model

`python manage.py startapp rooms` 코드를 통해 `room` 어플리케이션을 만들고 `config/settings.py`에 추가해주자.

- `room` 모델을 만들고 필드를 만들어보자.

  `rooms/models.py`

  ```python
  from django.db import models


  class Room(models.Model):

      """Room Model Definition"""

      class RoomKindChoices(models.TextChoices):
          ENTIRE_PLACE = ("entire_place", "Entire Place")
          PRIVATE_ROOM = ("private_room", "Private Room")
          SHARED_ROOM = ("shared_room", "Shared Room")

      country = models.CharField(
          max_length=50,
          default="한국",
      )
      city = models.CharField(
          max_length=80,
          default="서울",
      )
      price = models.PositiveIntegerField()
      rooms = models.PositiveIntegerField()
      toilets = models.PositiveIntegerField()
      description = models.TextField()
      address = models.CharField(
          max_length=250,
      )
      pet_friendly = models.BooleanField(
          default=True,
      )
      kind = models.CharField(
          max_length=20,
          choices=RoomKindChoices.choices,
      )
      owner = models.ForeignKey(
          "users.User",
          on_delete=models.CASCADE,
      )


  class Amenity(models.Model):

      """Amenity Definition"""

      name = models.CharField(
          max_length=150,
      )
      description = models.CharField(
          max_length=150,
          null=True,
      )

  ```

<br>

### Many to Many

- `many to many`의 관계를 알아보자.

  - 그 전에 `many to one`, `one to many`의 의미를 알아야 한다.
  - 각 `room`에는 `owner`가 있다.

    - 여러 `room`이 한 `owner`의 것일 수 있다.(`many to one`)

      > `[Room1, Room2, Room3] => owner1`

    - 한 `onwer`가 여러 `room`을 가질 수 있다.(`one to many`)

      > `owner1 => [Room1, Room2, Room3]`

- 그렇다면 `many to many` 관계는 무엇일까.

  - 예를 들어 `rooms/models.py`의 `Amenity`가 여러 개 있다고 해보자.
  - 즉 여러 `room`이 여러 `amenity`를 가질 수 있다는 것이다.

    > `[Amenity1, Amenity2, Amenity3] => [Room1, Room2, Room3]`

- `rooms/models.py`

  ```python
  from django.db import models
  from common.models import CommonModel

  class Room(CommonModel):

      """Room Model Definition"""

      ...

      owner = models.ForeignKey(
          "users.User",
          on_delete=models.CASCADE,
      )
      amenities = models.ManyToManyField(
          "rooms.Amenity",
      )


  class Amenity(CommonModel):

      """Amenity Definition"""

      name = models.CharField(
          max_length=150,
      )
      description = models.CharField(
          max_length=150,
          null=True,
      )
  ```

  - `amenities = models.ManyToManyField()`를 추가해 `many to many` 관계를 추가해주었다. 그리고 `room`과 `amenity`에 만든 날짜, 업데이트 날짜 필드를 넣었다.

    - 매번 같은 코드를 복붙하지 않고 `common` 어플리케이션을 만들어 모델을 만들 때 상속받게 하였다.

  - `common/models.py`

    ```python
    from django.db import models


    class CommonModel(models.Model):

        """Common Model Definition"""

        created_at = models.DateTimeField(
            auto_now_add=True,
        )
        updated_at = models.DateTimeField(
            auto_now=True,
        )

        class Meta:
            abstract = True

    ```

    - `class Meta`에서 `abstarct=True`로 설정하면 `CommonModel` 모델을 데이터베이스에 넣지 않는다.

- `rooms/admin.py` 에서 `room`과 `amenity`를 보여줄 `admin` 패널을 간단히 만들면

  ```python
  from django.contrib import admin
  from .models import Room, Amenity


  @admin.register(Room)
  class RoomAdmin(admin.ModelAdmin):
      pass


  @admin.register(Amenity)
  class AmenityAdmin(admin.ModelAdmin):
      pass
  ```

  - 방을 만들 때 `ameinty`를 추가할 수 있게 된다.

    ![Alt text](./images/Amenity.png)

<br>

### Rooms Admin

- `rooms/models.py`와 `rooms/admin.py`에 코드를 추가해보자.

  - `rooms/models.py`

    ```python
    from django.db import models
    from common.models import CommonModel


    class Room(CommonModel):

        """Room Model Definition"""

        ...

        name = models.CharField(
            max_length=180,
            default=" ",
        )

        ...

        amenities = models.ManyToManyField(
            "rooms.Amenity",
        )

        def __str__(self) -> str:
            return self.name


    class Amenity(CommonModel):

        """Amenity Definition"""

        name = models.CharField(
            max_length=150,
        )
        description = models.CharField(
            max_length=150,
            null=True,
            blank=True,
        )

        def __str__(self) -> str:
            return self.name

        class Meta:
            verbose_name_plural = "Amenities"


    ```

    - `__str__` 매직 메서드를 활용해 이름 지은 그대로 화면에 보이도록 하고
    - `class Meta`에 `verbose_name_plural="Amenities"`를 추가함으로써 제대로 된 복수형으로 나타낸다.

  - `rooms/admin.py`

    ```python
    from django.contrib import admin
    from .models import Room, Amenity


    @admin.register(Room)
    class RoomAdmin(admin.ModelAdmin):
        list_display = (
            "name",
            "price",
            "kind",
            "owner",
            "created_at",
            "updated_at",
        )
        list_filter = (
            "country",
            "city",
            "pet_friendly",
            "kind",
            "amenities",
            "created_at",
            "updated_at",
        )


    @admin.register(Amenity)
    class AmenityAdmin(admin.ModelAdmin):
        list_display = (
            "name",
            "description",
            "created_at",
            "updated_at",
        )
        readonly_fields = (
            "created_at",
            "updated_at",
        )

    ```
