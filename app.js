//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//connection to mongoose and mongodb database
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});

//items schema for database
const itemsSchema = new mongoose.Schema({
  name: String,
});

const ListSchema = {
  name: String,
  items: [itemsSchema]
};

//creating Model of Item Schema
const Item = mongoose.model("items", itemsSchema);

const List = mongoose.model("list",ListSchema);

//Storing in array
const defaultItems = [{ name: "Welcome to Todo List"}, { name: "Press + to add Item"}, { name: "👈 Hit this to Delete an Item"}, {name: "Now we accept Emoji 😜"}];

//Updating data in database with ab unique id
// Item.updateOne(
//   {_id: "5c27a4b244a9de06486e30ea"},
//   {name: "Press + to add Item"},
//   function(err){
//     if(err){
//       console.log(err);
//     }else{
//       console.log("Success");
//     }
//   }
// );


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      //Inserting data in database in items collections
      Item.insertMany(defaultItems, (err) => {
        if (err)
          console.log(err);
        else
          console.log("Success added");
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "All",
        newListItems: foundItems
      });
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.list);

  const item = new Item({name: itemName});
  if(listName ==="All"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundList){
      if(!err){
        if(foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/lists?list="+listName);
        }
      }
    });
  }
});

app.post("/delete", (req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = _.capitalize(req.body.listName);

  if(listName ==="All"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Deleted Success");
        res.redirect("/");
      }else{
        console.log("Someting get wrong");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/lists?list="+listName);
      }
    });
  }


});

app.get("/allLists",(req,res)=>{
  var error = "";
  if(req.query.error){
    if(req.query.error ==1)
      error = "List Not Found, Make a new List or use these Lists 😀";
  }
  console.log(error);
  console.log(error);
  List.find({},function(err,foundLists){
    if(!err){
      res.render("allLists", {listTitle: "All/Add Lists", allLists:foundLists,error:error});
    }else{
      console.log(err);
    }
  });
});

app.get("/lists",function(req,res){
  const customListName = _.capitalize(req.query.list);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("Not found");
        List.find({},function(err,foundLists){
          if(!err){
            res.redirect("/allLists?error=1");
          }else{
            console.log(err);
          }
        });
      }else{
        console.log("List Found");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.post("/allLists",(req,res)=>{
  const customListName = _.capitalize(req.body.newList);
  console.log(customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("Not found");
        customListNameItems = [{name: customListName+" is Created"}];
        const list = new List({
          name: customListName,
          items: customListNameItems.concat(defaultItems),
        });
        list.save();
        res.redirect("/lists?list=" + customListName);
      }else{
        console.log("List Found");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.post("/deleteList",function(req,res){
  const listName = req.body.checkbox;
  List.findOneAndRemove({name: listName}, function(err,foundList){
    if(!err){
      res.redirect("/allLists");
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about",{listTitle:"about"});
});

app.listen(3000, function() {
  console.log("Server started on port "+process.env.PORT);
});
