/**
 * Created by abdulazizm on 9/23/15.
 */

//ignore this file it's just for writing script and check syntax


$('#coursesAddList .collapse').each(function (indexSelect, selectEle) {
    if ($.trim($(selectEle).find('.filter_content')[0].value).length>0) {
        var teachers_array = $(selectEle).find('.filter_content')[0].value.split(',');

        if ($(selectEle).find('.filter_type')[0].selectedIndex) {
            scheduleplanner.namesOfUnwantedTeachers.push(teachers_array);
            scheduleplanner.namesOfWantedTeachers.push(new Array());
        }

        else {
            scheduleplanner.namesOfUnwantedTeachers.push(new Array());
            scheduleplanner.namesOfWantedTeachers.push(teachers_array);
        }

    } else {
        scheduleplanner.namesOfUnwantedTeachers.push(new Array());
        scheduleplanner.namesOfWantedTeachers.push(new Array());
    }
    //console.log(selectEle.children('filter_content').val);
});

//wanted teachers
var tmpArray=scheduleplanner.selectedCourses.map(function (subjects_Array,subjectIndex) {//wanted teachers
    if(scheduleplanner.namesOfWantedTeachers[subjectIndex].length==0)return  subjects_Array;
    else
        return subjects_Array.filter(function (courses_Array) {
        return courses_Array.filter(function (section_Object) {
            var exist = false;
             section_Object['courses'].forEach(function (section_) {
                console.log("section teacher:"+section_.teacher+" wanted teachers:"+scheduleplanner.namesOfWantedTeachers[subjectIndex]);
                if (isTeacherIn(section_,scheduleplanner.namesOfWantedTeachers[subjectIndex])) {
                    console.log("true");
                    exist = true;
                }
            });
            console.log("exist:"+exist);
            return exist;
        }).length;
    })
})

var tmpArray2=scheduleplanner.selectedCourses.map(function (subjects_Array,subjectIndex) {//unwanted teachers
    if(scheduleplanner.namesOfUnwantedTeachers[subjectIndex].length==0)return  subjects_Array;
    else
        return subjects_Array.filter(function (courses_Array) {
            return courses_Array.filter(function (section_Object) {
                var exist = false;
                section_Object['courses'].forEach(function (section_) {
                    console.log("section teacher:"+section_.teacher+" wanted teachers:"+scheduleplanner.namesOfUnwantedTeachers[subjectIndex]);
                    if (isTeacherIn(section_,scheduleplanner.namesOfUnwantedTeachers[subjectIndex])) {
                        console.log("true");
                        exist = true;
                    }
                });
                console.log("exist:"+exist);
                return !exist;
            }).length;
        })
})

function isTeacherIn(section_, teachers_) {//checks if one of the teachers teach that section
    return teachers_.some(function (teacher_) {
        return teacher_.split(' ').every(function (teacher_names){// ahmad abdulfateh => ['ahmad' ,'abdulfateh']
            return section_.teacher.indexOf(teacher_names)>-1;
        })
    })
}
//test
console.log(tmpArray2);


scheduleplanner.namesOfUnwantedTeachers = (new Array());
scheduleplanner.namesOfWantedTeachers = (new Array());

var rtrtrt=[];
$('#coursesAddList .collapse').each(function (indexSelect, selectEle) {
    var teachers_array = $(selectEle).find('.filter_content')[0].value.split(',');
    teachers_array.map(function(teacher_){
        return teacher_.replace(/^\s+|\s+$/g, "");;
    });
    rtrtrt.push(teachers_array);
});
console.log(rtrtrt);