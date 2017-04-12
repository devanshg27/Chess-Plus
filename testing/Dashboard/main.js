var renderChatList = function(contacts) {
  $('.contactsWrapper').empty();
  for (contact of contacts) { 
    $('.contactsWrapper').append('<div class="contact" id="' + contact.username + '"><img src="' + contact.picture + '" alt="" class="contact__photo" /><span class="contact__name">' + contact.name + '</span>' + (contact.unread > 0 ? '<span class="unreadBadge" badge-data="' + contact.unread + '"> </span>' : ' ') + '<span class="contact__status ' + (contact.online ? 'online' : ' ') + '"> </span></div>');      
  }
};

$(document).ready(function() {
  var $svg = $(".sidebar"),
      $chatBar = $(".chatBar"),
      $path = $(".s-path"),
      $sCont = $(".sidebar-content"),
      $chat = $(".chat"),
      chatBarTop = $chatBar.offset().top,
      chatBarLeft = $chatBar.offset().left,
      diffX = 0,
      curX = 0,
      finalX = 0,
      frame = 1000 / 60,
      animTime = 600,
      sContTrans = 200,
      animating = false,
      height = $(window).height();

  var startD = createD(64,0,1),
      midD = createD(125,75,0),
      finalD = createD(200,0,1),
      clickMidD = createD(300,80,0),
      clickMidDRev = createD(200,100,1),
      clickD = createD(300,0,1),
      currentPath = startD;
      $path.attr({ "d": startD });

  var resizePath = function(path) {
      if (path === undefined)
        return;
      path = path.replace(/,(\d+) 0 1,/gi, "," + (height >> 1) + " 0 1,");
      path = path.replace(/0,(\d+) L0,(\d+)/gi, "0," + height + " L0," + height);
      return path;
  }

  var updatePathHeight = function() {
    height = $(window).height();
    var d = $path.attr("d");
    $path.attr({ "d": resizePath(d) });
    startD = resizePath(startD);
    midD = resizePath(midD);
    finalD = resizePath(finalD);
    clickMidD = resizePath(clickMidD);
    clickMidDRev = resizePath(clickMidDRev);
    clickD = resizePath(clickD);
    currentPath = resizePath(currentPath);
  };

  var easings = {
    smallElastic: function(t,b,c,d) {
      var ts = (t/=d)*t;
      var tc = ts*t;
      return b + c * (33*tc*ts + -106*ts*ts + 126*tc + -67*ts + 15*t);
    },
    inCubic: function(t,b,c,d) {
      var tc = (t/=d) * t * t;
      return b + c*(tc);
    }
  };

  function createD(top, ax, dir) {
    return "M0,0 " + top + ",0 a" + ax + "," + (height>>1) + " 0 1," + dir + " 0," + height + " L0," + height;
  }

  function newD(num1, num2) {
    var d = $path.attr("d"),
        num2 = num2 || ((height>>1)).toString(),
        nd = d.replace(/\ba(\d+),(\d+)\b/gi, "a" + num1 + "," + num2);
    return nd;
  }

  function animatePathD(path, d, time, handlers, callback, easingTop, easingX) {
    var steps = Math.floor(time / frame),
        curStep = 0,
        oldArr = currentPath.split(" "),
        newArr = d.split(" "),
        oldLen = oldArr.length,
        newLen = newArr.length,
        oldTop = +oldArr[1].split(",")[0],
        topDiff = +newArr[1].split(",")[0] - oldTop,
        nextTop,
        nextX,
        easingTop = easings[easingTop] || easings.smallElastic,
        easingX = easings[easingX] || easingTop;

    $(document).off("mousedown mouseup");

    function animate() {
      curStep++;
      nextTop = easingTop(curStep, oldTop, topDiff, steps);
      nextX = easingX(curStep, curX, finalX-curX, steps);
      oldArr[1] = nextTop + ",0";
      oldArr[2] = "a" + Math.abs(nextX) + "," + (height>>1);
      oldArr[4] = (nextX >= 0) ? "1,1" : "1,0";
      $path.attr("d", oldArr.join(" "));
      if (curStep > steps) {
        curX = 0;
        diffX = 0;
        $path.attr("d", d);
        currentPath = d;
        if (handlers) handlers1();
        if (callback) callback();
        return;
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  function handlers1() {
    $(document).on("mousedown touchstart", ".s-path", function(e) {
      var startX =  e.pageX || e.originalEvent.touches[0].pageX;

      $(document).on("mousemove touchmove", function(e) {
        var x = e.pageX || e.originalEvent.touches[0].pageX;
        diffX = x - startX;
        if (diffX < 0) diffX = 0;
        if (diffX > 300) diffX = 300;
        curX = Math.floor(diffX/2);
        $path.attr("d", newD(curX));
      });
    });

    $(document).on("mouseup touchend", function() {
      $(document).off("mousemove touchmove");
      if (animating) return;
      if (!diffX) return;
      if (diffX < 40) {
        animatePathD($path, newD(0), animTime, true);
      } else {
        animatePathD($path, finalD, animTime, false, function() {
          $sCont.addClass("active");
          $('.mainContent').css({'width': 'calc(100% - 200px)', 'left': '200px'});
          $('.contactsWrapper').addClass("active");
          setTimeout(function() {
            $(document).on("click", closeSidebar);
          }, sContTrans);
        });
      }
    });
  }

  handlers1();

  function closeSidebar(e) {
    if ($(e.target).closest(".sidebar-content").length ||
        $(e.target).closest(".chat").length) return;
    if (animating) return;
    animating = true;
    $sCont.removeClass("active");
    $('.mainContent').css({'width': 'calc(100% - 64px)', 'left': '64px'});
    $('.contactsWrapper').removeClass("active");
    $chat.removeClass("active");
    $(".cloned").addClass("removed");
    finalX = -75;
    setTimeout(function() {
      animatePathD($path, midD, animTime/3, false, function() {
        $chat.hide();
        $(".cloned").remove();
        finalX = 0;
        curX = -75;
        animatePathD($path, startD, animTime/3*2, true);
        animating = false;
      }, "inCubic");
    }, sContTrans);
    $(document).off("click", closeSidebar);
  }

  function moveImage(that) {
    $('.contact__photo, .contact__status, .unreadBadge').fadeOut(300).delay(300).fadeIn(300)
    var $img = $(that).find(".contact__photo"),
        top = $img.offset().top - chatBarTop,
        left = $img.offset().left - chatBarLeft,
        $clone = $img.clone().addClass("cloned");

    $clone.css({top: top, left: left});
    $chatBar.append($clone);
    $clone.css("top");
    $clone.css({top: "1.8rem", left: "1.4rem"});
    $('.colourStatus').addClass('yes');
  }

  $(document).on("click", ".contact", function(e) {
    if (animating) return;
    $('.cloned').remove();
    animating = true;
    $(document).off("click", closeSidebar);
    var that = this,
        name = $(this).find(".contact__name").text(),
        online = $(this).find(".contact__status").hasClass("online");
    $(".chat__name").text(name);
    $('#chatbar').removeClass('isOnline');

    if (online)
      $('#chatbar').addClass('isOnline');

    $('.chat__messages').scrollTop = $('.chat__messages').scrollTop.height;
    setTimeout(function() {
      $sCont.removeClass("active");
      $('.mainContent').css({'width': 'calc(100% - 300px)', 'left': '300px'});
      $('.contactsWrapper').removeClass("active");
      moveImage(that);
      finalX = -80;
      setTimeout(function() {
        animatePathD($path, clickMidD, animTime/3, false, function() {
          curX = -80;
          finalX = 0;
          animatePathD($path, clickD, animTime*2/3, true, function() {
            $chat.show();
            $chat.css("top");
            $chat.addClass("active");
            animating = false;
            $('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
          });
        }, "inCubic"); 
      }, 200);
    }, sContTrans);
  });

  $(document).on("click", ".chat__back", function() {
    $('.cloned').remove();
    if (animating) return;
    animating = true;
    $chat.removeClass("active");
    $('.mainContent').css({'width': 'calc(100% - 200px)', 'left': '200px'});
    $(".cloned").addClass("removed");
    $('.colourStatus').removeClass('yes');
    $('.cloned').remove();
    setTimeout(function() {
      $(".cloned").remove();
      $chat.hide();
      finalX = 100;
      animatePathD($path, clickMidDRev, animTime/3, false, function() {
        curX = 100;
        finalX = 0;
        animatePathD($path, finalD, animTime*2/3, true, function() {
          $sCont.addClass("active");
          $('.contactsWrapper').addClass("active");
          $(document).on("click", closeSidebar);
          animating = false;
        });
      }, "inCubic");
    }, sContTrans);
  });

  $(window).on("resize", function() {
    chatBarTop = $chatBar.offset().top;
    chatBarLeft = $chatBar.offset().left;
    updatePathHeight();
  });

  $('.chat__input').keyup(function(e) {
    if(e.keyCode == 13) {
      var text = $.trim($('.chat__input').val());
      if (text != '') {
        $('.chat__messages').append('<div class="chat__msgRow"><div class="chat__message mine">' + text + '</div></div>');
        $('.chat__input').val('');
        $('.chat__messages').scrollTop($('.chat__messages')[0].scrollHeight);
      }
    }
  });
});