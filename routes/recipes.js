var express = require('express');
var router = express.Router();
var db_connection = require('../database/connection');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

router.get('/recipes', function(req, res, next) {
    let sqlC = `SELECT * FROM Recipes WHERE Protein = 'c';`

    db_connection.query(sqlC,(err,resultC) => {
        if(err) throw err;
        console.log(resultC);
        let sqlS = `SELECT * FROM Recipes WHERE Protein = 's';`
        db_connection.query(sqlS,(err,resultS) => {
          if(err) throw err;
          console.log(resultS);
          let sqlE = `SELECT * FROM Recipes WHERE Protein = 'e';`
          db_connection.query(sqlE,(err,resultE) => {
            if(err) throw err;
            console.log(resultE);
            res.render('recipes',{chicken: resultC, sausage: resultS, egg: resultE, title: 'recipes page'})
          })
        })
    })
  });

router.post("/food", (req,res) => {
  console.log("food");
  console.log(req.body.item);

  let recipeSQL = "select * from recipes where recipes.RecipeName = " + db_connection.escape(req.body.item) + ";";
  db_connection.query(recipeSQL, (err,result) => {
    if(err) throw err;
    let recipeInfo = result;
    let ingredientsSQL = "select distinct i.IngredientName, i.HighlightedInfo from ingredients i inner join recipeingredients rI on (i.IngredientID = rI.IngredientID) inner join recipes on (rI.RecipeID = (select r.RecipeID from recipes r where r.RecipeName = " + db_connection.escape(req.body.item) + "));";
    db_connection.query(ingredientsSQL, (err,ingred) => {
      if(err) throw err;
      res.render('food', {title: req.body.item, recipes:recipeInfo, ingredients:ingred})
    });
  });
});

/*router.get('/chicken', (req, res) => {
    console.log("chicken route");
    let sql = `SELECT * FROM Recipes WHERE Protein = 'c';`;

    db.query(sql,(err,result) => {
        if(err) throw err;
        console.log(result);
        res.render('recipes',{recipes: result, title: 'Chicken Recipes'})
    })
  });*/

router.get('/enterrecipe', function(req,res) {
  let sql = `select r.RecipeName from recipes r`;
  db_connection.query(sql, (err, result) => {
    if (err) throw err;
      res.render('addrecipe',{title: 'Add recipe page', foods:result});
  })
})

router.post('/addrecipe', function(req, res) {
  console.log(req.body);

  let ingredients = req.body.ingredients;
  if (!Array.isArray(ingredients)) {
      ingredients = ingredients ? [ingredients] : []; // Convert single item to array or set to empty array
  }
  console.log("Ingredients Array:", ingredients);

  // Insert Recipe
  let sql = `INSERT INTO Recipes (Protein, RecipeName, Instructions) VALUES (`
      + `'${req.body.Protein}', '${req.body.RecipeName}', '${req.body.Instructions}')`;

  db_connection.query(sql, (err, result) => {
      if (err) throw err;

      let insertedRecipeID = result.insertId; // Get the newly inserted RecipeID

      // Insert Ingredients into RecipeIngredients table
      ingredients.forEach(ingredient => {
          let sqlRI = `INSERT INTO RecipeIngredients (RecipeID, IngredientID) 
                       VALUES (${insertedRecipeID}, (SELECT IngredientID FROM Ingredients WHERE IngredientName = '${ingredient}'))`;

          db_connection.query(sqlRI, (err, result) => {
              if (err) throw err;
          });
      });

      // Fetch recipes for rendering
      let sqlC = `SELECT * FROM Recipes WHERE Protein = 'c';`;
      db_connection.query(sqlC, (err, resultC) => {
          if (err) throw err;
          console.log(resultC);

          let sqlS = `SELECT * FROM Recipes WHERE Protein = 's';`;
          db_connection.query(sqlS, (err, resultS) => {
              if (err) throw err;
              console.log(resultS);

              let sqlE = `SELECT * FROM Recipes WHERE Protein = 'e';`;
              db_connection.query(sqlE, (err, resultE) => {
                  if (err) throw err;
                  console.log(resultE);
                  res.render('recipes', { chicken: resultC, sausage: resultS, egg: resultE, title: 'recipes page' });
              });
          });
      });
  });
});


module.exports = router;