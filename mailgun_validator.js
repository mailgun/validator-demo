//
// Mailgun Address Validation Plugin
//
// Attaching to a form:
//
//    $('jquery_selector').mailgun_validator({
//        api_key: 'api-key',
//        in_progress: in_progress_callback, // called when request is made to validator
//        success: success_callback,         // called when validator has returned
//        error: validation_error,           // called when an error reaching the validator has occured
//    });
//
//
// Sample JSON in success callback:
//
//  {
//      "is_valid": true,
//      "parts": {
//          "local_part": "john.smith@example.com",
//          "domain": "example.com",
//          "display_name": ""
//      },
//      "address": "john.smith@example.com",
//      "did_you_mean": null
//  }
//
// More API details: https://api.mailgun.net/v2/address
//

(function( $ ) {
    $.fn.mailgun_validator = function(options) {
        return this.each(function() {
            var thisElement = $(this);
            thisElement.focusout(function(e) {
                //Trim string and autocorrect whitespace issues
                var elementValue = thisElement.val();
                elementValue = $.trim(elementValue);
                thisElement.val(elementValue);

                //Attach event to options
                options.e = e;

                run_validator(elementValue, options, thisElement);
            });
        });
    };

    function run_validator(address_text, options, element) {
        //Abort existing AJAX Request to prevent flooding
        if(element.mailgunRequest) {
            element.mailgunRequest.abort();
            element.mailgunRequest = null;
        }

        // don't run validator without input
        if (!address_text) {
            return;
        }

        // validator is in progress
        if (options && options.in_progress) {
            options.in_progress(options.e);
        }

        // don't run duplicate calls
        if (element.mailgunLastSuccessReturn) {
            if (address_text == element.mailgunLastSuccessReturn.address) {
                if (options && options.success) {
                    options.success(element.mailgunLastSuccessReturn, options.e);
                }
                return;
            }
        }

        // length and @ syntax check
        var error_message = false;
        if (address_text.length > 512)
            error_message = 'Email address exceeds maxiumum allowable length of 512.';
        else if (1 !== address_text.split('@').length-1)
            error_message = 'Email address must contain only one @.';

        if (error_message) {
            if (options && options.error) {
                options.error(error_message, options.e);
            }
            else {
                if (console) console.log(error_message);
            }
            return;
        }

        // require api key
        if (options && options.api_key == undefined) {
            if (console) console.log('Please pass in api_key to mailgun_validator.');
        }

        // timeout incase of some kind of internal server error
        var timeoutID = setTimeout(function() {
            error_message = 'Error occurred, unable to validate address.';
            if (!success) {
                //Abort existing AJAX Request for a true timeout
                if(element.mailgunRequest) {
                    element.mailgunRequest.abort();
                    element.mailgunRequest = null;
                }

                if (options && options.error) {
                    options.error(error_message, options.e);
                }
                else {
                    if (console) console.log(error_message);
                }
            }
        }, 30000); //30 seconds

        // make ajax call to get validation results
        element.mailgunRequest = $.ajax({
            type: "GET",
            url: 'https://api.mailgun.net/v2/address/validate?callback=?',
            data: { address: address_text, api_key: options.api_key },
            dataType: "jsonp",
            crossDomain: true,
            success: function(data, status_text) {
                clearTimeout(timeoutID);

                element.mailgunLastSuccessReturn = data;
                if (options && options.success) {
                    options.success(data, options.e);
                }
            },
            error: function(request, status_text, error) {
                clearTimeout(timeoutID);
                error_message = 'Error occurred, unable to validate address.';

                if (options && options.error) {
                    options.error(error_message, options.e);
                }
                else {
                    if (console) console.log(error_message);
                }
            }
        });
    }
})( jQuery );
