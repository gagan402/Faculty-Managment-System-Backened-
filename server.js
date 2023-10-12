import express from "express";
import mysql from "mysql2";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import {v4 as uuidv4} from 'uuid';
import {Form} from 'multiparty';
import fs from 'fs';
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use("/public",express.static("public"));

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123Sarpanch@#$",
  database: "faculty",
});

app.get('/hello.txt',(req,res)=>{
     res.send("ok");
})


// const imagestorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });
// const tablestorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "public/tables");
//     },
//     filename: (req, file, cb) => {
//       cb(
//         null,
//         file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//       );
//     },
//   });

// const imageupload = multer({
//   storage: imagestorage,
// });
// const tableupload = multer({
//     storage: tablestorage,
//   });

con.connect(function (err) {
  if (err) {
    console.log("Error in connection");
    console.log(err);
  } else {
    console.log("Connected");
  }
});

app.get("/getTrainer", (req, res) => {
  const sql = "SELECT * FROM  addtrainerg";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get trainer error in sql" });
    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/get/:namee", (req, res) => {
  const namee = req.params.namee;
  // console.log(namee);

  const sql = "SELECT * FROM addtrainerg WHERE namee = ?";
  con.query(sql, [namee], (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.status(500).json({ Error: "Server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ Error: "Trainer not found" });
    }

    return res.json({ Status: "Success", Result: result });
  });
});

app.get("/gett/:namee", (req, res) => {
  const namee = req.params.namee;
  console.log(namee);

  const sql = "SELECT * FROM addtrainerg WHERE namee = ?";
  con.query(sql, [namee], (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.status(500).json({ Error: "Server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ Error: "Trainer not found" });
    }

    return res.json({ Status: "Success", Result: result });
  });
});



// app.get("/get/:id", (req, res) => {
 
//   const id = req.params.id
//   console.log(id);
//   const sql = "SELECT * FROM addtrainerg where id = ?";
//   con.query(sql, [id], (err, result) => {
//     if (err) return res.json({ Error: "Get trainer error in sql" });
//     return res.json({ Status: "Success", Result: result });
//   });
// });
app.put("/update/:namee", (req, res) => {
  const namee = req.params.namee;
  const { contact, email, address, image, designation, subjects, groupes,timetable } = req.body;
  const sql = `
    UPDATE addtrainerg 
    SET 
      contact = ?, 
      email = ?, 
      address = ?, 
      image = ?,
      designation = ?, 
      subjects = ?, 
      groupes = ?,
      timetable = ?
    WHERE namee = ?
  `;
  con.query(
    sql,
    [contact, email, address, image, designation, subjects, groupes, timetable, namee],
    (err, result) => {
      if (err) {
        console.error("Error updating trainer:", err);
        return res.status(500).json({ Error: "Internal server error" });
      }
      return res.json({ Status: "Success" });
    }
  );
});


// app.put("/update/:namee", (req, res) => {
//   const namee = req.params.namee;
//   const { contact, email, address} = req.body;
//   const sql = "UPDATE addTrainerg set contact = ?, email = ?, address = ? WHERE namee = ?";
//   con.query(sql, [contact, email, address, namee], (err, result) => {
//     if (err) return res.json({ Error: "update trainer error in sql" });
//     return res.json({ Status: "Success" });
//   });
// });

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "Delete FROM addtrainerg WHERE id= ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Error: "delete tainer error in sql" });
    return res.json({ Status: "Success" });
  });
});

app.post("/login", (req, res) => {
  const sql = "SELECT * FROM logging WHERE email = ? AND password = ? ";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) {
      return res.json({ Status: "Error", Error: "Error in running query" });
    }

    if (result.length > 0) {
      return res.json({ Status: "Success" });
    } else {
      return res.json({ Status: "Error", Error: "Wrong Email or Password" });
    }
  });
});
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});

function genId()
{
    return uuidv4();
}
// function test(req,res,next){
//       console.log("test");
//       console.log(req.body);
//       next();
// }
function handleFiles(req, res, next){
  const form = new Form({autoFiles : true, autoFields : true,uploadDir:'public'})
  form.parse(req, (err, fields, files) => {
      if(err){
          req.uploadError = err;
          next();
      }else{
          req.files = files;


          const fieldKeys = Object.keys(fields);
          const convertedBody = {};

          for(let key of fieldKeys){
              if(key === null || key === undefined) continue;
              if(Array.isArray(fields[key])){
                  if(fields[key].length === 0){
                      convertedBody[key] = undefined;
                  }else{
                      if(fields[key].length===1)
                      {
                        convertedBody[key] = fields[key][0];
                      }
                      else{
                        convertedBody[key] = fields[key].join();
                      }
                  }
                  continue;
              }

              convertedBody[key] = fields[key];
          }

          req.body = convertedBody;

          next();
      }
  })
}

app.post("/create",handleFiles,(req, res) => {
  console.log(req.body);
  const ImageName=Date.now()+"_"+req.files.image[0].originalFilename;
  const TableName=Date.now()+"_"+req.files.timetable[0].originalFilename;
  fs.renameSync(req.files.image[0].path,"public/images/"+ImageName);
  fs.renameSync(req.files.timetable[0].path,"public/tables/"+TableName);

 
  const sql = "INSERT INTO AddTrainerg(`id`, `namee`, `email`, `contact`, `address`, `image`, `designation`, `subjects`, `groupes`, `timetable`) VALUES (?)";

     
  const values = [
    genId(),
    req.body.namee,
    req.body.email,
    req.body.contact,
    req.body.address,
    "public/images/"+ImageName,
    req.body.designation,
    req.body.subjects,
    req.body.groupes,
    "public/tables/"+TableName,

  ];
 
  con.query(sql, [values], (err, result) => {
    
    if (err)
    {
      console.error("SQL error:", err.message);
      return res.json({ Error: "Inside singup query" });
  }
  else{
       return res.redirect('/');
    // return res.json({ Status: "Success" });
  }
  });
});



app.listen(8081, () => {
  console.log("Running");
});
