# GraphQL for Parse Server

[![Travis build status](http://img.shields.io/travis/thebakeryio/parse-graphql-server.svg?style=flat)](https://travis-ci.org/thebakeryio/parse-graphql-server)
[![Code Climate](https://codeclimate.com/github/thebakeryio/parse-graphql-server/badges/gpa.svg)](https://codeclimate.com/github/thebakeryio/parse-graphql-server)
[![Test Coverage](https://codeclimate.com/github/thebakeryio/parse-graphql-server/badges/coverage.svg)](https://codeclimate.com/github/thebakeryio/parse-graphql-server/coverage)
[![Dependency Status](https://david-dm.org/thebakeryio/parse-graphql-server.svg)](https://david-dm.org/thebakeryio/parse-graphql-server)
[![devDependency Status](https://david-dm.org/thebakeryio/parse-graphql-server/dev-status.svg)](https://david-dm.org/thebakeryio/parse-graphql-server#info=devDependencies)

## When to use

- you are using Parse SDK (web or mobile) coupled with Parse Server running on Express
- you are using GraphQL
- you want to control access to Parse models in your resolvers using Parse ACL system
- you are using [parse-graphql-client](https://github.com/thebakeryio/parse-graphql-client) package

## Quick start

```bash
npm install --save graphql parse-graphql-server parse
```

```javascript
import express from 'express';
import Parse from 'parse/node';
import parseGraphQLHTTP from 'parse-graphql-server';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

const Todo = Parse.Object.extend('Todo');

const TodoType = new GraphQLObjectType({
  name: 'Todo',
  description: 'Item in todo list',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    text: {
      type: GraphQLString,
      resolve: todo => todo.get('text'),
    },
    isComplete: {
      type: GraphQLBoolean,
      resolve: todo => todo.get('isComplete'),
    },
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      todos: {
        type: new GraphQLList(TodoType),
        resolve: (_, args, { user, Query }) => {
          const query = new Query(Todo);
          return query.find();
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addTodo: {
        type: Todo.SchemaType,
        description: 'Create a new todo item',
        args: {
          text: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_, { text }, { Query, user }) => {
          const newTodo = new Query(Todo).create({ text, isComplete: false });
          if (user) {
            newTodo.setACL(new Parse.ACL(user));
          }
          return newTodo.save().then(td => td);
        },
      },
      deleteTodo: {
        type: Todo.SchemaType,
        description: 'Delete a todo',
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: (_, { id }, { Query }) =>
          new Query(Todo).get(id).then((todo) => {
            if (todo) {
              return todo.destroy();
            }
            return todo;
          }),
      },
    },
  }),
});

const app = express();
app.use('/graphql', parseGraphQLHTTP({ schema, graphiql: true, }));

app.listen(process.env.PORT, () => {
  console.log('server running');
});
```

## Writing resolvers

When using Parse GraphQL server package, all your GraphQL resolvers include authentication information and updated version of Parse.Query that passes ACL info along to make sure your queries are authenticated

```
{
  resolve: (_, args, { Query, user }) => {
    // **Query** is a patched version of Parse.Query that
    // includes session token information for the currently authenticated 
    // user (if any)
    // It also extends basic Parse.Query to include a **create** method:
    // const newTodo = new Query(Todo).create({ text, isComplete: false });
    //
    // **user** is an instance of Parse.User set to the authenticated user (if any)
  },
}
``` 

## Client side

Parse GraphQL server looks for **Authorization** header set to the session token of the current Parse User. [Parse GraphQL client](https://github.com/thebakeryio/parse-graphql-client) sets this up for you automatically.  

## See it in action

- [TodoMVC using React Native](https://github.com/thebakeryio/todomvc-react-native)

## Credits

Parse GraphQL server relies heavily on [Express GraphQL package](https://github.com/graphql/express-graphql).