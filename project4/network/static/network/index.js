// After DOM is loaded run setLikeClass function
document.addEventListener('DOMContentLoaded', setLikeClass)


// This function provides CSRF Token that we can use in PUT & POST methods inside JavaScript
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');


// This function sets the class of the button to like or unlike depending on 
// whether or not we already like the post or don't like it
function setLikeClass() {

    // Find all the like/un-like buttons
    var likeButtons = document.querySelectorAll('.post-container .like-container .like');

    // Get the ID of the current user
    const userID = document.querySelector("#userID").value;

    // Get the id list of everyone who liked each post and check if request.user liked it too
    for(var i=0; i < likeButtons.length; i++){
        const postLikers = likeButtons[i].innerHTML;

        // If request.user is inside post likers set button to unlike, else set to like.
        if(String(postLikers).includes(String(userID))){
            likeButtons[i].className = "unlike";
        } else {
            likeButtons[i].className = "like";
        }

        // Clear button innerHTML (id's of post likers)
        likeButtons[i].innerHTML = "";
    }

    // Run turnButtons function
    turnButtons()
}


// If you click on an element with className 'userLink',
// you will be taken to the profile page of the user whose name you clicked on
document.addEventListener('click', event => {
    var element = event.target;
    if(element.className === "userLink"){
        var user = element.innerHTML
        location.href = `profile/${user}`
    }
})


function turnButtons() {

    // On click, it saves the item that was clicked on
    document.addEventListener('click', event => {
    var element = event.target;

    // Checks if the class name of the element was 'edit'
    if(element.className === "edit"){

        // Get the post id and find it by its id inside div with class 'postInnerContainer'
        const post_id = element.id
        let post_content = document.querySelector(`.postInnerContainer #id_${post_id}`)

        // Changes the content of the post to a pre-filled form with the current content
        post_content.innerHTML = `<div class="form-group">
        <input class="form-edit" type="text"  value="${post_content.innerHTML}">
        </div>`
        
        // Change 'Edit' button to 'Save' button
        element.className = "submit-edit"
        element.innerHTML = "Save"

        // On click, it saves the item that was clicked on
        document.addEventListener('click', event => {
            var element2 = event.target;

            // Checks if the class name of the element was 'submit-edit'
            if(element2.className === "submit-edit"){
                // Collects the value typed into the form
                var new_content = document.querySelector(".form-edit").value;

                // Changes the content of the post to the new one entered in the form
                fetch(`/api/post/${post_id}`,{
                    method: 'PUT',
                    headers: {'X-CSRFToken': csrftoken},  
                    body: JSON.stringify({
                        content: new_content
                    })
                })

                // Change 'Savve' button back to 'Edit' button
                element.className = "edit"
                element.innerHTML = "Edit"

                // Changes the content of the post from form to the new one entered in the form
                post_content.innerHTML = `${new_content}`
            }
        })

    // Checks if the class name of the element was 'like'
    } else if(element.className === "like"){

        var likes = parseInt(element.value) + 1
        var likers = document.querySelector(".hidden").value
        var current_user = document.querySelector("#userID").value
        var likes_div = element.parentElement
        var what = likes_div.querySelector("small")
        var number = parseInt(what.innerHTML) + 1

        fetch(`/api/post/${element.id}`, {
            method: 'PUT',
            headers: {'X-CSRFToken': csrftoken},  
            body: JSON.stringify({
                likes: number,
                likers: current_user
            })
        })

        var likes_div = element.parentElement
        var what = likes_div.querySelector("small")
        var number = what.innerHTML
        what.innerHTML = parseInt(number) + 1
        element.value = likes
        element.className = "unlike"
        element.innerHTML = ""

    // Checks if the class name of the element was 'unlike'
    } else if(element.className === "unlike"){

        var likers = document.querySelector(".hidden").value
        var current_user = document.querySelector("#userID").value
        var new_likes = parseInt(element.value) - 1
        var likes_div = element.parentElement
        var what = likes_div.querySelector("small")
        var number = parseInt(what.innerHTML) - 1

        console.log(element.value)
        fetch(`/api/post/${element.id}`, {
            method: 'PUT',
            headers: {'X-CSRFToken': csrftoken},  
            body: JSON.stringify({
                likes: number,
                likers: current_user
            })
        })

        var likes_div = element.parentElement
        var what = likes_div.querySelector("small")
        var number = what.innerHTML
        what.innerHTML = parseInt(number) - 1
        element.value = likes
        element.className = "like"
        element.innerHTML = ""
    }
    })
}