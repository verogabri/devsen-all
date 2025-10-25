/* eslint-disable no-mixed-spaces-and-tabs */
const config = process.env.NODE_ENV=='production' ? require("../config.production.json") : process.env.NODE_ENV=='staging' ? require("../config.staging.json") : require("../config.json");
import crypto from 'crypto';
var shortUrl = require('node-url-shortener');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNT = require('google-libphonenumber').PhoneNumberType;
import * as Skebby from "./skebby.js";

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

let fs = require('fs');

/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res));
 *		}
 */

/*export function toRes(res, status=200) {
	return (err, thing) => {
		if (err) return res.status(500).send(err);

		if (thing && typeof thing.toObject==='function') {
			thing = thing.toObject();
		}
		res.status(status).json(thing);
	};
}*/
/**
 * get ip of client
 *
 * @req - express request
 */
export function get_client_ip(req) {
    return (req.headers["X-Forwarded-For"] ||
            req.headers["x-forwarded-for"] ||
            '').split(',')[0] ||
           req.client.remoteAddress;
}

/**
 * send activation email
 *
 * @data - (code, token, id, username )
 */
export function send_activation_email(data, callback) {
	// Create sendEmail params
	let activation_url = config.activation_url.replace('{{code}}', data.code).replace('{{token}}', data.token).replace('{{id}}', data.id).replace("{{redirect_url}}", data.redirect_url);
    let params;
    params = {
        Destination: {
            /* required */
            ToAddresses: [
                data.email,
                /* more items */
            ]
        }, Source: config.aws_ses_from_email, /* required */
        Template: "activation",
        TemplateData: '{ \"hello\":\"'+data.hello+'\",\"confirm_account\":\"'+data.confirm_account+'\",\"welcome\":\"'+data.welcome+'\",\"thanks\":\"'+data.thanks+'\",\"activate\":\"'+data.activate+'\",\"click\":\"'+data.click+'\",\"confirm\":\"'+data.confirm+'\",\"thank\":\"'+data.thank+'\",\"name\":\"'+data.username+'\",\"activation_url\":\"'+activation_url+'\",\"store_name\":\"'+data.store_name+'\",\"store_domain\":\"'+data.store_domain+'\" }', /* required */
        ReplyToAddresses: [
            config.aws_ses_from_email,
            /* more items */
        ],
    };

	// Create the promise and SES service object
	let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

	// Handle promise's fulfilled/rejected states
	sendPromise.then(
	  function(data) {
	    	
	    	if(callback) callback(true);
	  }).catch(
	    function(err) {
	    	
	    	// console.error(err, err.stack);
	    	if(callback) callback(false);
	  });
}

/**
 * send email to verify email change
 *
 * @data - (code, token, id, username )
 */
export function send_verify_change_email(data, translations, callback) {
    // Create sendEmail params
    let verify_change_email_url = config.verify_change_email_url.replace('{{code}}',data.code).replace('{{token}}',data.token).replace('{{id}}',data.id);
    let params;
    params = {
        Destination: {
            /* required */
            ToAddresses: [
                data.email,
                /* more items */
            ]
        }, Source: config.aws_ses_from_email, /* required */
        Template: "change_email",
        TemplateData: '{ \"update\":\"'+translations.update+'\",\"modify_click\":\"'+translations.modify_click+'\",\"hello\":\"'+translations.hello+'\",\"modify\":\"'+translations.modify+'\",\"welcome\":\"'+translations.welcome+'\",\"thank\":\"'+translations.thank+'\",\"name\":\"'+data.username+'\",\"activation_url\":\"'+verify_change_email_url+'\",\"store_name\":\"'+data.store_name+'\",\"store_domain\":\"'+data.store_domain+'\" }', /* required */
        ReplyToAddresses: [
            config.aws_ses_from_email,
            /* more items */
        ],
    };

    // Create the promise and SES service object
    let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

    // Handle promise's fulfilled/rejected states
    sendPromise.then(
        function(data) {
            if(callback) callback(true);
        }).catch(
        function(err) {
            
            console.error(err, err.stack);
            if(callback) callback(false);
        });
}

/**
 * send email to change password
 *
 * @data - (code, token, id, username )
 */
