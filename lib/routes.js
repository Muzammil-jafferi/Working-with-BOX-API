var request = require('request')
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var access_token, refresh_token;

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('login.html');
    });

    app.get('/create', function(req, res) {
        var options = {
            method: 'POST',
            url: 'https://api.box.com/oauth2/token',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                grant_type: 'authorization_code',
                code: req.query.code,
                client_id: 'wfnz1pdu3uvjwt9j30s9nvms0tg1hxyd',
                client_secret: 'oyOfGOKJDFV2yYhiEnqfYVuhCf7Rpx2E'
            }
        };

        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                if (typeof body == "string") {
                    body = JSON.parse(body)
                }
                access_token = body.access_token
                refresh_token = body.refresh_token
                console.log(body.refresh_token)
                return res.redirect("/main");
            }
        });
    });

    app.get('/refresh-token', function(req, res) {
        var options = {
            method: 'POST',
            url: 'https://api.box.com/oauth2/token',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                client_id: 'wfnz1pdu3uvjwt9j30s9nvms0tg1hxyd',
                client_secret: 'oyOfGOKJDFV2yYhiEnqfYVuhCf7Rpx2E'
            }
        };

        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                console.log("ref-token", refresh_token)
                return res.redirect("/main");
            }
        });
    });

    app.get('/main', function(req, res) {
        var options = {
            "method": "get",
            "url": "https://api.box.com/2.0/folders/0",
            "headers": {
                "Authorization": "Bearer " + access_token
            }
        }
        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                if (typeof body == "string") {
                    body = JSON.parse(body)
                }

                console.log(body.item_collection.entries)
                res.render('index.html', { title: "welcome to my Box", data: body.item_collection.entries });
            }

        });
    });

    app.get('/folder-info/:id', function(req, res) {
        var id = req.params.id
        console.log("abc1", id)
        var options = {
            "method": "get",
            "url": "https://api.box.com/2.0/folders/" + id + "/items",
            "headers": {
                "Authorization": "Bearer " + access_token
            }
        }
        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                if (typeof body == "string") {
                    body = JSON.parse(body)
                }
                console.log(body.entries)
                res.render('folder-info.html', { title: "welcome to my Box", data: body.entries, data1: id });
            }

        });
    });

    app.get('/folder-delete/:id', function(req, res) {
        var id = req.params.id
        console.log("ab", id)
        var options = {
            "method": "delete",
            "url": "https://api.box.com/2.0/folders/" + id,
            "headers": {
                "Authorization": "Bearer " + access_token
            }
        }

        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                res.redirect('/main');
            }
        });
    });

    app.get('/file-delete/:id', function(req, res) {
        var id = req.params.id
        console.log("ab", id)
        var options = {
            "method": "delete",
            "url": "https://api.box.com/2.0/files/" + id,
            "headers": {
                "Authorization": "Bearer " + access_token
            }
        }

        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                res.redirect('/main');
            }
        });
    });

  /*  app.get('/folderinfo', function(req, res) {
        res.render('folder-info.html');
    });*/

    app.get('/download/:id', function(req, res) {
        var id = req.params.id
        console.log("file-id", id)
        var file
        var options = {
            "method": "get",
            "url": "https://api.box.com/2.0/files/" + id + "/content",
            "headers": {
                "Authorization": "Bearer " + access_token
            }
        }

        request(options).pipe(res)
    })


    app.get('/folder-update/:id', function(req, res) {
        var id = req.params.id;
        console.log(req.body.name)
        console.log("pqr", id)
        var options = {
            "method": "get",
            "url": "https://api.box.com/2.0/folders/0",
            "headers": {
                "Authorization": "Bearer " + access_token
            }
        }
        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                res.render('folder-update.html', { title: "welcome to my Box", data: id });
            }

        });
    });

    app.post('/folderupdate/:id', function(req, res) {
        var id = req.params.id;
        console.log(req.body.name)
        console.log("pqr", id)
        var options = {
            "method": "PUT",
            "url": "https://api.box.com/2.0/folders/" + id,
            "headers": {
                "Authorization": "Bearer " + access_token
            },
            "json": {
                "name": req.body.name,
                "description": req.body.description
            }
        }
        request(options, function(error, response, body) {
            res.redirect('/main');
        })
    });

    app.get('/file-update/:id', function(req, res) {
        var id = req.params.id
        console.log("file-id", id)
        var filename
        var options = {
            "method": "get",
            "url": "https://api.box.com/2.0/files/" + id,
            "headers": {
                "Authorization": "Bearer " + access_token
            }
        }
        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                res.render('file-update.html', { title: "welcome to my Box", data: id });
            }

        });
    });

    app.post('/fileupdate/:id', function(req, res) {
        var id = req.params.id;
        console.log(req.body.name)
        console.log("pqr", id)
        var options = {
            "method": "PUT",
            "url": "https://api.box.com/2.0/files/" + id,
            "headers": {
                "Authorization": "Bearer " + access_token
            },
            "json": {
                "name": req.body.name,
                "description": req.body.description
            }
        }
        request(options, function(error, response, body) {
            res.redirect('/main');
        })
    });

    app.post('/main', function(req, res) {
        console.log("file--", req.files.sampleFile.name)
        var options = {
            "method": "post",
            "url": "https://upload.box.com/api/2.0/files/content",
            "headers": {
                "Authorization": "Bearer " + access_token,
                'content-type': 'multipart/form-data'
            },
            formData: {
                name: {
                    value: 'fs.createReadStream("req.files.sampleFile.name")',
                    options: {
                        filename: req.files.sampleFile.name,
                        contentType: null
                    }
                },
                'parent.id': '0'
            }
        }

        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                res.redirect('/main')
            }

        });
    });

    app.post('/folderinfo/:id', function(req, res) {
        var id = req.params.id;
        console.log("file--", req.files.sampleFile.name)
        console.log("id--", id)
        var options = {
            "method": "post",
            "url": "https://upload.box.com/api/2.0/files/content",
            "headers": {
                "Authorization": "Bearer " + access_token,
                'content-type': 'multipart/form-data'
            },
            formData: {
                name: {
                    value: 'fs.createReadStream("req.files.sampleFile.name")',
                    options: {
                        filename: req.files.sampleFile.name,
                        contentType: null
                    }
                },
                'parent.id': id
            }
        }
        
        request(options, function(err, response, body) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            } else {
                res.redirect('/main')
            }

        });
    });

}
