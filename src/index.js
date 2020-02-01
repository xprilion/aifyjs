// var $ = require("jquery");
// import "./index.css";

var baseUrl = "https://568bd7cf.ngrok.io/api";
// var baseUrl = "https://8b5766f9.ngrok.io/api";
class aify {
  constructor() {
    var $ = window.$;
    var jQuery = window.jQuery;

    this.html = $("html").html();

    this.linksList = [];
    this.imageList = [];
    this.fieldList = [];

    this.pageSummary = "";

    var self = this;

    var voiceActive = false;

    var dblClickCount = 0;

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
      this.goDialogFlow(finalTranscript);

      finalTranscript = "";

      recognition.stop();
      voiceActive = false;
    };

    $("body").dblclick(function() {
      dblClickCount++;
      if (dblClickCount > 1) {
        console.log("Voice input started");
        recognition.stop();
        self.speak("Speak command: ");
        recognition.start();
        voiceActive = true;
      } else {
        console.log("One more tap to activate chatbot...");
      }
    });

    var maxInterval = 500;
    var lastTime = 0;
    var keyCounter = 0;

    $("body").keydown(function(e) {
      if (e.which == 70) {
        keyCounter++;
        var curTime = new Date().getTime();
        if (curTime - lastTime < maxInterval && keyCounter == 3) {
          lastTime = 0;
          keyCounter = 0;
          console.log("Voice input started");
          recognition.stop();
          self.speak("Speak command: ");
          recognition.start();
          voiceActive = true;
        } else {
          lastTime = curTime;
        }
      }
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
              var previousValue = element.singleNodeValue.getAttribute(key);

              if (previousValue && previousValue.length > 0) {
                changes[i].changes = previousValue;
              }

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
              var previousValue = element.singleNodeValue.getAttribute(key);

              if (previousValue && previousValue.length > 0) {
                changes[i].changes = previousValue;
              }

              var captionText = "This image contains - ";
              var ocrText = "Text in this image contains - ";

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

  speak = function(text) {
    console.log(text);
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  updateLinksList = function() {
    var self = this;
    // var linklist = self.linksList;

    var links = document.links;
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute("linkid", i);
      console.log(links[i]);
      self.linksList.push(links[i]);
    }
  };

  getPageLinks = function() {
    var self = this;
    var linklist = self.linksList;

    self.speak("The links on this page are - ");

    for (var i = 0; i < linklist.length; i++) {
      self.speak("Link number " + i + " - " + linklist[i].href);
    }
  };

  followLink = function(linkId) {
    var self = this;
    self.speak("Opening link number " + linkId);
    var element = document.querySelector("[linkid='" + linkId + "']").click();
  };

  updateImageList = function() {
    var self = this;
    var images = document.images;
    for (var i = 0; i < images.length; i++) {
      images[i].setAttribute("imgid", i);
      console.log(images[i]);
      self.imageList.push(images[i]);
    }
  };

  getImages = function() {
    var self = this;
    var imglist = self.imageList;

    self.speak("The images on this page are - ");

    for (var i = 0; i < imglist.length; i++) {
      self.speak("Image number " + i + " - " + imglist[i].alt);
    }
  };

  goDialogFlow = function(text) {
    var self = this;
    $.ajax({
      type: "POST",
      url: "https://aifybot-jshimk.gateway.dialogflow.cloud.ushakov.co",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({
        session: "test",
        queryInput: {
          text: {
            text: text,
            languageCode: "en"
          }
        }
      }),
      success: function(data) {
        var res = data.queryResult.intent.displayName;
        // speechSynthesis.speak(new SpeechSynthesisUtterance(res));
        switch (res) {
          case "PageLinks":
            self.getPageLinks();
            break;

          case "FollowLink":
            var linkid = data.queryResult.parameters.linkId;
            self.followLink(linkid);
            break;

          case "PageImages":
            self.getImages();
            break;

          default:
        }
      },
      error: function() {
        console.log("Internal Server Error");
      }
    });
  };
}

window.aifyjs = aify;

export default aifyjs;
