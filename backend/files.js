// return;
const fs = require('fs')
const formidable = require('formidable')
const moment = require('moment')


function uploadFile(req, res) {

    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {

        if (err) {
            console.log(err);
            res.end('שגיאה בעת עיבוד הקובץ');
            return;
        }

        const uploadedFile = files.myFile[0];
        const originalName = uploadedFile.originalFilename;
        const mimetype = uploadedFile.mimetype;
        const shortType = originalName.split(".").slice(-1)[0]
        const allowed = ['image/jpg', 'image/jpeg', 'image/png'];
        const oldPath = uploadedFile.filepath;
        const newPath = `./files/inChat_${moment(new Date()).format('DD-MM-YY HH-mm-ss')}.${shortType}`;

        if (!allowed.includes(mimetype)) {
            return res.status(403).send('Invalid file type specified for ' + originalName + ': ' + mimetype);
        }

        fs.copyFile(oldPath, newPath, err => {
            if (err) {
                console.log(err);
            }
            res.end();
        });

        res.send(newPath);


        // if (file.size > 1000 * 1024 * 3) {
        //     return res.status(403).send('Invalid file size specified for ' + file.originalFilename + ': ' + file.size);
        // }

    });
};


exports.uploadFile = uploadFile;