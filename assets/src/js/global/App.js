if (window.CP === undefined) {
    window.CP = {};
}

window.CP.Products = {};
window.CP.Cart = {};
window.CP.Order = {};

window.MediaCheck = {
    Mobile: window.matchMedia('(max-width: 900px)'),
    Tablet: window.matchMedia('(min-width: 901px) and (max-width: 1200px)'),
    Desktop: window.matchMedia('(min-width: 1201px)')
};


Number.prototype.formatMoney = function(c, d, t){
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 0 : c,
        d = d == undefined ? "," : d,
        t = t == undefined ? " " : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

(function( $ ) {

    var methods = {

        init: function (options) {
            var $this = $(this),
                sLoader = '',
                oLoaderParam,
                oPageLoader = $this.data('pageLoader'),
                aLoaderParams = [{
                    grad: 0,
                    r: 2.88852,
                    begin: 0
                }, {
                    grad: 45,
                    r: 2.11179,
                    begin: '0.125s'
                }, {
                    grad: 90,
                    r: 0.622049,
                    begin: '0.25s'
                }, {
                    grad: 135,
                    r: 0,
                    begin: '0.375s'
                }, {
                    grad: 180,
                    r: 0,
                    begin: '0.5s'
                }, {
                    grad: 225,
                    r: 0,
                    begin: '0.625s'
                }, {
                    grad: 270,
                    r: 0.560079,
                    begin: '0.75s'
                }, {
                    grad: 315,
                    r: 1.81128,
                    begin: '0.875s'
                }, {
                    grad: 180,
                    r: 0,
                    begin: '0.5s'
                }
                ];

            sLoader += '<div class="page-loader-overlay">';
            sLoader += '<svg class="page-loader__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64" fill="#333">';
            for (var iKey in aLoaderParams) {
                if (!aLoaderParams.hasOwnProperty(iKey)) {
                    continue;
                }

                oLoaderParam = aLoaderParams[iKey];

                sLoader += '<circle transform="rotate('+ oLoaderParam.grad +' 16 16)" cx="16" cy="3" r="'+ oLoaderParam.r +'">';
                sLoader += '<animate attributeName="r" values="0;3;0;0" dur="1s" repeatCount="indefinite" begin="'+ oLoaderParam.begin +'" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" calcMode="spline"/>';
                sLoader += '</circle>';
            }
            sLoader += '</svg>';
            sLoader += '</div>';

            if (!oPageLoader) {
                $this.data('pageLoader', {
                    loader: $(sLoader)
                });
            }
        },

        destroy: function () {
            var $this = $(this),
                oPageLoader = $this.data('pageLoader');

            $(window).unbind('.pageLoader');
            if (oPageLoader) {
                oPageLoader.loader.remove();
            }
            $this.removeData('pageLoader');
        },

        show: function () {
            var $this = $(this),
                oPageLoader = $this.data('pageLoader');

            $this.append(oPageLoader.loader);
            oPageLoader.loader.fadeIn('fast');
        },

        hide: function () {
            var oPageLoader = $(this).data('pageLoader');
            oPageLoader.loader.fadeOut('slow');
        }

    };

    $.fn.pageLoader = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Метод с именем ' +  method + ' не существует для jQuery.pageLoader' );
        }
    };

    $('body').pageLoader();

})( jQuery );