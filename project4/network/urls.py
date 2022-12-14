from django.urls import path
from . import views

urlpatterns = [


    path("", views.index, name="index"),
    path("following", views.following, name="following"),
    path("profile/<str:pk>/", views.profile, name="profile"),


    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),


    path("api/follow/<str:pk>", views.followAPI, name="follow"),
    path("api/post/<str:pk>", views.postAPI, name="post")

    
]
