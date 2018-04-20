$(function() {

    var oBtnAddToCard = {
        // Constants

        // Variables
        sClassAdded: 'added_to_cart',

        //DOM-elements
        oBody: $('body'),

        init: function() {

            this.oBody.on('click', '.j_add_cart', function() {
                var oBtn = $(this),
                    sSuccessText = oBtn.attr('data-success-text'),
                    oHref = $(this).attr('data-href'),
                    sQuery = oHref.slice(oHref.indexOf('?')+1),
                    sUrl = '/ajax/';

                if (oBtn.hasClass(oBtnAddToCard.sClassAdded)) {
                    oBtn.closest('a').trigger('click');
                    return;
                }

                $.ajax({
                    url: sUrl,
                    type: 'POST',
                    data: sQuery,
                    dataType: 'json',
                    success: function (oResponse) {

                        if (oResponse.status === 'ok') {
                            oBtn.addClass(oBtnAddToCard.sClassAdded);
                            oBtn.parent().find('p').html(sSuccessText);

                            if (oResponse.data.cart_line) {
                                var oCart = $('.personal-nav-cart-counter p'),
                                    iNumItems = +oCart.text()+1;
                                oCart.html(iNumItems);
                            }
                        }
                    }
                });

                return false;
            });

        }
    };

    oBtnAddToCard.init();
});