// var $ = require("jquery");
import "./index.css";

var baseUrl = "https://568bd7cf.ngrok.io/api";
// var baseUrl = "https://8b5766f9.ngrok.io/api";
class aify {
  constructor() {
    var $ = window.$;
    var jQuery = window.jQuery;
    this.html = $("html").html();

    // var script = document.createElement('script');
    // script.src = something;
    // document.head.appendChild(script);

    $(document).bind("tripleclick", function() {
      window.SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      var finalTranscript = "";
      var recognition = new window.SpeechRecognition();
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognition.continuous = true;
      recognition.onresult = event => {
        let interimTranscript = "";
        for (
          let i = event.resultIndex, len = event.results.length;
          i < len;
          i++
        ) {
          let transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        console.log(finalTranscript);

        finalTranscript = "";

        recognition.stop();
      };
      recognition.start();
    });

    $.ajax({
      method: "POST",
      url: baseUrl + "/check",
      success: function(response) {
        console.log(response);
      }
    });
  }

  labels = function() {
    var self = this;

    self.labelcounter = 0;

    $.ajax({
      method: "POST",
      url: baseUrl + "/labels",
      data: {
        pageBody: self.html
      },
      success: function(response) {
        console.log(response);

        var changes = response.data.changes;

        self.labelchanges = changes;

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
            try {
              element.singleNodeValue.setAttribute(key, changeItems[key]);
              element.singleNodeValue.setAttribute(
                "change",
                "label_" + self.labelcounter
              );

              self.labelchanges[i].element = "label_" + self.labelcounter;

              self.labelcounter += 1;
            } catch (err) {
              console.log("Labels: ");
              console.log(xp);
              console.log(err);
            }
          }
        }
      }
    });
  };

  captions = function() {
    var self = this;

    self.captioncounter = 0;

    $.ajax({
      method: "POST",
      url: baseUrl + "/captions",
      data: {
        pageBody: self.html
      },
      success: function(response) {
        console.log(response);

        var changes = response.data.changes;

        self.captionchanges = changes;

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

            try {
              element.singleNodeValue.setAttribute(key, changeItems[key]);

              element.singleNodeValue.setAttribute(
                "change",
                "caption_" + self.captioncounter
              );

              self.captionchanges[i].element = "caption_" + self.captioncounter;

              self.captioncounter += 1;
            } catch (err) {
              console.log("captions");
              console.log(xp);
              console.log(err);
            }
          }
        }
      }
    });
  };

  displayLabels = function() {
    var changes = this.labelchanges;
    for (var i = 0; i < changes.length; i++) {
      var changeName = changes[i].element;
      var changeItems = changes[i].changes;
      for (var key in changeItems) {
        var element = document.querySelector("[change=" + changeName + "]");

        try {
          var wrapper = document.createElement("span");
          element.parentNode.insertBefore(wrapper, element);
          wrapper.style.background = "red";
          wrapper.appendChild(element);
          var label = document.createElement("span");
          // caption.style.background = "red";
          label.style.color = "white";
          label.innerHTML = changeItems[key];
          wrapper.appendChild(label);
        } catch (err) {
          console.log("labels");
          console.log(element);
          console.log(err);
        }
      }
    }
  };

  displayCaptions = function() {
    var changes = this.captionchanges;
    for (var i = 0; i < changes.length; i++) {
      var changeName = changes[i].element;
      var changeItems = changes[i].changes;
      for (var key in changeItems) {
        var element = document.querySelector("[change=" + changeName + "]");

        try {
          var wrapper = document.createElement("div");
          element.parentNode.insertBefore(wrapper, element);
          wrapper.style.background = "black";
          wrapper.appendChild(element);
          var caption = document.createElement("div");
          // caption.style.background = "red";
          caption.style.color = "white";
          caption.innerHTML = changeItems[key];
          wrapper.appendChild(caption);
        } catch (err) {
          console.log("captions");
          console.log(element);
          console.log(err);
        }
      }
    }
  };

  chatInit = function() {
    var chatButtonSrc = "<div id='voice_active_banner'>aify</div>";
    $("body").append(chatButtonSrc);
  };
}

window.aifyjs = aify;

export default aifyjs;
