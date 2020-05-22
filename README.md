# All A-Board Server

This is the server component of All A-Board. View the (main project page)[https://github.com/ammubhave/all-aboard] for All A-Board for getting started instructions.

## Running the server

For development purposes, you can run the following command to start the server in dev mode. This command runs the server under nodemon, which will automatically restart the server when it detects changes.

```
npm run dev
```

The server is started at `http://localhost:3000`.

## Deployment

A production version of this is running on Heroku, and tracks the master branch of this repo. You can setup direct push to heroku by running

```
heroku git:remote -a all-aboard-server
```
