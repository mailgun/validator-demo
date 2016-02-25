# Advanced jQuery Email Address Validator by Mailgun

Given an arbitrary address, [Mailgun](http://www.mailgun.com) will validate the address based on:
* Syntax checks (RFC defined grammar)
* DNS validation
* Spell checks
* Email Service Provider (ESP) specific local-part grammar (if available)

## How to use the email validator on your form

1. Include jQuery
2. Include mailgun_validator.js
3. [Sign up](https://mailgun.com/signup) for a Mailgun account and insert your public API key
4. Attach mailgun_validator() function to the email field you want validated
5. Decide what should happen for valid emails, invalid emails and suggestions

Attaching to a form field:
```Javascript
   $('jquery_selector').mailgun_validator({
       api_key: 'api-key',
       in_progress: in_progress_callback, // called when request is made to validator
       success: success_callback,         // called when validator has returned
       error: validation_error,           // called when an error reaching the validator has occured
       messages: {
         errors: {                        // customize error messages
           max_of_512: "Email address exceeds maximum allowable length of 512.",
           must_contain: "Email address must contain only one @.",
           unable_to_validate: "Error occurred, unable to validate address."
         }
       }
   });
```

Sample JSON in success callback:
```JSON
 {
     "is_valid": true,
     "parts": {
         "local_part": "john.smith@example.com",
         "domain": "example.com",
         "display_name": ""
     },
     "address": "john.smith@example.com",
     "did_you_mean": null
 }
```

## Demo

http://mailgun.github.io/validator-demo/

## More information

* [Validator API Docs](http://documentation.mailgun.com/api-email-validation.html)
* [Mailgun Blog Announcement](http://blog.mailgun.com/post/free-email-validation-api-for-web-forms/)
