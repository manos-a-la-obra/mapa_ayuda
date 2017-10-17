var data_base;

function createdatabase(){
    return new Promise(
    function(resolve,reject){
       resolve(getting_db())
    })
}


function getTableData(key,cat,callback){
    getting_db().then(callback(key,cat));
}

function call_ll(){
    console.log(typeof data_base)
    var myJSON = JSON.stringify(data_base({"comida":{is:true}}).get());
    console.log(myJSON);
    return;
}

function getting_db(){
    // Document
    // directamente por tabla
    return new Promise( function(fullfill,reject){

    var googlesheet = "https://docs.google.com/spreadsheets/d/1vHrM6r3sO1f6ylsci_B7z08PrLsYKpG5VywjZXD6l5M/gviz/tq?tq=select%20A%20B%20C%20R%20S%20T&sheet={Form Responses 1}"

   // Loading everything
   google.load('visualization', '1.0', {
             callback:function(){
             var query = new google.visualization.Query(googlesheet);
             query.setQuery("SELECT *"); 
             query.send(handleQueryResponse);
             function handleQueryResponse(response){
                    if (response.isError()) {
                         alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                     }
             var data = response.getDataTable();
             var db = TAFFY();
             var parseRow = wrapper_parseRow(data,db);
             var csv = google.visualization.dataTableToCsv(data);

             // Here Papa parse show up
             var csv_parsed = Papa.parse(csv,{download:false,
                               step: function(row){
                                   parseRow(row);
                               },
                               complete: function() {
		                       console.log("All results");
                                       data_base = db;
	                      }});
             var myJSON = JSON.stringify(db({"asistenciamedica":{is:true}}).get());
             console.log(myJSON);
             var myJSON = JSON.stringify(data_base({"asistenciamedica":{is:true}}).get());
             console.log(myJSON);
             fullfill(db);
             };
             };
             });
      };
};


function wrapper_parseRow(data,db){
    function parseRow(row){
        var elem = {};
        if(row.data[0][0] != ''){ // Trowing out entries without timestamp
	   for (var i = 0; i < 15; i++) {
               elem[data.getColumnLabel(i)] = row.data[0][i];
	       }
           elem[data.getColumnLabel(20)] = row.data[0][20]; // Geoloc
           elem[data.getColumnLabel(19)] = row.data[0][19];

           elem = get_categories(row.data[0][2],elem); // Categories
           //console.log(elem);
           db.insert(elem); 
           }
        
	//var myJSON = JSON.stringify(elem);
        //console.log(myJSON);
	};
	//};
    return parseRow
}


function RemoveAccents(strAccents) {
		var strAccents = strAccents.split('');
		var strAccentsOut = new Array();
		var strAccentsLen = strAccents.length;
		var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
		var accentsOut = "aaaaaaaaaaaaoooooooooooooeeeeeeeeeccdiiiiiiiiuuuuuuuunnssyyyzz";
		for (var y = 0; y < strAccentsLen; y++) {
			if (accents.indexOf(strAccents[y]) != -1) {
				strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
			} else
				strAccentsOut[y] = strAccents[y];
		}
		strAccentsOut = strAccentsOut.join('');
		return strAccentsOut;
}

function get_categories(line,elem){
    line = RemoveAccents(line);
    line = line.toLowerCase();
    line = line.replace(" ","");
    line = line.replace(",","");
    line = line.replace("-","");
    var otro = false;
    for (var i =0; i < n_categories-1; i++){
        if (line.search(categories[i])> -1){
           line = line.replace(categories[i], "");
           elem[categories[i]] = true;
        }
        else
           elem[categories[i]] = false;
     }
     if (line.legth != 0){
          line = line.replace(" ","");
          line = line.replace(",","");
          line = line.replace("-","");
          otro = true;
    }
    elem[categories[n_categories-1]] = otro;
    return elem
}

function classify(catkey,cat){
     return data_base({catkey:{is:cat}})
}

function get_Database(){
    return  getTableData();
}


function get_necesito(){
     return getin_out("Ofrezco/Necesito","Necesito");
}

function find(){
   all_data.necesito = {};
   all_data.ofrezco = {};
}

function all(){
   getTableData('in_out');//getin_out("Ofrezco/Necesito","Necesito");
   var myJSON = JSON.stringify(db({Comida:{is:true}}).get());
   console.log(myJSON);
}



var n_categories = 14;
var categories = ["comida","agua","refugio", "transporte","manosvoluntarios", "asistenciamedica","peritajes","articulosdelimpieza","medicamentos","carpas, tiendasdecampana","ropa","gasolina","otro"]; 

createdatabase();
