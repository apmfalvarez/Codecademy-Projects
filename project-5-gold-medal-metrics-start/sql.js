var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./gold_medals.sqlite');

/*
Returns a SQL query string that will create the Country table with four columns: name (required), code (required), gdp, and population.
*/

const createCountryTable = () => {
  return `CREATE TABLE Country(
    name TEXT,
    code TEXT,
    gdp INTEGER,
    population INTEGER
    );`;
};

/*
Returns a SQL query string that will create the GoldMedal table with ten columns (all required): id, year, city, season, name, country, gender, sport, discipline, and event.
*/

const createGoldMedalTable = () => {
  return `CREATE TABLE GoldMedal(
    id INTEGER PRIMARY KEY,
    year INTEGER,
    city TEXT,
    season TEXT,
    name TEXT,
    country TEXT,
    gender TEXT,
    sport TEXT,
    discipline TEXT,
    event TEXT
    );`;
};

/*
Returns a SQL query string that will find the number of gold medals for the given country.
*/

const goldMedalNumber = country => {
    return `
    SELECT COUNT(*) AS 'count'
    FROM GoldMedal
    WHERE country = ${country};`;
};

/*
Returns a SQL query string that will find the year where the given country 
won the most summer medals, along with the number of medals aliased to 'count'.
*/

const mostSummerWins = country => {
  return `
  SELECT year, MAX(COUNT(*)) AS 'count'
  FROM GoldMedal
  GROUP BY year
  HAVING country = ${country} AND season = 'Summer';`;
};

/*
Returns a SQL query string that will find the year where the given country 
won the most winter medals, along with the number of medals aliased to 'count'.
*/

const mostWinterWins = country => {
  return `
  SELECT year, MAX(COUNT(*)) AS 'count'
  FROM GoldMedal
  GROUP BY year
  HAVING country = ${country} AND season = 'Winter';`;
};

/*
Returns a SQL query string that will find the year where the given country 
won the most medals, along with the number of medals aliased to 'count'.
*/

const bestYear = country => {
  return `
  SELECT year, MAX(COUNT(*)) AS 'count'
  FROM GoldMedal
  GROUP BY year
  HAVING country = ${country}
  ;`;
};

/*
Returns a SQL query string that will find the discipline this country has 
won the most medals, along with the number of medals aliased to 'count'.
*/

const bestDiscipline = country => {
  return`
  SELECT discipline, MAX(COUNT(*)) AS 'count'
  FROM GoldMedal
  GROUP BY discipline
  HAVING country = ${country}
  ;`;
};

/*
Returns a SQL query string that will find the sport this country has 
won the most medals, along with the number of medals aliased to 'count'.
*/

const bestSport = country => {
  return `
  SELECT sport, MAX(COUNT(*)) AS 'count'
  FROM GoldMedal
  GROUP BY sport
  HAVING country = ${country}
  ;`;
};

/*
Returns a SQL query string that will find the event this country has 
won the most medals, along with the number of medals aliased to 'count'.
*/

const bestEvent = country => {
  return `
  SELECT event, MAX(COUNT(*)) AS 'count'
  FROM GoldMedal
  GROUP BY event
  HAVING country = ${country}
  ;`;
};

/*
Returns a SQL query string that will find the number of male medalists.
*/

const numberMenMedalists = country => {
  return `
  SELECT DISTINCT COUNT(name) AS 'count'
  FROM GoldMedal
  WHERE country = ${country} AND gender = 'male'
  ;`;
};

/*
Returns a SQL query string that will find the number of female medalists.
*/

const numberWomenMedalists = country => {
  return `
  SELECT DISTINCT COUNT(name) AS 'count'
  FROM GoldMedal
  WHERE country = ${country} AND gender = 'female'
  ;`;
};

/*
Returns a SQL query string that will find the athlete with the most medals.
*/

const mostMedaledAthlete = country => {
  return `
  SELECT MAX(COUNT(name)) AS 'count'
  FROM GoldMedal
  WHERE country = ${country};`;
};

/*
Returns a SQL query string that will find the medals a country has won
optionally ordered by the given field in the specified direction.
*/

const orderedMedals = (country, field, sortAscending) => {
  const sortBy = sortAscending ? 'ASC' : 'DESC';
  const sortField = field? `AND field = ${field}` : 'id'
  return `
  SELECT *
  FROM GoldMedal
  WHERE country = ${country}
  ORDER BY ${sortField} ${sortBy}
  ;`;
};

/*
Returns a SQL query string that will find the sports a country has
won medals in. It should include the number of medals, aliased as 'count',
as well as the percentage of this country's wins the sport represents,
aliased as 'percent'. Optionally ordered by the given field in the specified direction.
*/

const orderedSports = (country, field, sortAscending) => {
  return;
};

module.exports = {
  createCountryTable,
  createGoldMedalTable,
  goldMedalNumber,
  mostSummerWins,
  mostWinterWins,
  bestDiscipline,
  bestSport,
  bestYear,
  bestEvent,
  numberMenMedalists,
  numberWomenMedalists,
  mostMedaledAthlete,
  orderedMedals,
  orderedSports
};
