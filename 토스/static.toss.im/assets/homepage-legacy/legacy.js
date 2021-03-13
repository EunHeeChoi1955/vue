'use strict';

// ScrollReveal Default Settings
window.sr = ScrollReveal({
  duration: 700,
  scale: 1,
  distance: '50px',
  easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
});

/* eslint-disable */
$(document).ready(function() {
  var isEng = $('html').attr('lang') === 'en' || location.pathname === '/en';

  function ajax(url, onLoad) {
    var xhr = XMLHttpRequest != null ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('get', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          onLoad(JSON.parse(xhr.responseText));
        } catch (err) {
          console.log(`xhr: ${JSON.stringify(xhr.responseText)}`)
          throw err;
        }
      }
    };
    xhr.send();
  }

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  ajax('https://service.toss.im/storage/homepage/analytics.json?v=2', function (data) {
    var key = isEng ? 'en' : 'ko';

    var usage = document.getElementById('usage');
    var securityAlert = document.getElementById('security-alert');
    var updateDate = document.getElementById('record-date');

    usage.innerHTML = data.usage[key];
    securityAlert.innerHTML = data.securityAlert[key];
    updateDate.innerHTML = data.recordAt[key];

    // Toss 기록 카운트
    sr.reveal(
      '.records',
      {
        distance: '50px',
        reset: true,
        beforeReveal: function() {
          var target = document.getElementById('user');
          var target2 = document.getElementById('transaction');

          var opts = { useEasing: true, separator: ',', suffix: isEng ? ' million' : '만' };
          var opts2 = { useEasing: true, suffix: isEng ? ' trillion' : '조 원' };

          var numAnim = new CountUp(target, 0, data.downloads[key], 0, 2.5, opts);
          var numAnim2 = new CountUp(target2, 0, data.transfer[key], 0, 2, opts2);

          countStart(numAnim);
          countStart(numAnim2);
        },
      },
      100
    );
  });

  /** 초기 페이지 스크롤 */
  var pageNum = getParameterByName('page'); // ex: https://toss.im/?page=0
  var target = document.querySelector('.p' + pageNum);

  var duration = 1000;
  var targetScrollTop = 0;
  if (target != null) {
    targetScrollTop = target.getBoundingClientRect().top;
  }

  if (window.innerWidth <= 768) {
    targetScrollTop -= 80;
    duration = 0;
  }

  if (target !== undefined && targetScrollTop !== 0) {
    $('html, body')
      .stop()
      .animate({ scrollTop: targetScrollTop }, duration, 'swing');
  }

  /** ScrollReveal 애니메이션 */
  // ScrollReveal Browser Support 확인 후 실행
  if (sr.isSupported()) {
    setScrollReveal();
  }

  makeSlider('#transfer');
  makeSlider('.p4');
  makeSlider('#insurance');
  makeSlider('#wallet-free');
  attachBankListEvent();

  function countStart(numAnim) {
    if (!numAnim.error) {
      numAnim.start();
    } else {
      console.error(numAnim.error);
    }
  }

  // https://sentry.io/organizations/toss/issues/1681440778 이슈 해결용
  function setScrollReveal() {
    try {
      __SENTRY__.hub.addBreadcrumb(function (scope) {
        scope.setExtra('cert_image', $('.cert_image'));
      });
    } catch {
      //
    }

    sr.reveal(
      '.cert_image',
      {
        distance: '0px',
        scale: 0.5,
        delay: 0.15,
      },
      80
    );

    sr.reveal('.psr', {
      distance: '50px',
      delay: 0.15,
    });

    sr.reveal('.particle', {
      distance: '300px',
      scale: 0.1,
      delay: 750,
      reset: true,
    });

    sr.reveal('.sr', {
      distance: '50px',
      delay: 0.25,
      duration: 2000,
      opacity: 1,
      reset: true,
      easing: 'cubic-bezier(0.0, 0.5, 0.2, 0.8)',
    });

    sr.reveal('.txtsr', {
      delay: 0.1,
      distance: '30px',
      viewFactor: 0.8,
    });

    sr.reveal('.cert', {
      distance: '60px',
      delay: 0.25,
      viewFactor: 0.8,
    });

    sr.reveal('.p7 .logos', {
      distance: '20px',
      delay: 0.25,
      viewFactor: 0.8,
    });

    sr.reveal('.btn-pay', {
      delay: 0.5,
      scale: 0.5,
      distance: '0px',
      duration: 500,
    });

    sr.reveal('.button', {
      delay: 0.1,
      viewFactor: 0.8,
      scale: 0.5,
      distance: '0px',
      duration: 500,
    });

    sr.reveal('.tosscard-plcc-background', {
      delay: 0.25,
      opacity: 1,
      duration: 1500,
    });

    sr.reveal('.tosscard-plcc-text-button', {
      delay: 0.1,
      viewFactor: 0.8,
      scale: 0.5,
      distance: '0px',
      duration: 500,
    });

    sr.reveal(
      '.store-list .item',
      {
        origin: 'right',
        viewFactor: 1,
        distance: '80px',
        scale: 0.8,
        reset: true,
      },
      50
    );

    // 은행 숫자 카운트
    var bankBalances = [2134000, 1126600, 684000, 339050, 1412000];
    var order = 0;

    sr.reveal(
      '.banks .item',
      {
        duration: 750,
        origin: 'right',
        viewFactor: 0.4,
        distance: '70px',
        reset: true,
        beforeReset: function() {
          order = 0;
        },
        beforeReveal: function(dom) {
          var opts = { useEasing: true, separator: ',' };

          if (isEng) {
            opts.prefix = '₩ ';
          } else {
            opts.suffix = '원';
          }

          // Cell 자식 선택 '.text'
          var _cellChild = dom.children[1] ? dom.children[1] : undefined;
          // balance 선택 '.balance'
          var _balance = _cellChild ? _cellChild.children[1] : undefined;

          // CountUp
          if (_balance !== undefined) {
            var numAnim = new CountUp(_balance, 0, bankBalances[order], 0, 2, opts);
            countStart(numAnim);
            order++;
          } else {
            console.error('DOM 선택이 잘 못 되었습니다.');
          }
        },
      },
      120
    );

    // 카드 숫자 카운트
    var cardTotalBalance = 2237000;
    var cardBalances = [836800, 432200, 968000];
    var cardOrder = 0;

    sr.reveal('.cards .badge', {
      duration: 750,
      origin: 'left',
      viewFactor: 0.4,
      distance: '70px',
      reset: true,
    });

    sr.reveal('.cards .total', {
      duration: 750,
      origin: 'left',
      viewFactor: 0.4,
      distance: '70px',
      reset: true,
      beforeReveal: function(dom) {
        var opts = { useEasing: true, separator: ',' };

        if (isEng) {
          opts.prefix = '₩ ';
        } else {
          opts.suffix = '원';
        }

        var numAnim = new CountUp(dom, 0, cardTotalBalance, 0, 2, opts);
        countStart(numAnim);
      },
    });

    sr.reveal(
      '.cards .item',
      {
        duration: 750,
        origin: 'left',
        viewFactor: 0.4,
        distance: '70px',
        reset: true,
        beforeReset: function() {
          cardOrder = 0;
        },
        beforeReveal: function(dom) {
          var opts = { useEasing: true, separator: ',' };
          if (isEng) {
            opts.prefix = '₩ ';
          } else {
            opts.suffix = '원';
          }

          // Cell 자식 선택 '.text'
          var _cellChild = dom.children[1] ? dom.children[1] : undefined;
          // balance 선택 '.balance'
          var _balance = _cellChild ? _cellChild.children[1] : undefined;

          // CountUp
          if (_balance !== undefined) {
            var numAnim = new CountUp(_balance, 0, cardBalances[cardOrder], 0, 2, opts);
            countStart(numAnim);
            cardOrder++;
          } else {
            console.error('DOM 선택이 잘 못 되었습니다.');
          }
        },
      },
      120
    );
  }

  function makeSlider(pageSelector) {
    var items = $(pageSelector + ' .features .item');
    var screens = $(pageSelector + ' .screens .item');
    var descs = $(pageSelector + ' .desc .con');
    var links = $(pageSelector + ' .links .link');

    items.each(function(i, item) {
      $(item).on('click', function() {
        var activeItem = $(pageSelector + ' .features .item.active');
        var activeScreen = $(pageSelector + ' .screens .item.active');

        screens.each(function(i, screen) {
          $(screen).removeClass('active');
          $(screen).css('z-index', '1');
        });

        descs.each(function(i, desc) {
          $(desc).removeClass('active');
        });

        links.each(function(i, link) {
          $(link).removeClass('active');
        });

        if (activeScreen) {
          activeScreen.css('z-index', '2');
        }
        if (activeItem) {
          activeItem.removeClass('active');
        }

        $(this).addClass('active');
        $(screens[i]).addClass('active');
        $(screens[i]).css('z-index', '3');
        $(descs[i]).addClass('active');
        $(links[i]).addClass('active');
      });
    });
  }

  function attachBankListEvent() {
    var _banklistButton = $('#show-banklist-button');
    var _banklist = $('#banklist');

    var clicked = false;
    var originText = _banklistButton.text();
    _banklistButton.on('click', function() {
      var offset = $(this).offset().top;

      if (clicked) {
        _banklist.removeClass('show');
        _banklist.addClass('hide');
        this.innerText = originText;

        _banklist.one('animationend', function() {
          _banklist.css('height', undefined);
        });

        if (_banklist.css('animation-name') == undefined) {
          _banklist.css('height', '0px');
        }
      } else {
        _banklist.removeClass('hide');
        _banklist.addClass('show');
        this.innerText = '닫기';

        $('html, body')
          .stop()
          .animate({ scrollTop: offset - parseInt(window.innerHeight * 0.15, 10) }, 700, 'swing');

        if (_banklist.css('animation-name') == undefined) {
          _banklist.css('height', '570px');
        }
      }

      clicked = !clicked;
    });
  }
});
