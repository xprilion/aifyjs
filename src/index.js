// var $ = require("jquery");

class aify {
  constructor() {
    // this.html = document.documentElement.innerHTML;
    var $ = window.$;
    this.html = $("html").html();
    // this.csrf_token = "#CSRF_TOKEN";

    $.ajax({
      method: "POST",
      url: "http://423b4a7b.ngrok.io/js/",
      data: {
        pageBody: this.html
        // csrf_token: this.csrf_token
      },
      success: function(response) {
        console.log(response);
      }
    }).done(function() {
      console.log("Done query!");
    });
  }
  // area() {
  //   return Math.pow(this.width, 2);
  // }
}

window.aifyjs = aify;

export default aifyjs;
