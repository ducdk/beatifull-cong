const express = require('express')
const jsonfile = require('jsonfile');
const app = express()

const FILE_OUTPUT = __dirname + '/result.json';

app.use(express.static(__dirname + '/static'));

app.get('/', express.static(__dirname))

app.get('/result', function(req, res) {
    data = jsonfile.readFileSync(FILE_OUTPUT);
    let length = data['data'].length;
    let arr = [];
    let page = 1;
    let offset = 20;
    if (req.query.page) {
        page = req.query.page;
    }
    if (page * offset > length && (page - 1) * offset > length)
        res.send({});
    let run = page * offset > length ? length : page * offset;
    for (let i = (page - 1) * offset; i < run; i++) {
        let t = data['data'][i];
        t['offset'] = i;
        arr.push(t);
    }
    res.send(arr);
})

app.get('/articles/:id/:slug', function(req, res) {
    data = jsonfile.readFileSync(FILE_OUTPUT);

    let slug = "";
    let id = -1;
    if (req.params.slug && req.params.id) {
        slug = req.params.slug;
        id = req.params.id;
    } else
        res.send({ 'msg': 'Input invalid' });
    let arr = {};
    if (id != -1)
        arr = data['data'][id];
    res.send(arr);
})

// app.get('/home', function(req, res) {
//     res.send('hello world')
// })

app.listen(3000, () => console.log('Server app listening on port 3000!'));