export function send_recover_password_email(data, callback) {
    // Create sendEmail params
    var recover_password_url = config.recover_password_url.replace('{{code}}',data.code).replace('{{token}}',data.token).replace('{{id}}',data.id);
    var params;
    params = {
        Destination: {
            /* required */
            ToAddresses: [
                data.email,
                /* more items */
            ]
        }, Source: config.aws_ses_from_email, /* required */
        Template: "recoverPassword",
        TemplateData: '{  \"hello\":\"'+data.hello+'\",\"modify\":\"'+data.modify+'\", \"update\":\"'+data.update+'\",\"modify_click\":\"'+data.modify_click+'\", \"thank\":\"'+data.thank+'\",\"click\":\"'+data.click+'\",\"name\":\"'+data.username+'\",\"activation_url\":\"'+recover_password_url+'\",\"store_name\":\"'+data.store_name+'\",\"store_domain\":\"'+data.store_domain+'\" }', /* required */
        ReplyToAddresses: [
            config.aws_ses_from_email,
            /* more items */
        ],
    };

    // Create the promise and SES service object
    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

    // Handle promise's fulfilled/rejected states
    sendPromise.then(
        function(data) {
            if(callback) callback(true);
        }).catch(
        function(err) {
            
            console.error(err, err.stack);
            if(callback) callback(false);
        });
}

/**
 * send email to confirm unsubscribe from newsletter
 *
 * @data - (email)
 */
export function send_confirm_unsubscribe_from_newsletter(data, callback) {
    let unsubscribe_from_newsletter_url = config.confirm_unsubscribe_url.replace('{{email}}',data.encrypted_email).replace('{{lang}}',data.lang);
    data['url'] = unsubscribe_from_newsletter_url;
    let params;
    params = {
        Destination: {
            /* required */
            ToAddresses: [
                data.email,
                /* more items */
            ]
        }, Source: config.aws_ses_from_email, /* required */
        Template: "confirmUnsubscribeFromNewsletter",
        TemplateData: '{  ' +
            '\"hello\":\"'+data.hello+'\",' +
            '\"name\":\"'+data.username+'\", ' +
            '\"text_1\":\"'+data.text_1+'\",' +
            '\"url\":\"'+unsubscribe_from_newsletter_url+'\",' +
            '\"thank\":\"'+data.thank+'\",' +
            '\"store_name\":\"'+data.store_name+'\" }', /* required */
        ReplyToAddresses: [
            config.aws_ses_from_email,
            /* more items */
        ],
    };

    // Create the promise and SES service object
    let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

    // Handle promise's fulfilled/rejected states
    sendPromise.then(
        function(data) {
            if(callback) callback(true);
        }).catch(
        function(err) {
            console.log('error in send email');
            console.error(err, err.stack);
            if(callback) callback(false);
        });
}

/**
 * send confirm order
 *
 * @user - (name)
 * @order - (order_number)
 */
export function send_confirm_order(user, translation, order) {
    return new Promise ((resolve, reject) => {
        // Create sendEmail params
        let params;
        params = {
            Destination: {
                /* required */
                ToAddresses: [
                    user.email,
                    /* more items */
                ]
            }, Source: config.aws_ses_from_email, /* required */
            Template: "confirmOrder",
            TemplateData: '{ \"thank\":\"'+translation.thank+'\",\"your_order\":\"'+translation.your_order+'\",\"hello\":\"'+translation.hello+'\",\"order_confirm\":\"'+translation.order_confirm+'\",\"order_verify\":\"'+translation.order_verify+'\",\"order_verify_2\":\"'+translation.order_verify_2+'\",\"name\":\"'+user.name+'\",\"panel_url\":\"'+user.panel_url+'\",\"store_name\":\"'+"akinda"+'\",\"store_domain\":\"'+user.store_domain+'\" }', /* required */
            ReplyToAddresses: [
                config.aws_ses_from_email,
                /* more items */
            ],
        };

        // Create the promise and SES service object
        let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

        // Handle promise's fulfilled/rejected states
        sendPromise.then(
            function(data) {
                //console.log('sent mail '+ data.MessageId);
                resolve(user);
            }).catch(
            function(err) {
                console.log('error in send email');
                console.error(err, err.stack);
                reject(err)
            });
    });
}

