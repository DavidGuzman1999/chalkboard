const express = require('express');
var path = require('path');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var ejs = require('ejs');
const PORT = process.env.PORT || 3000;

const { MongoClient } = require('mongodb');
let db;
const uri = process.env.URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    if (!err) {
        db = client.db("chalkboard");
        console.log('MongoDB Connection Succeeded.');
    } 
    else {
        console.log('Error in DB connection : ' + err);
    }
    // perform actions on the collection object
});

app.use(
  session({
    secret: 'totally a secret',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: uri})
  })
);

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/src'));
app.set('views', path.join(__dirname, 'src/views'))

app.get('/', (req, res) => {
    res.render('index', {valid: ""});
});

app.get('/student_homepage', (req, res) => {
    res.render('student_homepage');
})

app.get('/login_professor', (req, res) => {
    res.render('professor_login');
})  

app.get('/login_admin', (req, res) => {
    res.render('admin_login');
})

app.get('/sign_up', (req, res) => {
    res.render('signup', {valid: ""});
})

app.get('/professor_homepage', (req, res) => {
    res.render('professor_homepage');
})

app.get('/student_course', (req, res) => {
    res.render('student_course');
})

app.get('/student_add_course', (req, res) => {
    res.render('student_add_course');
})

app.get('/student_assignment', (req, res) => {
    res.render('student_assignment');
})

app.get('/student_video', (req, res) => {
    res.render('student_video');
})

app.get('/student_work', (req, res) => {
    res.render('student_work');
})

app.get('/student_textbook', (req, res) => {
    res.render('student_textbook');
})

app.get('/student_lecture', (req, res) => {
    res.render('student_lecture');
})

app.listen(PORT, () => {
    console.log(`Express listening on port ${PORT}`);
})

var Schema = mongoose.Schema;

userSchema = new Schema({
  unique_id: Number,
  email: {
    type: String,
    required: true,
    format: "Email",
  },
  first: {
    type: String,
    required: true,
  },
  last: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String
  },
  courses: {
    type: [String] 
  }
});

User = mongoose.model('User', userSchema);

// classSchema = new Schema({
//     courseName: {
//         type: String,
//         required: true,
//     },
//     courseId: {
//         type: String,
//         required: true,
//     },
//     instructors: {
//         type: [String],
//         required: true,
//     },
//     description: {
//         type: String
//     },
//     students: {
//         type: [String]
//     },
//     assignments: [
//         {
//             title: String,
//             dueDate: Date,

//         }
//     ]
// });

// Course = mongoose.model('Courses', classSchema);

app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.post('/sign_up', function (req, res, next) {
  console.log(req.body);
  var personInfo = req.body;

  if (!personInfo.email || !personInfo.first || !personInfo.last || !personInfo.password || !personInfo.confirmPassword) {
    return res.render("signup", { valid: "Fill all the required fields!" });
  }
  else {
    if (personInfo.password == personInfo.confirmPassword) {
      User.findOne({ email: personInfo.email }, function (err, data) {
        if (!data) {
          var c;
          User.findOne({}, function (err, data) {
            if (data) {
              console.log("if");
              c = data.unique_id + 1;
            } else {
              c = 1;
            }
            var newPerson = new User({
              unique_id: c,
              email: personInfo.email,
              first: personInfo.first,
              last: personInfo.last,
              userType: personInfo.userType,
              password: personInfo.password,
              confirmPassword: personInfo.confirmPassword,
              courses: [""]
            });
            newPerson.save(function (err, Person) {
              if (err)
                console.log(err);
              else
                console.log('Success');
            });
          }).sort({ _id: -1 }).limit(1);
          return res.render("index", { valid: "Sucess!" });
        } else {
          return res.render("signup", { valid: "Email is already in use!" });
        }
      });
    } else {
      return res.render(__dirname + "signup", { valid: "Password not matched!" });
    }
  }
});

app.post('/login_stu', function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) {
      return res.render("index", { valid: "User does not exist" });
    }
    else {
      if (req.body.password === user.password && user.userType == "student") {
        req.session.userId = user.unique_id;
        return res.render("student_homepage");
        // getEnrolledCourses(user, 'student_homepage', res);
      }
      else {
        return res.render("index", { valid: "Incorrect email or password" });
      }
    }
  });
});

function getEnrolledCourses(user, goto, res) {
        // get user enrolled classes
        // var user_classes = user.courses;
        // var class_details = [];
        // var returnObj;

        // // create query to link userClasses with courses model to get class info
        // user_classes.forEach(course => {
        //   class_details.push(course);
        // });

        // db.collection('courses').find({courseId: {"$in":class_details}}).toArray(function (err, result) {
        //     returnObj = result;
        //     var gotoUrl = "/view/" + goto +"";
        //     return res.render(__dirname + gotoUrl, {print:result});
        // });
}

//clear cookies on the browser and destroy session when use hit sign out to log out
app.post('/signOut', function(req, res){
  sess=req.session;
    sess.destroy(function(err) {
        if(err){
            console.log("Error Logging out!")
            return res.render(__dirname); // if failed stay on same page
        }else{
            console.log("Session Destroyed successfully");
        return res.render("index", { valid: "" }); // if successful go to homepage
        }
    });
});

app.post('/back_student', function(req, res, next) {
  User.findOne({unique_id: req.session.userId}, function(err, user) {
      // getEnrolledCourses(user, 'student_homepage', res)
      return res.render("student_homepage");
  });
});

app.post('/back_professor',function(req, res, next) {
  User.findOne({unique_id: req.session.userId}, function(err, user) {
      // getEnrolledCourses(user, 'professor_homepage', res)
      return res.render("professor_homepage");
  });
});