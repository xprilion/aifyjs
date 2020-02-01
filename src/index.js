// var $ = require("jquery");
import "./index.css";

var baseUrl = "https://568bd7cf.ngrok.io/api";
// var baseUrl = "https://900476bd.ngrok.io/api";

class aify {
  constructor() {
    var $ = window.$;
    var jQuery = window.jQuery;

    this.html = $("html").html();

    this.linksList = [];
    this.imageList = [];
    this.formList = [];

    this.pageSummary = false;

    var self = this;

    var voiceActive = false;

    var dblClickCount = 0;

    self.updateLinksList();
    self.updateImageList();
    self.updateFormList();

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

    $(document).keydown(function(e) {
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
        if (response.data.summary != "0") {
          self.pageSummary = response.data.summary;
        }
      }
    });
  }

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
        console.log("Matched Intent: " + res);
        // speechSynthesis.speak(new SpeechSynthesisUtterance(res));
        switch (res) {
          case "PageInfo":
            self.describePage();
            break;

          case "PageSummary":
            self.readSummary();
            break;

          case "PageLinks":
            self.getPageLinks();
            break;

          case "FocusLink":
            var linkid = data.queryResult.parameters.linkId;
            self.focusLink(linkid);
            break;

          case "FollowLink":
            var linkid = data.queryResult.parameters.linkId;
            self.followLink(linkid);
            break;

          case "PageImages":
            self.getImages();
            break;

          case "FocusImage":
            var imgid = data.queryResult.parameters.imageId;
            self.focusImage(imgid);
            break;

          case "AllFormItems":
            self.getForms();
            break;

          case "DescribeItem":
            self.describeItem();
            break;

          case "ClickItem":
            self.clickItem();
            break;

          default:
        }
      },
      error: function() {
        console.log("Internal Server Error");
      }
    });
  };

  focusLink = function(x) {
    var self = this;
    document.links.item(x).focus();
  };

  focusImage = function(x) {
    var self = this;
    document.images.item(x).focus();
  };

  clickItem = function() {
    var el = document.activeElement;
    var ev = document.createEvent("Events");
    ev.initEvent("keypress", true, true);
    ev.keyCode = 13;
    ev.which = 13;
    ev.charCode = 13;
    ev.key = "Enter";
    ev.code = "Enter";
    el.dispatchEvent(ev);
  };

  describeItem = function() {
    var self = this;
    var el = document.activeElement;
    var tag = $(el)
      .prop("tagName")
      .toLowerCase();

    var description = "";
    if (tag == "a") {
      description += "This is a link item ";
      if ($(el).text().length > 0) {
        description += ", it contains the text - " + $(el).text() + " ";
      }
      description += "and points to " + $(el).prop("href") + ".";

      if ($(el).children("img").length > 0) {
        description += " It contains an image ";
        var el2 = $(el).children("img")[0];
        if ($(el2).prop("alt").length > 0) {
          description +=
            ", with an alternate text reading - " + $(el2).prop("alt") + " ";
        }
      }
    } else if (tag == "li") {
      description += "This is a list item ";
      if ($(el).text().length > 0) {
        description += ", it contains the text - " + $(el).text() + " ";
      }
    } else if (tag == "img") {
      description += "This is an image item ";
      if ($(el).prop("alt").length > 0) {
        description +=
          ", it has an alternate text reading - " + $(el).prop("alt") + " ";
      }
    } else {
      description += "This is an element of tag " + tag;
    }

    self.speak(description);
  };

  describePage = function() {
    var self = this;
    // Title
    self.speak("The title of this page is: " + document.title);

    // Links, images and forms
    self.speak(
      "This page has " +
        self.linksList.length +
        " links, " +
        self.imageList.length +
        " images and " +
        self.formList.length +
        " forms on it."
    );

    // Summary
    if (self.pageSummary) {
      self.speak(
        "We have a summary available for this page. You can listen to it by using the Page Summary voice command."
      );
    }
  };

  readSummary = function() {
    var self = this;
    self.speak(self.pageSummary);
  };

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
                self.labelchanges[i].changes = previousValue;
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
                console.log("Previous value: " + previousValue);
                self.captionchanges[i].changes = previousValue;
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

        self.updateImageList();
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
          caption.innerHTML =
            element.getAttribute("aify-caption") +
            element.getAttribute("aify-ocr");
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
    self.linksList = [];
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

    var speech = "";

    speech += "The links on this page are - ";

    for (var i = 0; i < linklist.length; i++) {
      speech += "Link number " + i + " - " + linklist[i].text + ", ";
    }

    self.speak(speech);
  };

  followLink = function(linkId) {
    var self = this;
    self.speak("Opening link number " + linkId);
    var element = document.querySelector("[linkid='" + linkId + "']").click();
  };

  updateImageList = function() {
    var self = this;
    self.imageList = [];

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

    var speech = "";

    speech += "The images on this page are - ";

    for (var i = 0; i < imglist.length; i++) {
      speech += "Image number " + i + " - " + imglist[i].alt + ", ";
    }

    self.speak(speech);
  };

  updateFormList = function() {
    var self = this;
    self.formList = [];

    var forms = document.forms;
    for (var i = 0; i < forms.length; i++) {
      forms[i].setAttribute("formid", i);
      console.log(forms[i]);
      self.formList.push(forms[i]);
    }
  };

  getForms = function() {
    var self = this;
    var formlist = self.formList;

    var speech = "";

    speech += "The forms on this page are - ";

    for (var i = 0; i < formlist.length; i++) {
      speech += "Form number " + i + " - " + formlist[i].name + ", ";
    }

    self.speak(speech);
  };
}

window.aifyjs = aify;

export default aifyjs;
