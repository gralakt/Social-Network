
document.addEventListener('DOMContentLoaded', followers);

function followers() {
    const user = document.querySelector('.followers').id
    const followers_counter = document.querySelector("#number_of_followers")
    const following_counter = document.querySelector("#number_of_following")
    var userID = document.querySelector('.userID').id
    fetch(`/api/follow/${user}`)
    .then(response => response.json())
    .then(data => {
        followers_counter.innerHTML = `${data.followers_number} followers`
        following_counter.innerHTML = `${data.following_number} follows`
        let data_user = data.user
        var likers_list = data.followers
        let follow = document.querySelector("#follow")
        let unFollow = document.querySelector("#unfollow")
        follow.value = data.followers_number
        unfollow.value = data.followers_number
        follow.className = data.user
        unfollow.className = data_user

            if(likers_list.includes(parseInt(userID))){
                unFollow.style.display = "block"
                follow.style.display = "none" 
            } else if (userID == data.user){
                follow.style.display = "none"
                unFollow.style.display = "none"
            } else {
                follow.style.display = "block"
                unFollow.style.display = "none"
            }
    })

}


document.addEventListener('DOMContentLoaded', following)
function following(){
    document.addEventListener('click', event => {
    var element = event.target;
    if(element.id === "follow"){

        console.log('FOLLOW BUTTON')

        var current_user = document.querySelector(".userID").id

        var likes_div = element.parentElement
    
        var number = parseInt(element.value) + 1
        console.log(number)

        fetch(`/api/follow/${element.className}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},  
        body: JSON.stringify({
            number_of_followers: number,
            followers: current_user
            })
        })
        var username = document.querySelector(".username").innerHTML

        var number_of_followers = document.querySelector("#number_of_followers")
        number_of_followers.innerHTML = `${number} followers`
        let unFollow = document.querySelector("#unfollow")
        let follow = document.querySelector("#follow")
        unFollow.value = number
        unFollow.style.display = "block"
        follow.style.display = "none"
        

    }else if(element.id === "unfollow"){
        console.log('UNFOLLOW BUTTON')
        var current_user = document.querySelector(".userID").id
        var likes_div = element.parentElement

        var number = parseInt(element.value) - 1


        fetch(`/api/follow/${element.className}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},  
        body: JSON.stringify({
            number_of_followers: number,
            followers: current_user
            })
        })
        var username = document.querySelector(".username").innerHTML


        var number_of_followers = document.querySelector("#number_of_followers")
        number_of_followers.innerHTML = `${number} followers`
        let unFollow = document.querySelector("#unfollow")
        let follow = document.querySelector("#follow")
        follow.value = number
        unFollow.style.display = "none"
        follow.style.display = "block"
    }
})
}
        