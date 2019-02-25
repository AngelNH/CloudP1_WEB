  var AWS = require('aws-sdk');
  AWS.config.loadFromPath('./config.json');

  var db = new AWS.DynamoDB();

  function keyvaluestore(table) {
    this.LRU = require("lru-cache");
    this.cache = new this.LRU({ max: 500 });
    this.tableName = table;
  };
  /**
   * TODO init function
   *    Validate that the table exists
   *    call the callback function
   */
  /**
   * Initialize the tables
   * 
   */
  keyvaluestore.prototype.init = function(whendone) {
    
    var tableName = this.tableName;
    var self = this;
    var params = {
        TableName : tableName
    };
    //Also from here
    db.describeTable(params,function(err,data){
      if(err)
        console.log(err,err.stack);//error ocurred
      else
        whendone();
    });
    //to here
    //whendone(); //Call Callback function.
  };

  /**
   * Get result(s) by key
   * 
   * @param search
   * 
   * Callback returns a list of objects with keys "inx" and "value"
   */
keyvaluestore.prototype.get = function(search, callback) {
    var self = this;
    
    if (self.cache.get(search))
          callback(null, self.cache.get(search));
    else {
      /*
       * 
       * La función QUERY debe generar un arreglo de objetos JSON son cada
       * una de los resultados obtenidos. (inx, value, key).
       * Al final este arreglo debe ser insertado al cache. Y llamar a callback
       * 
       * Ejemplo:
       *    var items = [];
       *    items.push({"inx": data.Items[0].inx.N, "value": data.Items[0].value.S, "key": data.Items[0].key});
       *    self.cache.set(search, items)
       *    callback(err, items);
       */
      //from here -------------------------------------
      var params = {
        TableName: this.tableName,
        ExpressionAttributeNames: {
          '#k': "keyword",
          '#val': 'value'
        },
        ExpressionAttributeValues:{
          ":key" : {"S": search}
        },
        KeyConditionExpression: '#k = :key',
        ProjectionExpression: 'inx,#val,#k'
      };
      db.query(params,function(err,data){
        if(err){
          console.log(err,err.stack);
        }else{
            var items = [];
            //console.log("We have results: "+data);
            data.Items.forEach(function(element, index, array) {
              console.log("Elements: \n"+ element.inx.N + " \n " + element.keyword.S + " \ " + element.value.S);
              items.push({
                "inx": element.inx.N
                ,"value": element.value.S
                ,"key": element.keyword
              });
            });
            self.cache.set(search,items);
            callback(null,items);
        }
        
      });
      //Until hereis the thing i did.
    }
  };


  module.exports = keyvaluestore;
