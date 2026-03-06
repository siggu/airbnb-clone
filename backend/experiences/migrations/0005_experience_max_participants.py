from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('experiences', '0004_alter_experience_category_alter_experience_host_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='experience',
            name='max_participants',
            field=models.PositiveIntegerField(default=2),
        ),
    ]
