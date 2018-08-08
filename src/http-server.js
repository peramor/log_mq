const
  express = require('express'),
  db = require('./db'),
  app = express();

app.get('/stat/not_completed', function (req, res) {
  db.notCompleted(req.query.limit, req.query.offset)
    .then(({rows}) => {
      res.send(rows)
    })
    .catch(err => {
      console.error(err)
      res.status(500).send()
    })
})

app.get('/stat/top_forms', function (req, res) {
  db.topForms()
    .then(({rows}) => {
      res.send(rows)
    })
    .catch(err => {
      console.error(err)
      res.status(500).send()
    })
})

app.get('/stat/user_forms', function (req, res) {
  db.userForms()
    .then(({rows}) => {
      res.send(rows)
    })
    .catch(err => {
      console.error(err)
      res.status(500).send()
    })
})

app.listen(8081, function () {
  console.log('server listening on port 8081')
})