export function send_billing_form_email(data, callback) {
    // Create sendEmail params
    const complete_url = config.form_billing_url + "?token="+data.token;
    shortUrl.short(complete_url, function(err, url){
        //config.activation_url.replace('{{code}}',data.code).replace('{{token}}',data.token).replace('{{id}}',data.id).replace("{{redirect_url}}", data.redirect_url);
        var params;
        let addresses = [data.email];
        if(data.email_1 && data.email_1!=='') addresses.push(data.email_1);
        if(data.email_2 && data.email_2!=='') addresses.push(data.email_2);
        if(data.email_3 && data.email_3!=='') addresses.push(data.email_3);
        if(data.email_4 && data.email_4!=='') addresses.push(data.email_4);
        let template = data.type==='rejected' ? "billing_form_rejected" : data.type==='reminder' ?  "billing_form_reminder" : "billing_form";
        params = {
            Destination: {
                /* required */
                ToAddresses: addresses
            }, Source: config.aws_ses_from_email, /* required */
            Template: template,
            TemplateData: '{ \"name\":\"'+data.name+'\",\"click_url\":\"'+url+'\"}', /* required */
            ReplyToAddresses: [
                config.aws_ses_from_email,
                /* more items */
            ],
        };
        // Create the promise and SES service object
        var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

        // Handle promise's fulfilled/rejected states
        sendPromise.then(
            function(data) {
                //console.log('sent mail '+ data.MessageId);
                if(callback) callback(true);
            }).catch(
            function(err) {
                console.log('error in send email');
                console.error(err, err.stack);
                if(callback) callback(false);
            });
    });
}

/**
 * get an hex code
 *
 * @len - lenght of number
 */
export function hexCode(len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}

/**
 * get an array with unique values object
 *
 * @array - input array
 * @to - key of the values to unique
 */
export function unique(array, to='id'){
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i][to] === a[j][to])
                a.splice(j--, 1);
        }
    }
    return a;
}

export function convert_metadata_store(response){

    //console.log(response);


    if(response.colors_rgb && response.colors_type){
        var colors_rgb = response.colors_rgb.split(',');
        var colors_type = response.colors_type.split(',');
        response.colors = {};
        //let i = 0;
        colors_type.forEach(function(colors_type,key){
            //if(i<4){
                if(!response.colors[colors_type]) response.colors[colors_type] = colors_rgb[key];
            //    i++;
            //}else{
                //skip
            //    console.log(colors_type, key, 'skip colors');
            //}
        });
        delete response.colors_rgb;
        delete response.colors_type;
    }

    if(response.texts_text && response.texts_type) {
        var texts_text = response.texts_text.split('@@@Akinda-DeVSIm@@@@');
        var texts_type = response.texts_type.split(',');
        //console.log(texts_text[1]);
        response.texts = {};

        var url_type = ['facebook', 'instagram', 'youtube', 'twitter'];
        var prefix = 'https://';

        texts_type.forEach(function (type, key) {
            if(texts_text[key] && url_type.includes(type) && texts_text[key].substr(0, prefix.length) !== prefix){
                texts_text[key] = prefix + texts_text[key];
            }
            response.texts[type] = texts_text[key];
        });
        delete response.texts_text;
        delete response.texts_type;
    }

    if(response.gallery_images) {
        var gallery_images = response.gallery_images.split('@@@Akinda-DeVSIm@@@@');
        response.gallery = [];
        gallery_images.forEach(function (img, key) {
            response.gallery.push(img);
        });
        delete response.gallery_images;
    }
    return response;
}

export function send_billing_form_sms(data, callback) {
    // Create sendEmail params
    const complete_url = config.form_billing_url + "?token="+data.token;
    shortUrl.short(complete_url, function(err, url){

        var msg = "";
        switch( data.type){
            case "reminder":
                msg = "Gentile Cliente, \ni tuoi dati di fatturazione non sono stati aggiornati. Hai 5 giorni per farlo, prima dell'emissione della fattura: \n" + url;
                break;
            case "rejected":
                msg = "Gentile cliente, \nl'Agenzia delle Entrate ha rifiutato la tua fattura. Aggiorna i tuoi dati di fatturazione per la prossima emissione: \n" + url;
                break;
            case "generic":
                msg = "Gentile Cliente, \naggiorna i tuoi dati di fatturazione compilando il form dedicato: \n" + url;
                break;
        }

        const numbers = [];
        data.numbers.forEach((phone)=>{
            numbers.push(phone.number);
        });

        const smsData = {
            "returnCredits": true,
            "recipient": numbers,
            "message": msg,
            "message_type": "GP",
            "sender":"Akinda"
        };

        Skebby.login('footprint', 'smsfootprint',
            function(error, auth) {
                if (!error) {
                    Skebby.sendSMS(auth, smsData,
                        function(error, data) {
                            if (error) {
                                callback(false);
                            }
                            else {
                                callback(data);
                            }
                        });
                }
                else {
                    callback(false);
                }
            });
    });
}

