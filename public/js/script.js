document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

let settings = {
  url: "/user/activity",
  method: "GET",
  timeout: 0,
};

// $.ajax(settings).done(function (response) {
//   console.log(response);
//   $(".online-box .list-group").html("");
//   for (let i = 0; i < response.length; i++) {
//     $(".online-box .list-group").append(`
//            <li class="list-group-item">
//             <div class="container">
//               <div class="row">
//                 <div class="col-3">
//                   <img style="width: 40px; height: 40px;" src="image/profile.svg" alt="">
//                 </div>
//                 <div class="col">
//                   <h5 class="mb-0">${response[i].userdata.firstName} ${response[i].userdata.lastName}</h5>
//                   <p class="mb-0">${response[i].userdata.email}</p>
//                 </div>
//               </div>
//             </div>
//           </li>
//              `);
//   }
// });

fetch(settings.url)
  .then((response) => response.json())
  .then((response) => {
    const list = document.querySelector(".online-box .list-group");

    for (let i = 0; i < response.length; i++) {
      list.innerHTML += `      
        <li class="list-group-item">
          <div class="container">
            <div class="row">
              <div class="col-3">
                <img style="width: 40px; height: 40px;" src="image/profile.svg" alt="">
              </div>
              <div class="col">
                <h5 class="mb-0">${response[i].userdata.firstName} ${response[i].userdata.lastName}</h5>
                <p class="mb-0">${response[i].userdata.email}</p>
              </div>
            </div>
          </div>
        </li>
        `;
    }
  });

// const cookieNow = document.cookie;
// console.log(cookieNow);

// function getCookie(name) {
//   // Split cookie string and get all individual name=value pairs in an array
//   var cookieArr = document.cookie.split(";");

//   // Loop through the array elements
//   for (var i = 0; i < cookieArr.length; i++) {
//     var cookiePair = cookieArr[i].split("=");

//     /* Removing whitespace at the beginning of the cookie name
//       and compare it with the given string */
//     if (name == cookiePair[0].trim()) {
//       // Decode the cookie value and return
//       return decodeURIComponent(cookiePair[1]);
//     }
//   }

//   // Return null if not found
//   return null;
// }

// function read_cookies(my_data){
//   document.write(document.cookie);
//   document.write("<br><br>");
//   var my_array=document.cookie.split(";");
//   for (let i=0;i<my_array.length;i++) {
//     //document.write(my_array[i] + "<br >");
//     var name=my_array[i].substr(0,my_array[i].indexOf("="),my_array[i]);
//     var value=my_array[i].substr(my_array[i].indexOf("=")+1);
//     //document.write( name + " : " + value + "<br>");
//     if(name==my_data){
//       return value;
//     }
//   }

// }

//   document.write("Welcome " + read_cookies("name"));
