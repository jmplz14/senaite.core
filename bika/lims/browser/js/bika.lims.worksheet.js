(function() {
  /* Please use this command to compile this file into the parent `js` directory:
      coffee --no-header -w -o ../ -c bika.lims.worksheet.coffee
  */
  window.WorksheetFolderView = class WorksheetFolderView {
    constructor() {
      /*
      * Controller class for Worksheets Folder
       */
      this.load = this.load.bind(this);
      /* INITIALIZERS */
      this.bind_eventhandler = this.bind_eventhandler.bind(this);
      /* METHODS */
      this.get_template_instrument = this.get_template_instrument.bind(this);
      this.select_instrument = this.select_instrument.bind(this);
      /* EVENT HANDLER */
      this.on_template_change = this.on_template_change.bind(this);
      this.on_instrument_change = this.on_instrument_change.bind(this);
    }

    load() {
      console.debug("WorksheetFolderView::load");
      // bind the event handler to the elements
      return this.bind_eventhandler();
    }

    bind_eventhandler() {
      /*
       * Binds callbacks on elements
       *
       * N.B. We attach all the events to the form and refine the selector to
       * delegate the event: https://learn.jquery.com/events/event-delegation/
       *
       */
      console.debug("WorksheetFolderView::bind_eventhandler");
      // Template changed
      $("body").on("change", "select.template", this.on_template_change);
      // Instrument changed
      return $("body").on("change", "select.instrument", this.on_instrument_change);
    }

    get_template_instrument() {
      var input, value;
      /*
       * TODO: Refactor to get the data directly from the server
       * Returns the JSON parsed value of the HTML element with the class
         `templateinstruments`
       */
      console.debug("WorksheetFolderView::get_template_instruments");
      input = $("input.templateinstruments");
      value = input.val();
      return $.parseJSON(value);
    }

    select_instrument(instrument_uid) {
      /*
       * Select instrument by UID
       */
      var option, select;
      select = $(".instrument");
      option = select.find(`option[value='${instrument_uid}']`);
      if (option) {
        return option.prop("selected", true);
      }
    }

    on_template_change(event) {
      var $el, instrument_uid, template_instrument, template_uid;
      /*
       * Eventhandler for template change
       */
      console.debug("°°° WorksheetFolderView::on_template_change °°°");
      // The select element for WS Template
      $el = $(event.target);
      // The option value is the worksheettemplate UID
      template_uid = $el.val();
      // Assigned instrument of this worksheet
      template_instrument = this.get_template_instrument();
      // The UID of the assigned instrument in the template
      instrument_uid = template_instruments[template_uid];
      // Select the instrument from the selection
      return this.select_instrument(instrument_uid);
    }

    on_instrument_change(event) {
      var $el, instrument_uid, message;
      /*
       * Eventhandler for instrument change
       */
      console.debug("°°° WorksheetFolderView::on_instrument_change °°°");
      // The select element for WS Instrument
      $el = $(event.target);
      // The option value is the nstrument UID
      instrument_uid = $el.val();
      if (instrument_uid) {
        message = _("Only the analyses for which the selected instrument is allowed will be added automatically.");
        // actually just a notification, but lacking a proper css class here
        return bika.lims.SiteView.notify_in_panel(message, "error");
      }
    }

  };

  window.WorksheetAddAnalysesView = class WorksheetAddAnalysesView {
    constructor() {
      /*
       * Controller class for Worksheet's add analyses view
       */
      this.load = this.load.bind(this);
      /* METHODS */
      this.ajax_submit = this.ajax_submit.bind(this);
      this.get_listing_form_id = this.get_listing_form_id.bind(this);
      this.get_listing_form = this.get_listing_form.bind(this);
      /* INITIALIZERS */
      this.bind_eventhandler = this.bind_eventhandler.bind(this);
      /* EVENT HANDLER */
      this.on_category_change = this.on_category_change.bind(this);
      this.on_search_click = this.on_search_click.bind(this);
    }

    load() {
      console.debug("WorksheetAddanalysesview::load");
      // bind the event handler to the elements
      this.bind_eventhandler();
      // dev only
      return window.ws = this;
    }

    ajax_submit(options = {}) {
      var done;
      /*
       * Ajax Submit with automatic event triggering and some sane defaults
       */
      console.debug("°°° ajax_submit °°°");
      // some sane option defaults
      if (options.type == null) {
        options.type = "POST";
      }
      if (options.url == null) {
        options.url = window.location.href;
      }
      if (options.context == null) {
        options.context = this;
      }
      console.debug(">>> ajax_submit::options=", options);
      $(this).trigger("ajax:submit:start");
      done = () => {
        return $(this).trigger("ajax:submit:end");
      };
      return $.ajax(options).done(done);
    }

    get_listing_form_id() {
      /*
       * Returns the CSS ID of the analyses listing
       */
      return "list";
    }

    get_listing_form() {
      /*
       * Returns the analyses listing form element
       */
      var form_id;
      form_id = this.get_listing_form_id();
      return $(`form[id='${form_id}']`);
    }

    bind_eventhandler() {
      /*
       * Binds callbacks on elements
       *
       * N.B. We attach all the events to the form and refine the selector to
       * delegate the event: https://learn.jquery.com/events/event-delegation/
       *
       */
      console.debug("WorksheetAddanalysesview::bind_eventhandler");
      // Category filter changed
      $("body").on("change", "[name='list_FilterByCategory']", this.on_category_change);
      // Search button clicked
      return $("body").on("click", ".ws-analyses-search-button", this.on_search_click);
    }

    on_category_change(event) {
      /*
       * Eventhandler for category change
       */
      return console.debug("°°° WorksheetAddanalysesview::on_category_change °°°");
    }

    on_search_click(event) {
      var filter_indexes, form, form_data, form_id;
      /*
       * Eventhandler for the search button
       */
      console.debug("°°° WorksheetAddanalysesview::on_search_click °°°");
      // Prevent form submit
      event.preventDefault();
      form = this.get_listing_form();
      form_id = this.get_listing_form_id();
      filter_indexes = ["FilterByCategory", "FilterByService", "FilterByClient"];
      // The filter elements (Category/Service/Client) belong to another form.
      // Therefore, we need to inject these values into the listing form as hidden
      // input fields.
      $.each(filter_indexes, function(index, filter) {
        var $el, input, name, value;
        name = `${form_id}_${filter}`;
        $el = $(`select[name='${name}']`);
        value = $el.val();
        // get the corresponding input element of the listing form
        input = $(`input[name='${name}']`, form);
        if (input.length === 0) {
          form.append(`<input name='${name}' value='${value}' type='hidden'/>`);
          input = $(`input[name='${name}']`, form);
        }
        input.val(value);
        // omit the field if the value is set to any
        if (value === "any") {
          return input.remove();
        }
      });
      // extract the data of the listing form and post it to the AddAnalysesView
      form_data = new FormData(form[0]);
      form_data.set("table_only", form_id);
      return this.ajax_submit({
        data: form_data,
        processData: false, // do not transform to a query string
        contentType: false // do not set any content type header
      }).done(function(data) {
        return $("div.bika-listing-table-container", form).html(data);
      });
    }

  };

  //     # search form - selecting a category fills up the service selector
  //     $('[name="list_FilterByCategory"]').live 'change', ->
  //       val = $('[name="list_FilterByCategory"]').find(':selected').val()
  //       if val == 'any'
  //         $('[name="list_FilterByService"]').empty()
  //         $('[name="list_FilterByService"]').append '<option value=\'any\'>' + _('Any') + '</option>'
  //         return
  //       $.ajax
  //         url: window.location.href.split('?')[0].replace('/add_analyses', '') + '/getServies'
  //         type: 'POST'
  //         data:
  //           '_authenticator': $('input[name="_authenticator"]').val()
  //           'getCategoryUID': val
  //         dataType: 'json'
  //         success: (data, textStatus, $XHR) ->
  //           current_service_selection = $('[name="list_FilterByService"]').val()
  //           $('[name="list_FilterByService"]').empty()
  //           $('[name="list_FilterByService"]').append '<option value=\'any\'>' + _('Any') + '</option>'
  //           i = 0
  //           while i < data.length
  //             if data[i] == current_service_selection
  //               selected = 'selected="selected" '
  //             else
  //               selected = ''
  //             $('[name="list_FilterByService"]').append '<option ' + selected + 'value=\'' + data[i][0] + '\'>' + data[i][1] + '</option>'
  //             i++
  //           return
  //       return
  //     $('[name="list_FilterByCategory"]').trigger 'change'

  //############### REFACTOR FROM HERE ##############################
  /**
   * Controller class for Worksheet's add blank/control views
   */
  window.WorksheetAddQCAnalysesView = function() {
    var get_updated_controls, that;
    that = this;
    // adding Controls and Blanks - selecting services re-renders the list
    // of applicable reference samples
    get_updated_controls = function() {
      var control_type, element, selected_service_uids, url;
      selected_service_uids = [];
      $.each($('input:checked'), function(i, e) {
        selected_service_uids.push($(e).val());
      });
      if (window.location.href.search('add_control') > -1) {
        control_type = 'c';
      } else {
        control_type = 'b';
      }
      url = window.location.href.split('?')[0].replace('/add_blank', '').replace('/add_control', '') + '/getWorksheetReferences';
      element = $('#worksheet_add_references');
      if (element.length > 0) {
        $(element).load(url, {
          'service_uids': selected_service_uids.join(','),
          'control_type': control_type,
          '_authenticator': $('input[name="_authenticator"]').val()
        }, function(responseText, statusText, xhr, $form) {});
      }
    };
    that.load = function() {
      $('#worksheet_services input[id*=\'_cb_\']').live('click', function() {
        get_updated_controls();
      });
      // get references for selected services on first load
      get_updated_controls();
      // click a Reference Sample in add_control or add_blank
      $('#worksheet_add_references .bika-listing-table tbody.item-listing-tbody tr').live('click', function(e) {
        var selected_service_uids, ssuids;
        // we want to submit to the worksheet.py/add_control or add_blank views.
        if (e.target.src !== void 0) {
          return;
        }
        if (window.location.href.search('add_control') > -1) {
          $(this).parents('form').attr('action', 'add_control');
        } else {
          $(this).parents('form').attr('action', 'add_blank');
        }
        // tell the form handler which services were selected
        selected_service_uids = [];
        $.each($('.worksheet_add_control_services .bika-listing-table input:checked'), function(i, e) {
          selected_service_uids.push($(e).val());
        });
        ssuids = selected_service_uids.join(',');
        $(this).parents('form').append('<input type=\'hidden\' value=\'' + ssuids + '\' name=\'selected_service_uids\'/>');
        // tell the form handler which reference UID was clicked
        $(this).parents('form').append('<input type=\'hidden\' value=\'' + $(this).attr('uid') + '\' name=\'reference_uid\'/>');
        // add the position dropdown's value to the form before submitting.
        $(this).parents('form').append('<input type=\'hidden\' value=\'' + $('#position').val() + '\' name=\'position\'/>');
        $(this).parents('form').submit();
      });
    };
  };

  /**
   * Controller class for Worksheet's add blank/control views
   */
  window.WorksheetAddDuplicateAnalysesView = function() {
    var that;
    that = this;
    that.load = function() {
      // click an AR in add_duplicate
      $('#worksheet_add_duplicate_ars .bika-listing-table tbody.item-listing-tbody tr').live('click', function() {
        // we want to submit to the worksheet.py/add_duplicate view.
        $(this).parents('form').attr('action', 'add_duplicate');
        // add the position dropdown's value to the form before submitting.
        $(this).parents('form').append('<input type=\'hidden\' value=\'' + $(this).attr('uid') + '\' name=\'ar_uid\'/>').append('<input type=\'hidden\' value=\'' + $('#position').val() + '\' name=\'position\'/>');
        $(this).parents('form').submit();
      });
    };
  };

  /**
   * Controller class for Worksheet's manage results view
   */
  window.WorksheetManageResultsView = function() {
    /**
     * Applies the rules and constraints to each analysis displayed in the
     * manage results view regarding to methods, instruments and results.
     * For example, this service is responsible of disabling the results field
     * if the analysis has no valid instrument available for the selected
     * method if the service don't allow manual entry of results. Another
     * example is that this service is responsible of populating the list of
     * instruments avialable for an analysis service when the user changes the
     * method to be used.
     * See docs/imm_results_entry_behavior.png for detailed information.
     */
    /**
     * Check if the Instrument is allowed to appear in Instrument list of Analysis.
     * Returns true if multiple use of an Instrument is enabled for assigned Worksheet Template or UID is not in selected Instruments
     * @param {uid} ins_uid - UID of Instrument.
     */
    /**
     * If a new instrument is chosen for the analysis, disable this Instrument for the other analyses. Also, remove
     * the restriction of previous Instrument of this analysis to be chosen in the other analyses.
     */
    /**
     * Change the instruments to be shown for an analysis when the method selected changes
     */
    /**
     * Applies the constraints and rules to the specified analysis regarding to
     * the method specified. If method is null, the function assumes the rules
     * must apply for the currently selected method.
     * The function uses the variable mi_constraints to find out which is the
     * rule to be applied to the analysis and method specified.
     * See initializeInstrumentsAndMethods() function for further information
     * about the constraints and rules retrieval and assignment.
     * @param {string} analysis_uid - The Analysis UID
     * @param {string} method_uid - The Method UID. If null, uses the method
     *  that is currently selected for the specified analysis.
     */
    /**
     * Stores the constraints regarding to methods and instrument assignments to
     * each analysis. The variable is filled in initializeInstrumentsAndMethods
     * and is used inside loadMethodEventHandlers.
     */
    var initializeInstrumentsAndMethods, is_ins_allowed, loadDetectionLimitsEventHandlers, loadHeaderEventsHandlers, loadInstrumentEventHandlers, loadMethodEventHandlers, loadRemarksEventHandlers, loadWideInterimsEventHandlers, load_analysis_method_constraint, mi_constraints, portalMessage, that;
    that = this;
    portalMessage = function(message) {
      var _, str;
      window.jarn.i18n.loadCatalog('bika');
      _ = jarn.i18n.MessageFactory('bika');
      str = '<dl class=\'portalMessage info\'>' + '<dt>' + _('Info') + '</dt>' + '<dd><ul>' + message + '</ul></dd></dl>';
      $('.portalMessage').remove();
      $(str).appendTo('#viewlet-above-content');
    };
    loadRemarksEventHandlers = function() {
      // On click, toggle the remarks field
      $('a.add-remark').click(function(e) {
        var rmks;
        e.preventDefault();
        rmks = $(this).closest('tr').next('tr').find('td.remarks');
        $(rmks).find('div.remarks-placeholder').toggle();
      });
    };
    loadDetectionLimitsEventHandlers = function() {
      $('select[name^="DetectionLimit."]').change(function() {
        var defdls, resfld, uncfld;
        defdls = $(this).closest('td').find('input[id^="DefaultDLS."]').first().val();
        resfld = $(this).closest('tr').find('input[name^="Result."]')[0];
        uncfld = $(this).closest('tr').find('input[name^="Uncertainty."]');
        defdls = $.parseJSON(defdls);
        $(resfld).prop('readonly', !defdls.manual);
        if ($(this).val() === '<') {
          $(resfld).val(defdls['min']);
          // Inactivate uncertainty?
          if (uncfld.length > 0) {
            $(uncfld).val('');
            $(uncfld).prop('readonly', true);
            $(uncfld).closest('td').children().hide();
          }
        } else if ($(this).val() === '>') {
          $(resfld).val(defdls['max']);
          // Inactivate uncertainty?
          if (uncfld.length > 0) {
            $(uncfld).val('');
            $(uncfld).prop('readonly', true);
            $(uncfld).closest('td').children().hide();
          }
        } else {
          $(resfld).val('');
          $(resfld).prop('readonly', false);
          // Activate uncertainty?
          if (uncfld.length > 0) {
            $(uncfld).val('');
            $(uncfld).prop('readonly', false);
            $(uncfld).closest('td').children().show();
          }
        }
        // Maybe the result is used in calculations...
        $(resfld).change();
      });
      $('select[name^="DetectionLimit."]').change();
    };
    loadWideInterimsEventHandlers = function() {
      $('#wideinterims_analyses').change(function() {
        $('#wideinterims_interims').html('');
        $('input[id^="wideinterim_' + $(this).val() + '"]').each(function(i, obj) {
          var itemval;
          itemval = '<option value="' + $(obj).attr('keyword') + '">' + $(obj).attr('name') + '</option>';
          $('#wideinterims_interims').append(itemval);
        });
      });
      $('#wideinterims_interims').change(function() {
        var analysis, idinter, interim;
        analysis = $('#wideinterims_analyses').val();
        interim = $(this).val();
        idinter = '#wideinterim_' + analysis + '_' + interim;
        $('#wideinterims_value').val($(idinter).val());
      });
      $('#wideinterims_apply').click(function(event) {
        var analysis, interim;
        event.preventDefault();
        analysis = $('#wideinterims_analyses').val();
        interim = $('#wideinterims_interims').val();
        $('tr[keyword="' + analysis + '"] input[field="' + interim + '"]').each(function(i, obj) {
          if ($('#wideinterims_empty').is(':checked')) {
            if ($(this).val() === '' || $(this).val().match(/\d+/) === '0') {
              $(this).val($('#wideinterims_value').val());
              $(this).change();
            }
          } else {
            $(this).val($('#wideinterims_value').val());
            $(this).change();
          }
        });
      });
    };
    initializeInstrumentsAndMethods = function() {
      var auids, dictuids;
      auids = [];
      /// Get all the analysis UIDs from this manage results table, cause
      // we'll need them to retrieve all the IMM constraints/rules to be
      // applied later.
      dictuids = $.parseJSON($('#item_data').val());
      $.each(dictuids, function(key, value) {
        auids.push(key);
      });
      // Retrieve all the rules/constraints to be applied for each analysis
      // by using an ajax call. The json dictionary returned is assigned to
      // the variable mi_constraints for further use.
      // FUTURE: instead of an ajax call to retrieve the dictionary, embed
      //  the dictionary in a div when the bika_listing template is rendered.
      $.ajax({
        url: window.portal_url + '/get_method_instrument_constraints',
        type: 'POST',
        data: {
          '_authenticator': $('input[name="_authenticator"]').val(),
          'uids': $.toJSON(auids)
        },
        dataType: 'json'
      }).done(function(data) {
        var mi_constraints;
        // Save the constraints in the m_constraints variable
        mi_constraints = data;
        $.each(auids, function(index, value) {
          // Apply the constraints/rules to each analysis.
          load_analysis_method_constraint(value, null);
        });
      }).fail(function() {
        window.bika.lims.log('bika.lims.worksheet: Something went wrong while retrieving analysis-method-instrument constraints');
      });
    };
    load_analysis_method_constraint = function(analysis_uid, method_uid) {
      var andict, constraints, i_selector, ins_old_val, m_selector, method_name, muid;
      if (method_uid === null) {
        // Assume to load the constraints for the currently selected method
        muid = $('select.listing_select_entry[field="Method"][uid="' + analysis_uid + '"]').val();
        muid = muid ? muid : '';
        load_analysis_method_constraint(analysis_uid, muid);
        return;
      }
      andict = mi_constraints[analysis_uid];
      if (!andict) {
        return;
      }
      constraints = andict[method_uid];
      if (!constraints || constraints.length < 7) {
        return;
      }
      m_selector = $('select.listing_select_entry[field="Method"][uid="' + analysis_uid + '"]');
      i_selector = $('select.listing_select_entry[field="Instrument"][uid="' + analysis_uid + '"]');
      // None option in method selector?
      $(m_selector).find('option[value=""]').remove();
      if (constraints[1] === 1) {
        $(m_selector).prepend('<option value="">' + _('Not defined') + '</option>');
      }
      // Select the method
      $(m_selector).val(method_uid);
      // Method selector visible?
      // 0: no, 1: yes, 2: label, 3: readonly
      $(m_selector).prop('disabled', false);
      $('.method-label[uid="' + analysis_uid + '"]').remove();
      if (constraints[0] === 0) {
        $(m_selector).hide();
      } else if (constraints[0] === 1) {
        $(m_selector).show();
      } else if (constraints[0] === 2) {
        if (andict.length > 1) {
          $(m_selector).hide();
          method_name = $(m_selector).find('option[value="' + method_uid + '"]').innerHtml();
          $(m_selector).after('<span class="method-label" uid="' + analysis_uid + '" href="#">' + method_name + '</span>');
        }
      } else if (constraints[0] === 3) {
        //$(m_selector).prop('disabled', true);
        $(m_selector).show();
      }
      // We are going to reload Instrument list.. Enable all disabled options from other Instrument lists which has the
      // same value as old value of this Instrument Selectbox.
      ins_old_val = $(i_selector).val();
      if (ins_old_val && ins_old_val !== '') {
        $('table.bika-listing-table select.listing_select_entry[field="Instrument"][value!="' + ins_old_val + '"] option[value="' + ins_old_val + '"]').prop('disabled', false);
      }
      // Populate instruments list
      $(i_selector).find('option').remove();
      if (constraints[7]) {
        $.each(constraints[7], function(key, value) {
          if (is_ins_allowed(key)) {
            $(i_selector).append('<option value="' + key + '">' + value + '</option>');
          } else {
            $(i_selector).append('<option value="' + key + '" disabled="true">' + value + '</option>');
          }
        });
      }
      // None option in instrument selector?
      if (constraints[3] === 1) {
        $(i_selector).prepend('<option selected="selected" value="">' + _('None') + '</option>');
      }
      // Select the default instrument
      if (is_ins_allowed(constraints[4])) {
        $(i_selector).val(constraints[4]);
        // Disable this Instrument in the other Instrument SelectBoxes
        $('table.bika-listing-table select.listing_select_entry[field="Instrument"][value!="' + constraints[4] + '"] option[value="' + constraints[4] + '"]').prop('disabled', true);
      }
      // Instrument selector visible?
      if (constraints[2] === 0) {
        $(i_selector).hide();
      } else if (constraints[2] === 1) {
        $(i_selector).show();
      }
      // Allow to edit results?
      if (constraints[5] === 0) {
        $('.interim input[uid="' + analysis_uid + '"]').val('');
        $('input[field="Result"][uid="' + analysis_uid + '"]').val('');
        $('.interim input[uid="' + analysis_uid + '"]').prop('disabled', true);
        $('input[field="Result"][uid="' + analysis_uid + '"]').prop('disabled', true);
      } else if (constraints[5] === 1) {
        $('.interim input[uid="' + analysis_uid + '"]').prop('disabled', false);
        $('input[field="Result"][uid="' + analysis_uid + '"]').prop('disabled', false);
      }
      // Info/Warn message?
      $('.alert-instruments-invalid[uid="' + analysis_uid + '"]').remove();
      if (constraints[6] && constraints[6] !== '') {
        $(i_selector).after('<img uid="' + analysis_uid + '" class="alert-instruments-invalid" src="' + window.portal_url + '/++resource++bika.lims.images/warning.png" title="' + constraints[6] + '")">');
      }
      $('.amconstr[uid="' + analysis_uid + '"]').remove();
    };
    //$(m_selector).before("<span style='font-weight:bold;font-family:courier;font-size:1.4em;' class='amconstr' uid='"+analysis_uid+"'>"+constraints[10]+"&nbsp;&nbsp;</span>");
    loadHeaderEventsHandlers = function() {
      $('.manage_results_header .analyst').change(function() {
        if ($(this).val() === '') {
          return false;
        }
        $.ajax({
          type: 'POST',
          url: window.location.href.replace('/manage_results', '') + '/set_analyst',
          data: {
            'value': $(this).val(),
            '_authenticator': $('input[name="_authenticator"]').val()
          },
          success: function(data, textStatus, jqXHR) {
            var _p;
            window.jarn.i18n.loadCatalog('plone');
            _p = jarn.i18n.MessageFactory('plone');
            portalMessage(_p('Changes saved.'));
          }
        });
      });
      // Change the results layout
      $('#resultslayout_form #resultslayout_button').hide();
      $('#resultslayout_form #resultslayout').change(function() {
        $('#resultslayout_form #resultslayout_button').click();
      });
      $('.manage_results_header .instrument').change(function() {
        var instruid;
        $('#content-core .instrument-error').remove();
        instruid = $(this).val();
        if (instruid === '') {
          return false;
        }
        $.ajax({
          type: 'POST',
          url: window.location.href.replace('/manage_results', '') + '/set_instrument',
          data: {
            'value': instruid,
            '_authenticator': $('input[name="_authenticator"]').val()
          },
          success: function(data, textStatus, jqXHR) {
            var _p;
            window.jarn.i18n.loadCatalog('plone');
            _p = jarn.i18n.MessageFactory('plone');
            portalMessage(_p('Changes saved.'));
            // Set the selected instrument to all the analyses which
            // that can be done using that instrument. The rest of
            // of the instrument picklist will not be changed
            $('select.listing_select_entry[field="Instrument"] option[value="' + instruid + '"]').parent().find('option[value="' + instruid + '"]').prop('selected', false);
            $('select.listing_select_entry[field="Instrument"] option[value="' + instruid + '"]').prop('selected', true);
          },
          error: function(data, jqXHR, textStatus, errorThrown) {
            $('.manage_results_header .instrument').closest('table').after('<div class=\'alert instrument-error\'>' + _('Unable to apply the selected instrument') + '</div>');
            return false;
          }
        });
      });
    };
    loadMethodEventHandlers = function() {
      $('table.bika-listing-table select.listing_select_entry[field="Method"]').change(function() {
        var auid, muid;
        auid = $(this).attr('uid');
        muid = $(this).val();
        load_analysis_method_constraint(auid, muid);
      });
    };
    loadInstrumentEventHandlers = function() {
      $('table.bika-listing-table select.listing_select_entry[field="Instrument"]').on('focus', function() {
        var previous;
        // First, getting the previous value
        previous = this.value;
      }).change(function() {
        var auid, iuid;
        auid = $(this).attr('uid');
        iuid = $(this).val();
        // Disable New Instrument for rest of the analyses
        $('table.bika-listing-table select.listing_select_entry[field="Instrument"][value!="' + iuid + '"] option[value="' + iuid + '"]').prop('disabled', true);
        // Enable previous Instrument everywhere
        $('table.bika-listing-table select.listing_select_entry[field="Instrument"] option[value="' + previous + '"]').prop('disabled', false);
        // Enable 'None' option as well.
        $('table.bika-listing-table select.listing_select_entry[field="Instrument"] option[value=""]').prop('disabled', false);
      });
    };
    is_ins_allowed = function(uid) {
      var i, i_selectors, multiple_enabled;
      multiple_enabled = $('#instrument_multiple_use').attr('value');
      if (multiple_enabled === 'True') {
        return true;
      } else {
        i_selectors = $('select.listing_select_entry[field="Instrument"]');
        i = 0;
        while (i < i_selectors.length) {
          if (i_selectors[i].value === uid) {
            return false;
          }
          i++;
        }
      }
      return true;
    };
    that.load = function() {
      // Remove empty options
      initializeInstrumentsAndMethods();
      loadHeaderEventsHandlers();
      loadMethodEventHandlers();
      // Manage the upper selection form for spread wide interim results values
      loadWideInterimsEventHandlers();
      loadRemarksEventHandlers();
      loadDetectionLimitsEventHandlers();
      loadInstrumentEventHandlers();
    };
    mi_constraints = null;
  };

}).call(this);
