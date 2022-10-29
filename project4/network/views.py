from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Follow
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from django.core.paginator import Paginator

# Import native Django task queue related
from django.db.models import Q
import operator
from functools import reduce



# A function that render up all posts paginationed, and creates a new post for the POST request
def index(request):

    # Get all Post objects
    posts = Post.objects.all()

    # Set up Pagination
    p = Paginator(Post.objects.all(), 10)
    page = request.GET.get('page')
    post_list = p.get_page(page)
    context = {'post_list': post_list}

    # If POST method - create a new post
    if request.method == "POST":
        if request.POST.get('new_content') is not None:
            content = request.POST.get('new_content', '')
            user = request.user
            real_user = User.objects.get(username=user)
            post = Post()
            post.content = content
            post.user = real_user
            post.save()

    # Return index.html
    return render(request, "network/index.html", context)


# A function that render up posts from all users that request.user follows, paginationed
# If the user is not authenticated, redirect to the login page
@login_required(login_url='login')
def following(request):
    user = request.user.id
    following_users = Follow.objects.get(user=user)
    following = following_users.serialize()
    posts = []
    for i in following:
        posts.append(Q(user__username__contains=i))
    all_qs = Post.objects.filter(reduce(operator.or_, posts)).order_by('-created')
    print(all_qs)
    # Set up Pagination
    p = Paginator(all_qs, 10)
    page = request.GET.get('page')
    post_list = p.get_page(page)
    context = {'post_list': post_list}
    
    return render(request, "network/followin.html", context)


# A function that render up posts from requested users, paginationed
# If the user is not authenticated, redirect to the login page
@login_required(login_url='login')
def profile(request, pk):

    # Get the user object of the user whose profile we want to go to
    user_profile = User.objects.get(username=pk)

    # Get all the posts objects of the user whose profile we want to enter
    user_posts = Post.objects.filter(user=user_profile)

    # Set up Pagination
    p = Paginator(user_posts, 10)
    page = request.GET.get('page')
    post_list = p.get_page(page)
    
    # Set the context variable
    context = {'user': user_profile, 'post_list': post_list}
    return render(request, "network/profile.html", context)



@csrf_exempt
@login_required
def postAPI(request, pk):
    post = Post.objects.get(id=pk)
    if request.method == "GET":
        return JsonResponse(post.serialize(), safe=False)

    # Update likes count and likers of the post
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("content") is not None:
            post.content = data["content"]
        if data.get("likes") is not None:
            if data.get("likes") == int(post.likes) + 1:
                post.likes = data["likes"]
                post.likers.add(data["likers"])
            else:
                post.likes = data["likes"]
                post.likers.remove(data["likers"])
        post.save()
        return HttpResponse(status=204)

    elif request.method == "POST":
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
    

@csrf_exempt
@login_required
def followAPI(request, pk):
    follow = Follow.objects.get(user=pk)
    if request.method == "GET":
        return JsonResponse({
            "followers_number": follow.number_of_followers,
            "following_number": follow.number_of_following,
            "followers": [user.id for user in follow.followers.all()],
            "user": follow.user.id
        })

    # Update whether are request.user is following pk.user, and is pk.user is followed by request.user
    elif request.method == "PUT":
        data = json.loads(request.body)
        follow = Follow.objects.get(user=pk)

        if data.get("number_of_followers") is not None:
            
            current_user = data.get("followers")

            if data.get("number_of_followers") == int(follow.number_of_followers + 1):
                follow.number_of_followers = data["number_of_followers"]
                follow.followers.add(data["followers"])
                follower = Follow.objects.get(user=current_user)
                follower.following.add(pk)
                follower.number_of_following = follower.number_of_following + 1
                follower.save()

            else:
                follow.number_of_followers = data["number_of_followers"]
                follow.followers.remove(data["followers"])
                follower = Follow.objects.get(user=current_user)
                follower.following.remove(pk)

                follower.number_of_following = follower.number_of_following - 1
                follower.save()
        follow.save()
        
        return HttpResponse(status=204)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            follow = Follow()
            follow.user = user
            follow.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")