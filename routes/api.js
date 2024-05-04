/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const dns = require('dns');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

let collection;

new MongoClient(process.env.MONGODB_URI).connect()
  .then((client) => {
    collection = client.db('personal_library').collection('books');
    console.log('Connected to database');
  })
  .catch((err) => console.error(err));

function checkIdParam(req, res, next) {
  const { _id } = req.params;

  if (!_id || !ObjectId.isValid(_id)) {
    return res.send('no book exists');
  }

  next();
}

module.exports = function (app) {
  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await collection.find().toArray();

        return res.json(books);
      } catch (err) {
        console.error(err);
      }
    })

    .post(async function (req, res) {
      try {
        let { title } = req.body;

        if (!title) {
          return res.send('missing required field title');
        }

        const result = await collection.insertOne({ title, commentcount: 0, comments: [] });

        return res.json({ _id: result.insertedId, title });
      } catch (err) {
        console.error(err);
      }
    })

    .delete(async function (req, res) {
      try {
        await collection.deleteMany();

        return res.send('complete delete successful');
      } catch (err) {
        console.error(err);
      }
    });

  app.route('/api/books/:_id')
    .get(checkIdParam, async function (req, res) {
      try {
        let { _id } = req.params;

        const result = await collection.findOne({ _id: ObjectId.createFromHexString(_id) });

        if (!result) {
          return res.send('no book exists');
        }

        return res.json(result);
      } catch (err) {
        console.error(err);
      }
    })

    .post(checkIdParam, async function (req, res) {
      try {
        let { _id } = req.params;
        let { comment } = req.body;

        if (!comment) {
          return res.send('missing required field comment');
        }

        const result = await collection.findOneAndUpdate(
          { _id: ObjectId.createFromHexString(_id) },
          {
            $push: { comments: comment },
            $inc: { commentcount: 1 }
          },
          { returnDocument: 'after' }
        );

        if (!result) {
          return res.send('no book exists');
        }

        return res.json(result);
      } catch (err) {
        console.error(err);
      }
    })

    .delete(checkIdParam, async function (req, res) {
      try {
        let { _id } = req.params;

        const result = await collection.findOneAndDelete({ _id: ObjectId.createFromHexString(_id) });

        if (!result) {
          return res.send('no book exists');
        }

        return res.send('delete successful');
      } catch (err) {
        console.error(err);
      }
    });
};
