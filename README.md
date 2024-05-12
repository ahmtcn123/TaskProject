# TODOApp

- Creating / Editing / Deleting Todos
- Uploading / Deleting Attachments via Edit Todo View
- Thumbnail photo for each todo on Create / Edit Todo View
- JWT Token based authentication
- text search for todos, can search tags, title, description but case sensitive.

# Project

## Backend
Backend is a simple Rest API powered by Express.js and PostgreSQL, its written in TypeScript and as a orm it uses prisma. It has two sub routes named "auth" and "todos". Auth is used for user authentication, with single mail and password users can login and register to the app, user's passwords are hashed salted and stored in the database. Todos is used for CRUD operations on todos, you can edit, create and delete todos, also the attachement of files is supported you can upload multiple files or delete them. Todos has a title, description, isDone as boolean, thumbnail photo and attachments. All todo operations are protected by JWT token, so you need to be logged in to perform any operation on todos.

## Frontend
Frontend is a simple React app, its written in TypeScript and uses Material-UI for styling. It has three main pages, Login, Register and Todos. Login and Register pages are used for user authentication, and Todos page is used for CRUD operations on todos. Todos page has a form for creating new todos, editing and listing available todos. You can also delete todos and their attachments. All the todo operations are protected by JWT token, so you need to be logged in to perform any operation on todos.


## How to run the project
You can just `docker-compose up` in the root directory of the project, it will start the backend and frontend servers, and also the database. You can access the frontend on `localhost:80` and backend on `localhost:3000`. You can also start frontend and backend separately by running `yarn run dev` on both frontend and backend directories, but you need to have a PostgreSQL database running on `localhost:5432` for the backend to work. If somehow `docker-compose up` does not work, please try again.

## What could be improved
Im using bcrypt for hashing passwords, but Im not sure about how secure it is for timing attacks. Backend looks fine as a simple todo app, but it could be improved by adding more features like user roles, user permissions, user profile, user settings, etc. Frontend could be improved by adding more features like drag and drop for attachments, better styling, and more beautiful UI.
