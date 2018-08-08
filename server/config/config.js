let env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test'){
  let config = require('./config.json');
  let envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}

// $ cd c:/Users/scare/OneDrive/Projects/udemy/node-todo-api
// $ heroku config
// $ heroku config:set key=value




// K6BKBvWjhS4xDleuIvI8U6tO4qpVg9byCss6VBqPaexu5JxqAso9Psn0RaD3wWNx
