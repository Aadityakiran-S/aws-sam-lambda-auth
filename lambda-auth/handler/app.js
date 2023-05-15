const AWS = require("aws-sdk");
const uuid = require('uuid');
require('dotenv').config();

//#region Signup and Login Params
var signupParams = {
    ClientId: '7hmno6nbv8pat1sd3ikjfvh7sr', /* required */
    Password: 'password', /* required */
    Username: 'aadityakiran.s@inapp.com', /* required */
    UserAttributes: [
        {
            Name: 'email', /* required */
            Value: 'aadityakiran.s@inapp.com'
        },
    ]
};
var confirmationParams = {
    UserPoolId: 'ap-south-1_LqLoBIsNc', /* required */
    Username: 'aadityakiran.s@inapp.com', /* required */
};
var authParams = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: '7hmno6nbv8pat1sd3ikjfvh7sr',
    AuthParameters: {
        USERNAME: 'aadityakiran.s@inapp.com',
        PASSWORD: 'password'
    }
};
//#endregion

//#region AWS credential configuration
AWS.config.update({ region: 'ap-south-1' });
AWS.config.credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
AWS.config.credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
//#endregion

var client = new AWS.CognitoIdentityServiceProvider();

exports.lambdaAuth = async (event, context) => {
    try {
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'You are authorized',
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};

exports.logInUser = async (event, context) => {
    let body = {};
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };
    const parsedData = JSON.parse(event.body);

    authParams.AuthParameters.USERNAME = parsedData.username;
    authParams.AuthParameters.PASSWORD = parsedData.password;
    try {
        const loginResult = await new Promise((resolve, reject) => {
            client.initiateAuth(authParams, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    statusCode = 500;
                    body = JSON.stringify(err);
                    reject(err);
                } else {
                    resolve(data);
                    console.log(data);
                }
            });
        })
        console.log(loginResult);
        body.message = JSON.stringify(loginResult);
    } catch (error) {
        console.log(error);
        statusCode = 500;
        return {
            statusCode,
            body,
            headers,
        };
    }

    return {
        statusCode,
        body,
        headers,
    };
}

exports.signUpUser = async (event, context) => {
    let body = {};
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };
    const parsedData = JSON.parse(event.body);

    signupParams.Password = parsedData.password;
    signupParams.Username = parsedData.username;
    signupParams.UserAttributes[0].Value = parsedData.username;

    confirmationParams.Username = parsedData.username;

    try {
        const signUpResult = await new Promise((resolve, reject) => {
            client.signUp(signupParams, function (err, data) {
                if (err) {// an error occurred
                    console.log(err, err.stack);
                    statusCode = 500;
                    reject(err);
                }
                else {// successful response
                    console.log(data);
                    resolve(data);
                }
            });
        })
        console.log(signUpResult);
        body.signUpResult = JSON.stringify(signUpResult);

        const confirmResult = await new Promise((resolve, reject) => {
            client.adminConfirmSignUp(confirmationParams, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    statusCode = 500;
                    reject(err);
                } else {
                    console.log(data);
                    resolve(data);
                }
            });
        });
        console.log(confirmResult);
        body.confirmResult = JSON.stringify(confirmResult);
    }
    catch (err) {
        console.log(err, err.stack);
        statusCode = 500;
        body = JSON.stringify(err);
        return {
            statusCode,
            body,
            headers,
        }
    }

    return {
        statusCode,
        body,
        headers,
    };
}
