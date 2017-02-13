---
layout: default
permalink: /labs/7/
---

# Lab 7: Web Security

In this lab, you are going to secure our application. 

###  Recommended work setup

This lab has a starter code that can be found on the course Github repository `/labs/7/microblog/app`. 

### Submission

You should push your work to Github at the end of your practical session. 

## HTTPS 

As seen in the lecture, HTTPS provides two secure mechanisms between the client and the server:

1. an end-to-end secure channel
1. an authentication handshake

To setup HTTPS, you need two assets:

1. a secret key that must be remained secret and stored on the server
1. a public certificate that will be sent to the browser to initiate the HTTPS connection 

These two assets can be generated using the following interactive command:

```
$ openssl req -x509 -nodes -newkey rsa:4096 -keyout server.key -out server.crt
```

You can check the information of your newly generated certificate with the following command: 

```
openssl x509 -in server.crt -text -noout
```

Once you have generated the private key and the certificate, you need to configure the application to use HTTPS instead of HTTP. As discussed in class, it is strongly recommended **not** to have both. 

```
var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};
https.createServer(config, app).listen(3000, function () {
    console.log('HTTPS on port 3030');
});
```

**Task:** Generate a certificate and enable HTTPS on the port 3000. Test your application and make sure that all requests are now secured with HTTPS.   

## Validating inputs

As seen in the lecture, an attacker could instrument your application to inject arbitrary HTML code (content spoofing) and/or arbitrary javascript code (cross-site scripting) that could be interpreted by the browser. In addition, we have seen that the latter type of vulnerability comes in different forms: reflected, stored and DOM-based. 

The examples shown in class have been written to illustrate each vulnerability separately. However, in more complex web applications, these vulnerabilities might not always appear as easy to identify and to exploit. 

As an example, it is obvious that our application is vulnerable to a content spoofing attack when posting a message with the following payload: 

```
<h1>Hello World!</h1>
```

However, one might think that it is thus possible to exploit a stored cross-site scripting vulnerability with the following payload: 

```
<script>alert(document.cookie)</script>
```

If you try it (and you should), you will notice that it does not work. This is because the DOM is modified through the `innerHTML` property that does not activate embedded scripts like the method `write` would do. However, it is possible to turn this reflected XSS attack into a DOM-based XSS attack with the following payload: 

```
<img src="a" onerror="alert(document.cookie);">
```

Whatever the attack (content-spoofing, stored XSS, DOM-based XSS), these kind of vulnerabilities could be mitigated by a thorough validation on users' inputs on both frontend and backend meaning: 

- on the client-side, all data harvested from the browser that the user could access (URL, forms and so on) regardless whether they will later be sent to the server or used directly to modify the DOM
- on the server-side, all data harvested from HTTP requests (URL, headers, body and so on) regardless on how these requests are supposed to be crafted on the frontend

For the purpose of this lab, we are going to concentrate our efforts on the backend. The goal is to validate all data that comes to the server using of one of the many express middleware. For instance, you could use the `express-validator` middleware.  

**Task:** For each routing function, validate all data harvested from HTTP requests. 

## Protecting cookies

So far, our application is currently setting two cookies:

1. the `session.id` used for authentication on the backend
1. the `username` used for some ajax requests on the frontend

In this part, we are going to protect these two cookies against three kind of attacks using special cookie flags: 

- the `HttpOnly` flag to prevent cross-site scripting attacks 
- the `Secure` flag to prevent Eavesdropping (via a mixed-content vulnerability)
- the `SameSite` flag to prevent cross-site request forgery attacks

### HttpOnly Flag

As you could see in the previous exercise, an attacker could exploit an XSS vulnerability to steal information stored in the cookies. Although, we have identified and patched one cross-site scripting vulnerability previously, we cannot be 100% sure that our application is secured. If there is another of such a vulnerability, it would be good to make sure that our cookie cannot be read by an arbitrary javascript code.

As you may have noticed already in the previous exercise, while exploiting the XSS vulnerability, the `session.id` cookie was not read by the javascript payload, only the `username` was. This is because the `session.id` cookie has the `HttpOnly` flag (set by default by the `express-session` middleware) that makes it unreadable by javascript and its solely purpose it for the browser to send it back to the server.  

The `username` cookie does not have the `HttpOnly` flag set since it is not used for the authentication session. While it is technically feasible to set it up, it is actually not possible to set this flag without breaking the application. 

**Task:** Using the `cookie-parser` documentation, set the `HttpOnly` flag for the cookie `username` and undertand why the application is no longer working.

### Secure Flag

As seen in the lecture, a mixed-content vulnerability on an HTTPS page might exposed sensitive data such as the `session.id`. To prevent any potential mixed-content vulnerability to leak a cookie value, there is another cookie flag called `Secure`, that instruct the browser to re-attach cookies with HTTPS requests only (and not plain HTTP ones). 

**Task:** Using the `express-session` documentation and the `cookie-parser`, add the `Secure` flag to the two cookies `session.id` and `username`. 

### SameSite Flag

As seen in the lecture, cookies are typically sent to third parties with cross-origin requests. This can be abused by CSRF attacks. One way to avoid specific cookies to be sent with cross-origin requests is to set a special flag called `SameSite`. 

**Task:** Using the `express-session` documentation and the `cookie-parser`, add the `SameSite` flag to the two cookies `session.id` and `username`. 







