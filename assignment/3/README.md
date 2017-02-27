---
layout: default
permalink: /assignment/3/doc/
---

# Assignment 2: API Documentation

## Frontend API

### READ Root file

- description: retrieve root location
- request: `GET /`   
- response: 200 | Redirected to signin if not logged in
    - content-type: `application/json`
    - body: None

```
$ curl http://localhsot:3000/
```

### READ Galleries

- description: retrieve Galleries webpage
- request: `GET /galleries.html`   
- response: 200 | Redirected to signin if not logged in
    - content-type: `application/json`
    - body: None

```
$ curl http://localhsot:3000/galleries.html
```

### READ Signout

- description: sign out of webpage
- request: `GET /signout/`   
- response: 200
    - content-type: `application/json`
    - body: None
    - Redirect: signin.html
- response: 500 if session not found

```
$ curl http://localhsot:3000/signout/
```


## Log In/Out API

### Signin

- description: sign in to an account
- request: `POST /api/signin/`
    - content-type: `application/json`
    - body: object
      - username: (string) the username
      - password: (string) the password
- response: 200
    - content-type: `application/json`
    - body: object
      - username: (string) the username
- response: 500 if server error
- response: 401 if username and password don't match
- response: 400 if username or password are empty

```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"username":"42","password":"42"}
       http://localhsot:3000/api/signin/'
```

### READ Signout

- description: sign out of webpage
- request: `GET /api/signout/`   
- response: 200 | 500 if session not found
    - content-type: `application/json`
    - body: None
    - Redirect: signin.html

```
$ curl http://localhsot:3000/api/signout/
```


## User Based API

### Create User

- description: create a new user
- request: `PUT /api/users/`
    - content-type: `application/json`
    - body: object
      - username: (string) the username
      - password: (string) the password
- response: 200
    - content-type: `application/json`
    - body: object
      - username: (string) the username
- response: 500 if server error
- response: 409 if username already exists

```
$ curl -X PUT
       -H "Content-Type: `application/json`"
       -d '{"username":"42","password":"42"}
       http://localhsot:3000/api/users/'
```

### Read User's Gallery

- description: retrieve a given user's gallery
- request: `GET api/picture/gallery/:user/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture
- response: 403 if Unauthorized
- response: 400 if there are no pictures

```
$ curl http://localhsot:3000/api/picture/gallery/42/
```

### Read User with Galleries

- description: retrieve a list of users that have a gallery based on amount and offset
- request: `GET api/picture/gallery/:offset/:amount`   
- response: 200
    - content-type: `application/json`
    - body: list of object
      - username: (string) the username of a user that has a gallery
- response: 403 if Unauthorized

```
$ curl http://localhsot:3000/api/picture/gallery/0/10/
```

### Read

- description: retrieve the next picture given current picture's id and a user's gallery
- request: `GET api/picture/:user/next/:id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture
- response: 404
    - body: next picture does not exists
- response: 403 if Unauthorized

```
$ curl http://localhsot:3000/api/picture/:user/next/1/
```

### Read

- description: retrieve the previous picture given current picture's id and a user's gallery
- request: `GET api/picture/:user/prev/:id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture
- response: 404
    - body: previous picture does not exists
- response: 403 if Unauthorized

```
$ curl http://localhsot:3000/api/picture/:user/prev/1/
```


## Picture API

### Create via URL

- description: create a new picture
- request: `POST /api/picture/url/`
    - content-type: `application/json`
    - body: object
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link: (string) the URL of the image
      - upload: false
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the URL of the picture
- response: 403 if Unauthorized

```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"content":"hello world","author":"me", "link":"https://www.hello.com/img_/hello_logo_hero.png"}
       http://localhsot:3000/api/picture/url/'
```

### Create via Local Picture

- description: create a new picture
- request: `POST /api/picture/local/`
    - content-type: `application/formdata`
    - body: object
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link: (file) encoded picture
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(file) encoded picture
      - upload: true
- response: 403 if Unauthorized

```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"content":"hello world","author":"me", "link":file}
       http://localhsot:3000/api/picture/local/'
```

### Read

- description: retrieve a picture given id, if id is not provided the first image is returned
- request: `GET api/picture/:id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture
- response: 404 if picture does not exists
- response: 403 if Unauthorized

```
$ curl http://localhsot:3000/api/picture/0/
```

### Read

- description: retrieve a picture given id, assuming it was locally stored
- request: `GET api/picture/:id/local`   
- response: 200
    - content-type: `picture.mimetype`
    - body: file
      - send the encoded picture file if saved locally
- response: 404 if picture does not exists
- response: 403 if Unauthorized

```
$ curl http://localhsot:3000/api/picture/0/
```


### Read

- description: retrieve the next picture given current picture's id
- request: `GET api/picture/next/:id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture
- response: 404
    - body: next picture does not exists
- response: 403 if Unauthorized

```
$ curl http://localhsot:3000/api/picture/next/1/
```

### Read

- description: retrieve the previous picture given current picture's id
- request: `GET api/picture/prev/:id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture
- response: 404
    - body: previous picture does not exists
- response: 403 if Unauthorized

```
$ curl http://localhsot:3000/api/picture/prev/1/
```

### Delete

- description: delete a picture
- request: `DELETE /api/picture/:id/`
- response: 200
    - content-type: `application/json`
    - body: None
- response: 404
    - body: picture :id does not exists
- response: 403 if Unauthorized

```
$ curl -X DELETE
       http://localhsot:3000/api/messages/jed5672jd90xg4awo789/
```


## Message API

### Create

- description: create a new message
- request: `POST /api/comment/`
    - content-type: `application/json`
    - body: object
      - pid: (int) the id of associated picture
      - content: (string) the content of the message
      - author: (string) the authors username
- response: 200
    - content-type: `application/json`
    - body: object
      - \_id: (string) the message id
      - pid: (int) the id of associated picture
      - content: (string) the content of the message
      - author: (string) the authors username
      - createdAt (Date) time of creation
      - updatedAt (Date) time of last modification
- response: 403 if Unauthorized

```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"content":"hello world","author":"me", "pid":0}
       http://localhsot:3000/api/comment/'
```

### Read

- description: retrieve the last 10 messages based on offset set (ex. msg=[1-20], offset=2, amount=10 res = [9-18])
- request: `GET /api/comments/:id/:offset/:amount`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - \_id: (string) the message id
      - pid: (int) the id of associated picture
      - content: (string) the content of the message
      - author: (string) the authors username
      - createdAt (Date) time of creation
      - updatedAt (Date) time of last modification
- response: 403 if Unauthorized

```
$ curl http://localhsot:3000/api/comments/0/10/10/
```

### Delete

- description: delete the message at mid that is a comment of pid
- request: `DELETE /api/comment/:pid/:mid`
- response: 200
    - content-type: `application/json`
    - body: None
- response: 404
    - body: message :id does not exists
- response: 403 if Unauthorized

```
$ curl -X DELETE
       http://localhsot:3000/api/comment/0/jed5672jd90xg4awo789/
```
