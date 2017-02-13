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
    - body: object
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
    - body: object
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
    - body: object
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
    - body: None
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
      - pid: (int) the id of associated picture
      - content: (string) the content of the message
      - author: (string) the authors username
      - createdAt (Date) time of creation
      - updatedAt (Date) time of last modification

```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"content":"hello world","author":"me", "pid":0}
       http://localhsot:3000/api/comment/'
```

### Read

- description: retrieve the last 10 messages based on offset set (ex. msg=[1-20], offset=2, res = [9-18])
- request: `GET /api/comments/:id/:offset`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - \_id: (string) the message id
      - pid: (int) the id of associated picture
      - content: (string) the content of the message
      - author: (string) the authors username
      - createdAt (Date) time of creation
      - updatedAt (Date) time of last modification

```
$ curl http://localhsot:3000/api/comments/0/10/
```

### Delete

- description: delete the message at mid that is a comment of pid
- request: `DELETE /api/comment/:pid/:mid`
- response: 200
    - content-type: `application/json`
    - body: None
- response: 404
    - body: message :id does not exists

```
$ curl -X DELETE
       http://localhsot:3000/api/comment/0/jed5672jd90xg4awo789/
```