export function filterPhoneNumbers(phones, type="MOBILE"){
    const filtered_numbers = [];
    phones.forEach((phone)=>{
        const number = phoneUtil.parseAndKeepRawInput(phone.number, 'IT');
        switch (phoneUtil.getNumberType(number)) {
            case PNT.FIXED_LINE:
                //console.log('FIXED_LINE');
                break;
            case PNT.MOBILE:
                //console.log('MOBILE');
                if(type==="MOBILE") filtered_numbers.push(phone);
                break;
            case PNT.FIXED_LINE_OR_MOBILE:
                //console.log('FIXED_LINE_OR_MOBILE');
                break;
            case PNT.TOLL_FREE:
                //console.log('TOLL_FREE');
                break;
            case PNT.PREMIUM_RATE:
                //console.log('PREMIUM_RATE');
                break;
            case PNT.SHARED_COST:
                //console.log('SHARED_COST');
                break;
            case PNT.VOIP:
                //console.log('VOIP');
                break;
            case PNT.PERSONAL_NUMBER:
                //console.log('PERSONAL_NUMBER');
                break;
            case PNT.PAGER:
                //console.log('PAGER');
                break;
            case PNT.UAN:
                //console.log('UAN');
                break;
            case PNT.UNKNOWN:
                //console.log('UNKNOWN');
                break;
        }
    });
    return filtered_numbers;
}

// export function send_photoselfie_data_to_merchant_email_old(data, callback){
//     console.log("email_data", data);
//     let mimemessage = require('mimemessage');
//     let mailContent = mimemessage.factory({contentType: 'multipart/mixed',body: []});
//
//     mailContent.header('From', config.aws_ses_from_email);
//     // let destinatari = [];
//     // destinatari.push(...data.to);
//
//     // console.log(destinatari);
//     data.to.forEach((email) => {
//         mailContent.header('To', email);
//     });
//
//     mailContent.header('Subject', config.aws_ses_from_email);
//
//     let alternateEntity = mimemessage.factory({
//         contentType: 'multipart/alternate',
//         body: []
//     });
//
//     let htmlData =
//         '<html>  '  +
//             '   <head></head>  '  +
//             '   <body>  '  +
//                 '   <h4>{{hello}} {{username}}, </h4>  '  +
//                 '   <p></p>  '  +
//                 '   <p>{{text_1}}</p>  '  +
//                 '   <p></p>  '  +
//                 '   <p>{{thank}}</p>  '  +
//                 '   <p>{{we_are}}</p>  '  +
//                 '   </body>  '  +
//             '  </html>  ';
//
//     htmlData = htmlData.replace('{{hello}}', data.hello);
//     htmlData = htmlData.replace('{{username}}', data.username);
//     htmlData = htmlData.replace('{{text_1}}', data.text_1);
//     htmlData = htmlData.replace('{{thank}}', data.thank);
//     htmlData = htmlData.replace('{{we_are}}', data.we_are);
//
//     let htmlEntity = mimemessage.factory({
//         contentType: 'text/html;charset=utf-8',
//         body: htmlData
//         // body:  '   <html>  '  +
//         //     '   <head></head>  '  +
//         //     '   <body>  '  +
//         //     '   <h3>{{hello}} {{username}}, </h3>  '  +
//         //     '   <p></p>  '  +
//         //     '   <p>{{text_1}}</p>  '  +
//         //     '   <p></p>  '  +
//         //     '   <p>{{thank}}</p>  '  +
//         //     '   <p>{{we_are}}</p>  '  +
//         //     '   </body>  '  +
//         //     '  </html>  ',
//     });
//
//
//
//     // let plainEntity = mimemessage.factory({
//     //     body: 'Please see the attached file for a list of customers to contact.'
//     // });
//     alternateEntity.body.push(htmlEntity);
//     // alternateEntity.body.push(plainEntity);
//
//     mailContent.body.push(alternateEntity);
//
//
//     //========================
//     //==== attach a file =====
//     //========================
//     // let excelFile = fs.readFileSync('Report_Photoselfie.csv');
//     let excelFile = fs.readFileSync(data.fileName);
//     let attachmentEntity = mimemessage.factory({
//         contentType: 'text/plain',
//         contentTransferEncoding: 'base64',
//         body: excelFile.toString('base64').replace(/([^\0]{76})/g, "$1\n")
//     });
//
//     attachmentEntity.header('Content-Disposition', 'attachment ;filename="Report_Photoselfie.csv"');
//
//     mailContent.body.push(attachmentEntity);
//
//     let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendRawEmail({
//         RawMessage: { Data: mailContent.toString() }
//     }).promise()
//
// // Handle promise's fulfilled/rejected states
//     sendPromise
//         .then(
//             function (data) {
//                 if (callback) callback(true);
//             })
//         .catch(
//             function (err) {
//                 console.log('error in send email');
//                 console.error(err, err.stack);
//                 if (callback) callback(err);
//             });
//
// }

