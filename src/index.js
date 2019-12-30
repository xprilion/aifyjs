// var $ = require("jquery");
var baseUrl = "https://568bd7cf.ngrok.io/api";

class aify {
  constructor() {
    var $ = window.$;
    this.html = $("html").html();

    $.ajax({
      method: "POST",
      url: baseUrl + "/check",
      success: function(response) {
        console.log(response);
      }
    });
  }

  labels = function() {
    $.ajax({
      method: "POST",
      url: baseUrl + "/labels",
      data: {
        pageBody: this.html
      },
      success: function(response) {
        console.log(response);

        var changes = response.data.changes;
        for (var i = 0; i < changes.length; i++) {
          var xp = changes[i].xpath;
          var changeItems = changes[i].changes;
          for (var key in changeItems) {
            var element = document.evaluate(
              xp,
              document,
              null,
              XPathResult.ANY_UNORDERED_NODE_TYPE,
              null
            );
            element.singleNodeValue.setAttribute(key, changeItems[key]);
          }
        }
      }
    });
  };
}

window.aifyjs = aify;

export default aifyjs;