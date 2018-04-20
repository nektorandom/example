$(function() {

    // window.CP = {};

    var oSmartFilter = {
        // Constants
        // componentPath: CP.Products.Catalog.componentPath,
        //SECTION_PAGE_URL: CP.Products.Catalog.sectionPageUrl,
        SECTION_CODE: $('#SECTION_CODE').val(),

        // Variables
        sHref: window.location.href,
        sHrefOrigin: window.location.origin,
        sHrefPathName: window.location.pathname,
        sHrefSearch: window.location.search,
        sClassFilterOpened: 'filters_showed',
        sClassStop: 'stopped',
        sClassDisabled: 'filter-disabled',
        iRangeMin: 0,
        iRangeMax: 0,
        aProperties: [],

        //DOM-elements
        oBody: $('body'),
        oFilterWrapper: $('.j_smart_filter_wrapper'),
        oProductsWrapper: $('.j_product_list'),
        oForm: $('.j_smart_filter_form'),
        oPropertiesGroup: $('.j_smart_filter_form .j_drop_down'),

        oInputsFilter: $('.j_smart_filter'),
        oPaginationWrapper: $('.j_catalog_pagination nav'),
        oShowMoreWrapper: $('.j_show__morecatalog_pagination'),
        oChosenFilterWrapper: $('.j_filter_chosen_items'),
        oShowMoreBtn: $('.j_catalog_show_more'),
        oFilterClearBtn: $('.j_filter_clear'),
        oFilterApplyBtn: $('.j_apply_filter'),

        oShowMobFilterBtn: $('.j_show_mob_filter'),
        oCloseMobFilterBtn: $('.j_close_mob_filter'),

        oRangeSlider: $('.j_range_slider_filter'),
        oRangeMin: $('.j_range_filter_min'),
        oRangeMax: $('.j_range_filter_max'),

        oInputCostMin: $('.j_filter_cost_min'),
        oInputCostMax: $('.j_filter_cost_max'),

        oMobileSort: $('.j_mobile_sort'),

        init: function() {

            this.initSpinner();
            this.updateFilterValues();

            this.oInputsFilter.parent().on('click touch', function () {

                if (MediaCheck.Mobile.matches) {
                    $(this).find('label').trigger('click');
                }
            });

            this.oMobileSort.on('click touch', function () {
                $(this).parent().trigger('submit');
            });


            this.oInputsFilter.on('change', function() {
                if (MediaCheck.Mobile.matches || $(this).hasClass(oSmartFilter.sClassDisabled)) {

                    oSmartFilter.updateFilterValues();
                    return false;
                }

                oSmartFilter.applyFilter();
            });

            this.oFilterApplyBtn.on('click', function() {
                oSmartFilter.applyFilter();
                oSmartFilter.oCloseMobFilterBtn.trigger('click');
            });

            this.oChosenFilterWrapper.on('click', '.j_filter_chosen_item', function() {
                oSmartFilter.removeChosen($(this));
                oSmartFilter.applyFilter();

                if (oSmartFilter.oChosenFilterWrapper.find('.j_filter_chosen_item').length === 0) {

                    if (!MediaCheck.Mobile.matches) {
                        oSmartFilter.oFilterClearBtn.hide();
                    }
                }
            });

            this.oFilterClearBtn.on('click', function() {
                oSmartFilter.oBody.pageLoader('show');

                oSmartFilter.changeAllInputs(false);
                oSmartFilter.applyFilter();

                if (!MediaCheck.Mobile.matches) {
                    oSmartFilter.oFilterClearBtn.hide();
                }

                oSmartFilter.oBody.pageLoader('hide');
            });

            $('body').on('click', '.j_catalog_show_more', function() {
                var oBtn = $(this),
                    iPageNumber = parseInt(oBtn.attr('data-page')) + 1,
                    sUrl = window.location.href,
                    sData = 'bxajaxid=' + CP.Products.Catalog.ajaxId + '&action=showMore',
                    sNewHref = sUrl;

                oSmartFilter.oBody.pageLoader('show');

                if (sUrl.indexOf('page-') !== -1) {
                    sUrl = sUrl.substr(0, sUrl.indexOf('page-'));

                    sNewHref = sUrl;
                }
                sUrl += 'page-' + iPageNumber + '/';


                $.ajax({
                    url: sUrl,
                    data: sData,
                    type: 'GET',
                    dataType: 'json',
                    async: false,
                    success: function(oResponse) {
                        oSmartFilter.oProductsWrapper.append(oResponse.items);
                        oSmartFilter.oPaginationWrapper.html(oResponse.pagination);

                        if (oResponse.amount < 12) {
                            oSmartFilter.oShowMoreBtn.hide();
                        } else {
                            oBtn.attr('data-page', iPageNumber);
                            oSmartFilter.oShowMoreBtn.show();
                        }

                        sNewHref = sUrl + oSmartFilter.sHrefSearch;
                        window.history.pushState(null, '', sNewHref);

                        oSmartFilter.oBody.pageLoader('hide');
                    }
                });

            });


            this.oShowMobFilterBtn.on('click', function() {
                oSmartFilter.oFilterWrapper.addClass(oSmartFilter.sClassFilterOpened);
                oSmartFilter.oBody.addClass(oSmartFilter.sClassStop);
            });

            this.oCloseMobFilterBtn.on('click', function() {
                oSmartFilter.oFilterWrapper.removeClass(oSmartFilter.sClassFilterOpened);
                oSmartFilter.oBody.removeClass(oSmartFilter.sClassStop);
            });

        },

        initSpinner: function() {
            oSmartFilter.iRangeMin = parseInt(oSmartFilter.oRangeMin.text());
            oSmartFilter.iRangeMax = parseInt(oSmartFilter.oRangeMax.text());

            oSmartFilter.oRangeSlider.slider({
                range: true,
                min: oSmartFilter.iRangeMin,
                max: oSmartFilter.iRangeMax,
                //TODO:: fix change max in slider because of step
                // step: 250,
                step: 1,
                values: [oSmartFilter.iRangeMin, oSmartFilter.iRangeMax],
                create: function() {
                    oSmartFilter.setSpinnerRangeValues(oSmartFilter.iRangeMin, oSmartFilter.iRangeMax);
                },
                slide: function(event, ui) {
                    oSmartFilter.setSpinnerRangeValues(ui.values[0], ui.values[1]);
                },
                stop: function(event, ui) {
                    oSmartFilter.setInputCostValues(ui.values[0], ui.values[1]);
                    oSmartFilter.applyFilter();
                }
            });
        },

        setSpinnerRangeValues: function(iMin, iMax) {
            oSmartFilter.oRangeMin.text(iMin.formatMoney(0));
            oSmartFilter.oRangeMax.text(iMax.formatMoney(0));
        },

        setInputCostValues: function(iMin, iMax) {
            oSmartFilter.oInputCostMin.val(iMin);
            oSmartFilter.oInputCostMax.val(iMax);
            oSmartFilter.changeInputsCostChecked(true, iMin, iMax);
        },

        changeInputsCostChecked: function(bChecked, iMin, iMax) {

            if (iMax !== oSmartFilter.iRangeMax && bChecked === true) {
                oSmartFilter.oInputCostMax.prop('checked', bChecked);
            } else {
                oSmartFilter.oInputCostMax.prop('checked', bChecked);
                oSmartFilter.oInputCostMin.prop('checked', bChecked);
            }

            if (iMin !== oSmartFilter.iRangeMin) {
                oSmartFilter.oInputCostMin.prop('checked', bChecked);
            } else {
                oSmartFilter.oInputCostMax.prop('checked', bChecked);
                oSmartFilter.oInputCostMin.prop('checked', bChecked);
            }
        },

        applyFilter: function () {
            var sUrl = oSmartFilter.SECTION_CODE,
                sData = oSmartFilter.oForm.serialize(),
                sNewHref;


            oSmartFilter.oBody.pageLoader('show');

            if (sData.length > 0) {
                sData += '&set_filter=Y';
            } else {
                sData += 'set_filter=N';
            }
            sData += '&bxajaxid=' + CP.Products.Catalog.ajaxId + '&action=showMore';

            $.ajax({
                url: oSmartFilter.SECTION_CODE,
                data: sData,
                type: 'GET',
                dataType: 'json',
                async: false,
                success: function(oResponse) {

                    oSmartFilter.oProductsWrapper.html(oResponse.items);
                    oSmartFilter.oPaginationWrapper.html(oResponse.pagination);
                    oSmartFilter.oShowMoreWrapper.empty();
                    oSmartFilter.oShowMoreWrapper.html(oResponse.show_more);

                    if (oResponse.amount < 12) {
                        oSmartFilter.oShowMoreBtn.hide();
                    } else {
                        oSmartFilter.oShowMoreBtn.show();
                    }

                    // add filter close
                    oSmartFilter.drawChosenItems();
                    oSmartFilter.oFilterClearBtn.show();

                    // upd urls
                    sNewHref = CP.Products.Catalog.sectionPageUrl + oResponse.filter_url + oSmartFilter.sHrefSearch;
                    window.history.pushState(null, '', sNewHref);

                    // Upd SEO
                    $('meta[name=robots]').attr('content', oResponse.robots);
                }
            });

            oSmartFilter.updateFilterValues();

            oSmartFilter.oBody.pageLoader('hide');
        },

        updateFilterValues: function() {
            var aValues;

            aValues = oSmartFilter.preparePropertiesForAjax();
            oSmartFilter.getFilterValues(aValues);
        },

        preparePropertiesForAjax: function() {
            var iIndex = 0,
                aValues = [],
                sName,
                sValue;

            aValues[iIndex] = {name: 'ajax', value: 'y'};

            oSmartFilter.oForm.find('input').each(function(index, element) {
                if ($(element).prop('checked') === false && $(element).attr('type') !== 'hidden') {
                    return;
                }

                iIndex += 1;
                sName = $(element).attr('name');
                sValue = $(element).val();
                aValues[iIndex] = {name: sName, value: sValue};
            });

            return aValues;
        },

        getFilterValues: function(aValues) {

            $.ajax({
                url: oSmartFilter.SECTION_CODE,
                data: aValues,
                type: 'GET',
                dataType: 'json',
                async: false,
                success: function(oResponse) {
                    oSmartFilter.refreshPropertyValues(oResponse.result.ITEMS);

                    if (MediaCheck.Mobile.matches) {
                        oSmartFilter.oFilterApplyBtn.html('Показать (' + parseInt(oResponse.result.ELEMENT_COUNT) + ')');
                    }
                }
            });
        },

        refreshPropertyValues: function(oItems) {
            var oInput;

            $.each(oItems, function(index, element) {

                if (element.PROPERTY_TYPE !== 'L' && element.CODE === 'BASE' || !element.VALUES) {
                    return;
                }

                $.each(element.VALUES, function(index, element) {

                    oInput = $('input[name=' + element.CONTROL_ID + ']');

                    if (!element.DISABLED) {
                        oInput.removeClass(oSmartFilter.sClassDisabled).prop('disabled', false);
                        oInput.parent().removeClass(oSmartFilter.sClassDisabled);
                    } else {
                        oInput.addClass(oSmartFilter.sClassDisabled).prop('disabled', true);
                        oInput.parent().addClass(oSmartFilter.sClassDisabled);
                    }
                });
            });
        },

        removeChosen: function(oChosenItem) {
            var sCodeGroup = oChosenItem.attr('data-group');

            oChosenItem.remove();

            oSmartFilter.oPropertiesGroup.each(function (index, element) {

                if ($(element).attr('data-code-group') === sCodeGroup) {

                    $(element).find('input').each(function(index, element) {
                        $(element).prop('checked', false);
                    });
                }
            });
        },

        changeAllInputs: function(bChecked) {
            oSmartFilter.oInputsFilter.each(function(index, element) {
                $(element).prop('checked', bChecked);
            });

            oSmartFilter.changeInputsCostChecked(bChecked);
        },

        drawChosenItems: function() {
            var aCheckedInputsName,
                sCodeGroup,
                oLabelGroup;


            oSmartFilter.oPropertiesGroup.each(function(index, element) {
                aCheckedInputsName = [];

                sCodeGroup = $(element).attr('data-code-group');
                oLabelGroup = $('[data-label-' + sCodeGroup + ']');
                aCheckedInputsName = oSmartFilter.getCheckedInputs(aCheckedInputsName, sCodeGroup, element);

                oSmartFilter.drawLabelGroup(sCodeGroup, aCheckedInputsName);
            });
        },

        getCheckedInputs: function(aCheckedInputsName, sCodeGroup, oElement) {

            if (sCodeGroup === 'RANGE') {
                return aCheckedInputsName = oSmartFilter.getCheckedInputsByCost(aCheckedInputsName, oElement);
            }

            return aCheckedInputsName = oSmartFilter.getCheckedInputsByOtherProperties(aCheckedInputsName, oElement);
        },

        getCheckedInputsByCost: function(aCheckedInputsName, oElement) {

            $(oElement).find('.j_drop_down_list input').each(function (index, element) {

                if ($(element).prop('checked')) {
                    aCheckedInputsName.push($(element).val());
                }
            });

            return aCheckedInputsName;
        },

        getCheckedInputsByOtherProperties: function(aCheckedInputsName, oElement) {

            $(oElement).find('.j_drop_down_list input').each(function (index, element) {

                if ($(element).prop('checked')) {
                    aCheckedInputsName.push($(element).attr('data-name'));
                }
            });

            return aCheckedInputsName;
        },

        drawLabelGroup: function(sCodeGroup, aCheckedInputsName) {
            var oLabelGroup = $('[data-label-' + sCodeGroup + ']'),
                sLabelInner = '';


            if (aCheckedInputsName.length === 0) {
                oLabelGroup.remove();
                return;
            }

            if (sCodeGroup === 'RANGE') {
                sLabelInner = oSmartFilter.shapeLabelInnerCost(sLabelInner, aCheckedInputsName);
            } else {
                sLabelInner = oSmartFilter.shapeLabelInnerOthers(sLabelInner, aCheckedInputsName);
            }

            if (oLabelGroup.length === 0) {
                oSmartFilter.drawLabelDom(sCodeGroup, sLabelInner);
            } else {
                oLabelGroup.find('.type__text').html(sLabelInner);
            }
        },

        shapeLabelInnerCost: function(sLabelInner, aCheckedInputsName) {
            sLabelInner += 'Цена от ' +
                parseInt(aCheckedInputsName[0]).formatMoney(0) +
                ' до ' +
                parseInt(aCheckedInputsName[1]).formatMoney(0);

            return sLabelInner;
        },

        shapeLabelInnerOthers: function (sLabelInner, aCheckedInputsName) {
            if (aCheckedInputsName.length === 1) {
                sLabelInner = aCheckedInputsName[0];
            } else {

                $.each(aCheckedInputsName, function(index, element) {
                    sLabelInner += element;

                    if (aCheckedInputsName.length -1 > index) {
                        sLabelInner += ' + ';
                    }
                });
            }

            return sLabelInner;
        },

        drawLabelDom: function(sCodeGroup, sLabelInner) {
            var sLabel = '';

            sLabel += '<div class="type j_filter_chosen_item" data-label-' + sCodeGroup +' data-group="' + sCodeGroup + '">' +
                '<div class="type__text">' + sLabelInner + '</div>' +
                '</div>';

            oSmartFilter.oChosenFilterWrapper.prepend(sLabel);
        }

    };

    oSmartFilter.init();
});
