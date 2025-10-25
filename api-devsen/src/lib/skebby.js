var BASEURL = 'https://api.skebby.it/API/v1.0/REST/';
var request = require('request');

/**
 * Authenticates the user given it's username and password.  Callback
 * is called when completed. If error is false, then an authentication
 * object is passed to the callback as second parameter.
 */
export function login(username, password, callback) {
    request({
        url: BASEURL + 'login?username=' + username + '&password=' + password,
        method: 'GET',
        callback: function (error, responseMeta, response) {
            if (!error && responseMeta.statusCode == 200) {
                var auth = response.split(';');
                callback(error, {
                    user_key : auth[0],
                    session_key : auth[1]
                });
            } else {
                callback(true, false);
            }
        }
    });
}

/**
 * Sends an SMS message
 */
export function sendSMS(auth, sendsms, callback) {
    request({
        url: BASEURL + 'sms',
        method: 'POST',
        headers: { 'user_key' : auth.user_key, 'Session_key' : auth.session_key },
        json: true,
        body:  sendsms,

        callback: function (error, responseMeta, response) {
            
            if (!error && responseMeta.statusCode == 201) {
                callback(response.result !== 'OK', response);
            }
            else {
                callback(false);
            }
        }
    });
}
