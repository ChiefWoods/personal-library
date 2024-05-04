/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  suite('Routing tests', function () {
    let book;

    suite('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .send({ title: 'Test title' })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'Test title');
            assert.property(res.body, '_id');
            done();
          });
      });

      test('Test POST /api/books with no title given', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai
          .request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach(book => {
              assert.containsAllKeys(book, ['_id', 'title', 'commentcount', 'comments']);
            });
            book = res.body[0];
            done();
          });
      });

      suite('GET /api/books/[id] => book object with [id]', function () {
        test('Test GET /api/books/[id] with id not in db', function (done) {
          chai
            .request(server)
            .get('/api/books/66366b7a89641bc64859d2e6')
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'no book exists');
              done();
            });
        });

        test('Test GET /api/books/[id] with valid id in db', function (done) {
          chai
            .request(server)
            .get(`/api/books/${book._id}`)
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.title, book.title);
              assert.equal(res.body._id, book._id);
              assert.equal(res.body.commentcount, book.commentcount);
              assert.deepEqual(res.body.comments, book.comments);
              done();
            });
        });
      });

      suite('POST /api/books/[id] => add comment/expect book object with id', function () {
        test('Test POST /api/books/[id] with comment', function (done) {
          chai
            .request(server)
            .post(`/api/books/${book._id}`)
            .send({ comment: 'Test comment' })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.body.title, book.title);
              assert.equal(res.body._id, book._id);
              assert.equal(res.body.commentcount, book.commentcount + 1);
              assert.include(res.body.comments, 'Test comment');
              done();
            });
        });

        test('Test POST /api/books/[id] without comment field', function (done) {
          chai
            .request(server)
            .post(`/api/books/${book._id}`)
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'missing required field comment');
              done();
            });
        });

        test('Test POST /api/books/[id] with comment, id not in db', function (done) {
          chai
            .request(server)
            .post('/api/books/66366b7a89641bc64859d2e6')
            .send({ comment: 'Test comment' })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'no book exists');
              done();
            });
        });
      });

      suite('DELETE /api/books/[id] => delete book object id', function () {
        test('Test DELETE /api/books/[id] with valid id in db', function (done) {
          chai
            .request(server)
            .delete(`/api/books/${book._id}`)
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'delete successful');
              done();
            });
        });

        test('Test DELETE /api/books/[id] with id not in db', function (done) {
          chai
            .request(server)
            .delete('/api/books/66366b7a89641bc64859d2e6')
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'no book exists');
              done();
            });
        });
      });
    });
  });
});