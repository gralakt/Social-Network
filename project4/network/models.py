from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    content = models.CharField(max_length=1000)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    likes = models.IntegerField(default=0)
    likers = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    class Meta:
        ordering = ['-created']
    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "created": self.created,
            "updated": self.updated,
            "user": self.user.username,
            "user_id": self.user.id,
            "likes": self.likes,
            "likers": [user.id for user in self.likers.all()]
            }


class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="whatever")
    following = models.ManyToManyField(User, related_name='following', blank=True)
    followers = models.ManyToManyField(User, related_name='follow', blank=True)
    number_of_followers = models.IntegerField(default=0)
    number_of_following = models.IntegerField(default=0)
    def serialize(self):
        return {
            user.username for user in self.following.all()
        }

