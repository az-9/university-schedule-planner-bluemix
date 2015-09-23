var express = require('express');
var router = express.Router();
var fetcher = require('../fetcher.js')();

/* GET users listing. */
router.get('/getcoursesAll', function (req, res) {
    console.log("getsubject");
    fetcher.fetch('ksu', 0, 121, function (data, error) {
        if (error != null) {
            res.send('{error:""}');
        } else {
            res.send(JSON.stringify(data));
        }
        res.end();
    });


});

router.get('/getcourses/:coursesStringify', function (req, res) {
    fetcher.getSubjects('ksu', parseInt(JSON.parse(req.params.coursesStringify).place),parseInt(JSON.parse(req.params.coursesStringify).degree), parseInt(JSON.parse(req.params.coursesStringify).department), JSON.parse(req.params.coursesStringify).coursesIndex, function (data, error) {
        if (error != null) {
            res.send(error);
        } else {
            res.send(JSON.stringify(data));
        }
        res.end();
    });


});

router.get('/getcoursestitle/:coursesIndex', function (req, res) {

    fetcher.getSubjectsTitle('ksu', parseInt(JSON.parse(req.params.coursesIndex).place),parseInt(JSON.parse(req.params.coursesIndex).degree), parseInt(JSON.parse(req.params.coursesIndex).department), function (data, error) {

        if (error != null) {
            res.send('{"error":"' + error + '"}');
        } else {
            res.send(JSON.stringify(data));
        }
        res.end();
    });


});
router.get('/test/:indexs', function (req, res) {
    //res.send('respond with a resource');
console.log('place: '+parseInt(JSON.parse(req.params.indexs).place)+' degree: '+parseInt(JSON.parse(req.params.indexs).degree));
    fetcher.fetchDep("KSU",parseInt(JSON.parse(req.params.indexs).place),parseInt(JSON.parse(req.params.indexs).degree),function (data, error) {
        if (error != null) {

            res.send('{error:"' + error + '"}');
        } else {
            res.send(data);
        }
        res.end();
    });
    //res.render('schedule_old.ejs');

});

router.get('/', function (req, res) {
    fetcher.fetchDeps(function(departmentslist){
        res.render('scheduleplanner_2',{departmentslist:(departmentslist)});
        res.end();
        //console.log(JSON.stringify(departmentslist));
    })


});

module.exports = router;