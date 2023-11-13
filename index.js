import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  username: "postgres",
  password: "postgre2022",
  host: "localhost",
  port: "5432",
  database: "udemy"
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited(){
  const result = await db.query("SELECT country_code from public.visited_countries");
  let countries = [];
  result.rows.forEach(country => {
    countries.push(country.country_code);
  });
  return countries;
}
//get the visited countries
app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisited();
  res.render("index.ejs", {countries: countries, total: countries.length});
  // db.end();
});

//Insert into visited countries if country is available in countries table.
app.post("/add", async (req, res)=>{
  const countryName = req.body.country;
  let country = countryName.toLowerCase().trim();
  let countrySuffix = country.substring(1,country.length);
  country = country.substring(0,1).toUpperCase() + countrySuffix;
  console.log(country);
  try {
    const result = await db.query("SELECT country_code from countries where country_name like '%' || $1 || '%'",[country]);
    // if(result.rows.length !== 0){
      const countryCode = result.rows[0].country_code;
      try {
        await db.query("Insert into visited_countries (country_code) values ($1)",[countryCode.trim()]);
      } catch (error) {
        console.log(error);
        const countries = await checkVisited();
        res.render("index.ejs", {
          countries: countries, 
          total: countries.length,
          error: "Country already exist, try again!"});
      }
    // }
    // db.end();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries, 
      total: countries.length,
      error: "Country does not exist, try again!"});
  }
} );

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