export function send_photoselfie_data_to_merchant_email(data, callback){
    // console.log("email_data", data);
    let mimemessage = require('mimemessage');
    let mailContent = mimemessage.factory({contentType: 'multipart/mixed',body: []});

    mailContent.header('From', config.aws_ses_from_email);
    mailContent.header('To', data.to);

    mailContent.header('Subject', config.aws_ses_from_email);

    let alternateEntity = mimemessage.factory({
        contentType: 'multipart/alternate',
        body: []
    });

    let htmlData =
        '<html>  '  +
        '   <head></head>  '  +
        '   <body>  '  +
        '   <h4>{{hello}} {{username}}, </h4>  '  +
        '   <p></p>  '  +
        '   <p>{{text_1}}</p>  '  +
        '   <p></p>  '  +
        '   <p>{{thank}}</p>  '  +
        '   <p>{{we_are}}</p>  '  +
        '   </body>  '  +
        '  </html>  ';

    htmlData = htmlData.replace('{{hello}}', data.hello);
    htmlData = htmlData.replace('{{username}}', data.username);
    htmlData = htmlData.replace('{{text_1}}', data.text_1);
    htmlData = htmlData.replace('{{thank}}', data.thank);
    htmlData = htmlData.replace('{{we_are}}', data.we_are);

    let htmlEntity = mimemessage.factory({
        contentType: 'text/html;charset=utf-8',
        body: htmlData
    });

    // let plainEntity = mimemessage.factory({
    //     body: 'Please see the attached file for a list of customers to contact.'
    // });
    alternateEntity.body.push(htmlEntity);
    // alternateEntity.body.push(plainEntity);

    mailContent.body.push(alternateEntity);


    //========================
    //==== attach a file =====
    //========================
    // let excelFile = fs.readFileSync('Report_Photoselfie.csv');
    let excelFile = fs.readFileSync(data.fileName);
    let attachmentEntity = mimemessage.factory({
        contentType: 'text/plain',
        contentTransferEncoding: 'base64',
        body: excelFile.toString('base64').replace(/([^\0]{76})/g, "$1\n")
    });

    attachmentEntity.header('Content-Disposition', 'attachment ;filename="Report_Photoselfie.csv"');

    mailContent.body.push(attachmentEntity);

    let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendRawEmail({
        RawMessage: { Data: mailContent.toString() }
    }).promise()

// Handle promise's fulfilled/rejected states
    sendPromise
        .then(
            function (data) {
                if (callback) callback(true);
            })
        .catch(
            function (err) {
                console.log('error in send email');
                console.error(err, err.stack);
                if (callback) callback(err);
            });

}

// export function send_newsletter_coupon_bckp(data, callback) {
//     let params;
//     params = {
//         Destination: {
//             /* required */
//             ToAddresses: [
//                 data.email,
//                 /* more items */
//             ]
//         },
//         Source: config.aws_ses_from_email, /* required */
//         Template: "activation",
//         TemplateData: '{ \"hello\":\"' + 'ernest' + '\",\"confirm_account\":\"' + 'confirm account' + '\",\"welcome\":\"' + 'welcome' + '\",\"thanks\":\"' + 'thanks' + '\",\"activate\":\"' + 'data.activate' + '\",\"click\":\"' + 'data.click' + '\",\"confirm\":\"' + 'data.confirm' + '\",\"thank\":\"' + 'data.thank' + '\",\"name\":\"' + 'data.username' + '\",\"store_name\":\"' + data.store_name + '\",\"store_domain\":\"' + data.store_domain + '\" }', /* required */
//         // TemplateData: '{ ' +
//         //     '\"hello\":\"' + 'Ernest' +
//         //     '\",\"project_id\":\"' + data.project_id + '\",' +
//         //     '\"store_lang\":\"' + data.store_lang + '\", ' +
//         //     '\"store_name\":\"' + data.store_name + '\", ' +
//         //     '\"store_domain\":\"' + data.store_domain + '\", ' +
//         //     '\"code\":\"' + data.code + '\" }', /* required */
//         ReplyToAddresses: [
//             config.aws_ses_from_email,
//             /* more items */
//         ],
//     };
//
//     // Create the promise and SES service object
//     let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();
//
//     // Handle promise's fulfilled/rejected states
//     sendPromise.then(
//         function (data) {
//             //console.log('sent mail '+ data.MessageId);
//             if (callback) callback(true);
//         }).catch(
//         function (err) {
//             console.log('error in send email');
//             console.error(err, err.stack);
//             if (callback) callback(false);
//         });
// }

