import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "wordslist",
  password: "Postgres$123",
  port: 5432,
});

db.connect();
let quiz =[];
let quiz1 = [];

db.query("SELECT * FROM words;", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }
  
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentWord = [];


// GET home page
app.get("/", async (req, res) => {

  const result = await db.query("SELECT * FROM words;", (err, res) => {
    if (err) {
      console.error("Error executing query", err.stack);
    } else {
      quiz = res.rows;
    }
  });

 
  console.log("Output from / home page: ",quiz);
  res.render("index.ejs", { word: currentWord,message : "Click on refresh to display words"});
});



async function nextWord() {
  quiz1 = quiz;
  
  let randomWord =[];
  for(var i=0;i<6;i++){
    const randomNumber = Math.floor(Math.random() * quiz1.length);
    console.log("Quiz1 length : ",quiz1.length);
    if (quiz1.length ==1)
    break
  randomWord.push(quiz1[randomNumber]);
  quiz1.splice(randomNumber,1);
  console.log("Splicing the randomNumber generated : ",quiz1[randomNumber]);
 }
  currentWord = randomWord;
  
  console.log("Value from nextWord function :" ,currentWord);
}

app.post("/add", async (req, res) => {
  const input = req.body["enteredWord"];

 console.log("Input :",input);
 
 try {
  const result = await db.query(
    "SELECT UPPER(words) FROM words WHERE UPPER(words) LIKE '%' || $1 || '%';",
    [input.toUpperCase()]
    
  );
console.log(result);
  try {
    await db.query(
      "INSERT INTO words (words) VALUES ($1)",
      [input.toUpperCase()]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    const wordsFound = [];
    res.render("index.ejs", {
      word: wordsFound,
      error: "Word has already been added, try again.",
    });
  }
} catch (err) {
  console.log(err);
  const wordsFound = [];
  res.render("index.ejs", {
    word: wordsFound,
    error: "Word does not exist, try again.",
  });
}
});


app.post("/refresh", async (req, res) => {
  await nextWord();
  console.log("Current word from refresh post: ",currentWord);
  if(currentWord=="")
  res.render("index.ejs", { word: currentWord,message : "Words completed"});
    else 
     res.render("index.ejs", { word: currentWord});
  
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
