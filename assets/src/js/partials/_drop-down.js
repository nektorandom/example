$(document).ready(function() {

    var oDropDown = {
        // Constants

        // Variables
        sClassOpened: 'dropdown_opened',
        iTimeOut: 0,
        mediaCheckMobile: window.matchMedia('(max-width: 540px)'),
        mediaCheckTablet: window.matchMedia('(min-width: 541px) and (max-width: 900px)'),
        mediaCheckDesktop: window.matchMedia('(min-width: 901px)'),

        //DOM-elements
        oDropDownWrapper: $('.j_drop_down'),
        oDropDownListWrapper: $('.j_drop_down_list'),


        init: function() {

            this.oDropDownListWrapper.on('click', function (e) {
                e.stopPropagation();
            });

            this.oDropDownWrapper.on('click', function (e) {
                e.stopPropagation();
                var oThisDropDown = $(this),
                    oOthersDropDown = oDropDown.oDropDownWrapper.not(this);

                oOthersDropDown.removeClass(oDropDown.sClassOpened);
                oOthersDropDown.find('.dropdown__list').slideUp(250);

                if (oThisDropDown.hasClass(oDropDown.sClassOpened)) {
                    oThisDropDown.removeClass(oDropDown.sClassOpened);
                    oThisDropDown.find('.dropdown__list').slideUp(250);
                } else {
                    oThisDropDown.addClass(oDropDown.sClassOpened);
                    oThisDropDown.find('.dropdown__list').slideDown(250);
                }

            });

            this.oDropDownListWrapper.on('mouseleave', function() {
                if (!oDropDown.mediaCheckDesktop.matches) {
                    return false;
                }

                clearTimeout(oDropDown.iTimeOut);
                var oThis = $(this);

                oDropDown.iTimeOut = setTimeout(function() {
                    oThis.parent().removeClass(oDropDown.sClassOpened);
                    oThis.slideUp(250);
                }, 500);
            });

            this.oDropDownListWrapper.on('mouseenter', function() {
                if (!oDropDown.mediaCheckDesktop.matches) {
                    return false;
                }

                clearTimeout(oDropDown.iTimeOut);
            });

            $(document.body).click( function() {
                oDropDown.oDropDownWrapper.removeClass(oDropDown.sClassOpened);
                oDropDown.oDropDownListWrapper.slideUp(250);
            });
        }
    };

    oDropDown.init();
});