// export function send_newsletter_coupon_working(user, translation, order) {
//     return new Promise ((resolve, reject) => {
//         // Create sendEmail params
//         let params;
//         params = {
//             Destination: {
//                 /* required */
//                 ToAddresses: [
//                     user.email,
//                     /* more items */
//                 ]
//             },
//             Source: config.aws_ses_from_email, /* required */
//             Template: "confirmNewsletterSubscription",
//             TemplateData:
//                 '{ ' +
//                 '\"hello\":\"'+'Gentile'+'\",' +
//                 '\"name\":\"'+'ernest.vila'+'\",' +
//                 '\"text_1\":\"'+'Akinda è lieta di comunicarle che l\'iscrizione alla newsletter è avvenuta con successo. Di seguito potrà trovare:'+'\",' +
//                 '\"text_2\":\"'+'URL dello shop per l\'acquisto:'+'\",' +
//                 '\"url\":\"'+'academyfcvalsa.akinda.com'+'\",' +
//                 '\"text_3\":\"'+'Codice album protezione privacy per i prodotti che lo richiedono:'+'\",' +
//                 '\"code\":\"'+'29076'+'\",' +
//                 '\"text_4\":\"'+'Coupon del valore di 5,00 euro da utilizzare per il primo acquisto sullo shop:'+'\",' +
//                 '\"coupon\":\"'+'ALB20202020'+'\",' +
//                 '\"your_order\":\"'+'translation.your_order'+'\",' +
//
//
//                 '\"order_verify\":\"'+'translation.order_verify'+'\",' +
//                 '\"order_verify_2\":\"'+'translation.order_verify_2'+'\",' +
//
//                 '\"panel_url\":\"'+'user.panel_url'+'\",' +
//
//                 '\"thank\":\"'+'Grazie e buona giornata!'+'\",' +
//                 '\"store_name\":\"'+"Akinda"+'\",' +
//                 '\"store_domain\":\"'+user.store_domain+'\" ' +
//                 '}', /* required */
//
//             // '{ ' +
//             // '\"thank\":\"'+'Grazie e buona giornata!'+'\",' +
//             // '\"url\":\"'+'academyfcvalsa.akinda.com'+'\",' +
//             // '\"hello\":\"'+'Gentile'+'\",' +
//             // '\"code\":\"'+'29076'+'\",' +
//             // '\"coupon\":\"'+'ALB20202020'+'\",' +
//             // '\"name\":\"'+'ernest.vila'+'\",' +
//             // '\"store_name\":\"'+"Akinda"+'\",' +
//             // '\"store_domain\":\"'+user.store_domain+'\" ' +
//             // '}', /* required */
//             ReplyToAddresses: [
//                 config.aws_ses_from_email,
//                 /* more items */
//             ],
//         };
//
//         // Create the promise and SES service object
//         let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();
//
//         // Handle promise's fulfilled/rejected states
//         sendPromise.then(
//             function(data) {
//                 //console.log('sent mail '+ data.MessageId);
//                 resolve(user);
//             }).catch(
//             function(err) {
//                 console.log('error in send email');
//                 console.error(err, err.stack);
//                 reject(err)
//             });
//     });
// }

