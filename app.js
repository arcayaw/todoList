//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js"); ya no vamos a usar esto
const mongoose = require("mongoose"); //*(2) requerimos mongoose 
const app = express();
const _ = require("lodash"); /* requerimos lodash */




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//* (1) instalamos mongoose con npm i mongoose


//* (3) creamos la conection a mongo y la nueva base de datos
mongoose.connect("mongodb+srv://admin-warcaya:waar9227@cluster0.owsp6.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//para conectat con el cluster de mongo cambio password por mi clave y luego del .net el bnombre de mi database
// mongodb+srv://admin-warcaya:<password>@cluster0.owsp6.mongodb.net/<dbname>?retryWrites=true&w=majority


//*(4)  creamos el schema items
/**================================================== *
 * ==========  Section  Item Schema  ========== *
 * ================================================== */
//* este scheema solo tendra un field que sera name(data type string)
const itemSchema = new mongoose.Schema({
  name: String
})

/* =======  End of Section Item Schema  ======= */

//*(5) creamos un mongose model basado en el schema creado en el punto 4
const Item = mongoose.model("Item", itemSchema);
/*el primer parametro de este model es el nombre de los elementos que van a estar en la coleccion en singular, en este caso Item. el segundo parametro es el esquema que creamos previamente */

//*(6) creamos algunos elementos para tener default
/**================================================== *
 * ==========  creamos algunos elementos  ========== *
 * ================================================== */
const item1 = new Item({
  name: "correr"
})

const item2 = new Item({
  name: "comprar"
})

const item3 = new Item({
  name: "leer"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String, 
  items: [itemSchema]
};
//* este nuevo schema lo que dice es que por cada nueva lista que crremos va a tener un nombre y el item va a tener la forma del itemSchema

const List = mongoose.model("List", listSchema);

/* =======  End of Section comment block  ======= */


app.get("/", function (req, res) {

  //const day = date.getDate(); ya no vamos a usar esto

  //*(8) hacemos render del contenido de nuestra base de datos 

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {

      //* (7) insertamos los items con el metodo insertMany
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("oepracion exitosa");
        }
      });

    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });

    }
    //* --

  });

});

app.get("/:customListName", function (req,res) {
  const customListName = _.capitalize(req.params.customListName);

List.findOne({name:customListName}, function (err, foundList) {
  if (!err) {
    if (!foundList) {
      //create a new list

      const list = new List({
        name: customListName, 
        items: defaultItems
      })
    
    
      list.save();

      res.redirect("/" + customListName);
    } else{
      //show an existing list 

      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  }
});

  


});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();

      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName; 

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("operation sucessfull");
  
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function (err, foundList) {
      if(!err){
        res.redirect("/" + listName);
      }
    });
  
  }

  
});



// app.get("/work", function (req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
 