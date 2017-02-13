---
layout: default
permalink: /assignment/2/doc/
---

# Assignment 2: API Documentation

## Picture API

### Create via URL

- description: create a new picture
- request: `POST /api/picture/url/`
    - content-type: `application/json`
    - body: object
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link: (string) the URL of the image
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the URL of the picture

```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"content":"hello world","author":"me", "link":"https://www.hello.com/img_/hello_logo_hero.png"}
       http://localhsot:3000/api/picture/url/'
```

### Create via Local Picture

- description: create a new picture
- request: `POST /api/picture/url/`
    - content-type: `application/formdata`
    - body: object
      - content: (string) the title of the picture
      - author: (string) the authors username
      - picture: (file) encoded picture
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture

```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"content":"hello world","author":"me", "link":"https://www.hello.com/img_/hello_logo_hero.png"}
       http://localhsot:3000/api/picture/url/'
```

### Read

- description: retrieve a picture given id, if id is not provided the first image is returned
- request: `GET api/picture/:id/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture

```
$ curl http://localhsot:3000/api/picture/0/
```

### Read

- description: retrieve the next picture given current picture's id
- request: `GET api/picture/next/:id/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture
- response: 404
    - body: next picture does not exists
```
$ curl http://localhsot:3000/api/picture/next/1/
```

### Read

- description: retrieve the previous picture given current picture's id
- request: `GET api/picture/prev/:id/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - id: (string) the picture id
      - content: (string) the title of the picture
      - author: (string) the authors username
      - link:(string) the path of the picture
- response: 404
    - body: previous picture does not exists
```
$ curl http://localhsot:3000/api/picture/prev/1/
```

### Delete

- description: delete a picture
- request: `DELETE /api/picture/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
        - None
- response: 404
    - body: picture :id does not exists

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
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes

```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"content":"hello world","author":"me"}
       http://localhsot:3000/api/messages/'
```

### Read

- description: retrieve the last 10 messages
- request: `GET /api/messages/[?limit=10]`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes

```
$ curl http://localhsot:3000/api/messages/
```

###  Update

- description: retrieve the message id
- request: `GET /api/messages/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes
- response: 404
    - body: message id does not exists

```
$ curl http://localhsot:3000/api/messages/jed5672jd90xg4awo789/
```

### Update

- description: upvote or downvote the message id
- request: `PATCH /api/messages/:id/`
    - content-type: `application/json`
    - body: object
      - action: (string) either `upvote` or `downvote`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the message id
      - content: (string) the content of the message
      - author: (string) the authors username
      - upvote: (int) the number of upvotes
      - downvote: (int) the number of downvotes
- response: 204
    - body: invalid argument
- response: 404
    - body: message :id does not exists

```
$ curl -X PATCH
       -H 'Content-Type: application/json'
       -d '{"action":"upvote"}
       http://localhsot:3000/api/messages/jed5672jd90xg4awo789/'
```


### Delete

- description: delete the message id
- request: `DELETE /api/messages/:id/`
- response: 200
    - content-type: `application/json`
    - body: object
        - _id: (string) the message id
        - content: (string) the content of the message
        - author: (string) the authors username
        - upvote: (int) the number of upvotes
        - downvote: (int) the number of downvotes
- response: 404
    - body: message :id does not exists

```
$ curl -X DELETE
       http://localhsot:3000/api/messages/jed5672jd90xg4awo789/
```