export function send_newsletter_coupon_live(data, callback) {
// Create sendEmail params
    let params;

    if (data.activeStore == 1) {
        params = {
            Destination: {
                /* required */
                ToAddresses: [
                    data.user_email,
                    /* more items */
                ]
            },
            Source: config.aws_ses_from_email, /* required */
            Template: "confirmNewsletterSubscription",
            TemplateData:
                '{ ' +
                '\"hello\":\"' + data.hello + '\",' +
                '\"name\":\"' + data.username + '\",' +
                '\"text_1\":\"' + data.text_1 + '\",' +
                '\"text_2\":\"' + data.text_2 + '\",' +
                '\"url\":\"' + data.url + '\",' +
                '\"text_3\":\"' + data.text_3 + '\",' +
                '\"code\":\"' + data.code + '\",' +
                '\"text_4\":\"' + data.text_4 + '\",' +
                '\"coupon\":\"' + data.coupon + '\",' +
                '\"thank\":\"' + data.thank + '\",' +
                '\"store_name\":\"' + data.store_name + '\",' +
                '\"store_domain\":\"' + data.store_domain + '\" ' +
                // '\"newsletter_unsubscribe_text\":\"' + data.newsletter_unsubscribe_text + '\" ' +
                // '\"newsletter_unsubscribe_btn\":\"' + data.newsletter_unsubscribe_btn + '\" ' +
                // '\"newsletter_unsubscribe_text_one\":\"' + data.newsletter_unsubscribe_text_one + '\" ' +
                '}', /* required */
            ReplyToAddresses: [
                config.aws_ses_from_email,
                /* more items */
            ],
        };
    } else {
        params = {
            Destination: {
                /* required */
                ToAddresses: [
                    data.user_email,
                    /* more items */
                ]
            },
            Source: config.aws_ses_from_email, /* required */
            Template: "couponBonusFromNewsletter",
            TemplateData:
                '{ ' +
                '\"hello\":\"' + data.hello + '\",' +
                '\"name\":\"' + data.username + '\",' +
                '\"text_1\":\"' + data.text_1 + '\",' +
                '\"text_4\":\"' + data.text_4 + '\",' +
                '\"coupon\":\"' + data.coupon + '\",' +
                '\"thank\":\"' + data.thank + '\",' +
                '\"store_name\":\"' + data.store_name + '\",' +
                '\"store_domain\":\"' + data.store_domain + '\" ' +
                // '\"newsletter_unsubscribe_text\":\"' + data.newsletter_unsubscribe_text + '\" ' +
                // '\"newsletter_unsubscribe_btn\":\"' + data.newsletter_unsubscribe_btn + '\" ' +
                // '\"newsletter_unsubscribe_text_one\":\"' + data.newsletter_unsubscribe_text_one + '\" ' +
                '}', /* required */
            ReplyToAddresses: [
                config.aws_ses_from_email,
                /* more items */
            ],
        };
    }

// Create the promise and SES service object
    let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

// Handle promise's fulfilled/rejected states
    sendPromise.then(
        function (data) {
            if (callback) callback(true);
        }).catch(
        function (err) {
            console.log('error in send email');
            console.error(err, err.stack);
            if (callback) callback(false);
        });
}

export function send_newsletter_coupon(data, callback) {
    // console.log("email_data", data);

// Create sendEmail params
    let params;

    if (data.activeStore == 1) {
        params = {
            Destination: {
                /* required */
                ToAddresses: [
                    data.user_email,
                    /* more items */
                ]
            },
            Source: config.aws_ses_from_email, /* required */
            Template: "newsletterSubscription",
            TemplateData:
                '{ ' +
                '\"hello\":\"' + data.hello + '\",' +
                '\"name\":\"' + data.username + '\",' +
                '\"text_1\":\"' + data.text_1 + '\",' +
                '\"text_2\":\"' + data.text_2 + '\",' +
                '\"url\":\"' + data.url + '\",' +
                '\"text_3\":\"' + data.text_3 + '\",' +
                '\"code\":\"' + data.code + '\",' +
                '\"text_4\":\"' + data.text_4 + '\",' +
                '\"coupon\":\"' + data.coupon + '\",' +
                '\"text_8\":\"' + data.text_8 + '\",' +
                '\"thank\":\"' + data.thank + '\",' +
                '\"text_5\":\"' + data.text_5 + '\",' +
                '\"text_6\":\"' + data.text_6 + '\",' +
                '\"text_7\":\"' + data.text_7 + '\",' +
                '\"unsubscribe_url\":\"' + data.unsubscribe_url + '\",' +
                '\"store_name\":\"' + data.store_name + '\",' +
                '\"store_domain\":\"' + data.store_domain + '\" ' +
                '}', /* required */
            ReplyToAddresses: [
                config.aws_ses_from_email,
                /* more items */
            ],
        };
    } else {
        params = {
            Destination: {
                /* required */
                ToAddresses: [
                    data.user_email,
                    /* more items */
                ]
            },
            Source: config.aws_ses_from_email, /* required */
            Template: "bonusFromNewsletterSubscription",
            TemplateData:
                '{ ' +
                '\"hello\":\"' + data.hello + '\",' +
                '\"name\":\"' + data.username + '\",' +
                '\"text_1\":\"' + data.text_1 + '\",' +
                '\"text_4\":\"' + data.text_4 + '\",' +
                '\"coupon\":\"' + data.coupon + '\",' +
                '\"text_8\":\"' + data.text_8 + '\",' +
                '\"thank\":\"' + data.thank + '\",' +
                '\"text_5\":\"' + data.text_5 + '\",' +
                '\"text_6\":\"' + data.text_6 + '\",' +
                '\"text_7\":\"' + data.text_7 + '\",' +
                '\"unsubscribe_url\":\"' + data.unsubscribe_url + '\",' +
                '\"store_name\":\"' + data.store_name + '\",' +
                '\"store_domain\":\"' + data.store_domain + '\" ' +
                '}', /* required */
            ReplyToAddresses: [
                config.aws_ses_from_email,
                /* more items */
            ],
        };
        // console.log(params);
    }

// Create the promise and SES service object
    let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

// Handle promise's fulfilled/rejected states
    sendPromise.then(
        function (data) {
            if (callback) callback(true);
            // if (callback) callback({"ok": "email sent"});
        }).catch(
        function (err) {
            console.log('error in send email');
            console.error(err, err.stack);
            if (callback) callback(false);
            // if (callback) callback({"error_email": err.stack});
        });
}


export function send_landingpage_data_to_akinda_email(data, callback) {
    // console.log("email_data", data);
    let mimemessage = require('mimemessage');
    let mailContent = mimemessage.factory({contentType: 'multipart/mixed', body: []});


    mailContent.header('From', config.aws_ses_from_email);
    mailContent.header('To', data.to);

    mailContent.header('Subject', 'LANDING ' + data.type.toUpperCase() + ' ' + data.lingua.toUpperCase());

    let alternateEntity = mimemessage.factory({
        contentType: 'multipart/alternate',
        body: []
    });

    let htmlData =
        '<html>  ' +
        '   <head></head>  ' +
        '   <body>  ' +
        // '   <h4>{{hello}} {{username}}, </h4>  ' +
        // '   <p></p>  ' +
        '   <p>Nome società: {{nomeSocieta}}</p>  ' +
        '   <p></p>  ' +
        '   <p>Nome e Cognome: {{nome_cognome}}</p>  ' +
        '   <p></p>  ' +
        '   <p>Città: {{citta}}</p>  ' +
        '   <p></p>  ' +
        '   <p>Provincia: {{provincia}}</p>  ' +
        '   <p></p>  ' +
        '   <p>CAP: {{cap}}</p>  ' +
        '   <p></p>  ' +
        '   <p>Cellulare: {{phone}}</p>  ' +
        '   <p></p>  ' +
        '   <p>Email: {{email}}</p>  ' +
        '   <p></p>  ' +
        '   </body>  ' +
        '  </html>  ';

    htmlData = htmlData.replace('{{nomeSocieta}}', data.nomeSocieta);
    htmlData = htmlData.replace('{{nome_cognome}}', data.nome_cognome);
    htmlData = htmlData.replace('{{citta}}', data.citta);
    htmlData = htmlData.replace('{{provincia}}', data.provincia);
    htmlData = htmlData.replace('{{cap}}', data.cap);
    htmlData = htmlData.replace('{{phone}}', data.phone);
    htmlData = htmlData.replace('{{email}}', data.email);

    let htmlEntity = mimemessage.factory({
        contentType: 'text/html;charset=utf-8',
        body: htmlData
    });


    alternateEntity.body.push(htmlEntity);
    mailContent.body.push(alternateEntity);

    let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendRawEmail({
        RawMessage: {Data: mailContent.toString()}
    }).promise()

// Handle promise's fulfilled/rejected states
    sendPromise
        .then(
            function (data) {
                if (callback) callback(true);
            })
        .catch(
            function (err) {
                console.log('error in send email');
                console.error(err, err.stack);
                if (callback) callback(err);
            });

}