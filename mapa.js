mapboxgl.accessToken = 'pk.eyJ1IjoiYnV6b2hlcmJlcnQiLCJhIjoibXJXclpEVSJ9.YxiPmO7Q5QZrOGCuOsAYQg';





var data_base;
var n_categories = 14;
var categories = ["comida","agua","refugio", "transporte","manosvoluntarios", "asistenciamedica","peritajes","articulosdelimpieza","medicamentos","carpas, tiendasdecampana","ropa","gasolina","otro"]; 

var general_stops = {"Necesito":[["today","#602320"],["three","#a32020"],["week","#e0301e"],["more","#eb8c00"]],
                    "Ofrezco":[["today","#002366"],["three","#0038A8"],["week","#4169E1"],["more","#9BDDFF"]]};
function createdatabase(kind,container){
    getting_db(kind,container);
}


function getting_db(kind,container){
    // Document
    // directamente por tabla
    var googlesheet = "https://docs.google.com/spreadsheets/d/1vHrM6r3sO1f6ylsci_B7z08PrLsYKpG5VywjZXD6l5M/gviz/tq?tq=select%20A%20B%20C%20R%20S%20T&sheet={Form Responses 1}"

   // Loading everything
   google.load('visualization', '1.0', {
             callback:function(){
             var query = new google.visualization.Query(googlesheet);
             query.setQuery("SELECT *"); 
             query.send(function(response){handleQueryResponse(response,kind,container)});
             }
   })
   }

function handleQueryResponse(response,kind,container){
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
                          create_selectors(db,kind,container);
                          console.log("All results");
                 }});
        }


function create_selectors(db,kind,map_container){
    var map = new mapboxgl.Map({
       container: map_container,	
       style: 'mapbox://styles/buzoherbert/cj827abvc9bnr2rmscyivgxpb',
       center: [-99.1831799, 19.471516],
       zoom: 4
    });
    //separate_data(db,sel,"Necesito");
    //var sel = 'b';
    var layers = separate_data(db,kind,map);//,add_layer);
    create_bottoms(map);
    //callback();
}


function separate_data(data,kind,map){
     var toggleableLayerIds = ["Comida","Agua","Refugio", "Transporte","Manos/Voluntarios", "Asistencia Médica","Peritajes","Artículos de limpieza","Medicamentos","Carpas, Tiendas de Campaña","Ropa","Gasolina","Otro"]; 

   var filter_entry = {};
   filter_entry["title"] = kind;
   
   console.log(data().get());

   console.log(categories);
   //for (var i = 0;  i< n_categories; i++){
   map.on('load', function () {
   for (var i = 0;  i< 13; i++){
      var entry = categories[i];
      var key_entry = {};
      key_entry[entry] = true;

      var select_data = data().filter(filter_entry,key_entry).select("geojson");

      var data_geo = {//"id": "point",
                 "type": "geojson",
                 "data": {"type": "FeatureCollection",
                          "features":select_data,
                         },
               };
      console.log(data_geo);
      var layer = {
          "id": toggleableLayerIds[i],
          'source': data_geo,
          "type": "circle",
          'layout': {'visibility': 'visible'
                    },
          'paint': {
             'circle-radius': 3,
             'circle-color': {
                 property: "time",
                 type: "categorical",
                 stops: general_stops[kind]
                             }
                 },
            };
       console.log(layer);
            //function layer_f(){map.addLayer(layer);}
             //layer_f();
        map.addLayer(layer);
        map.on('click',toggleableLayerIds[i], function (e) {
          new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(e.features[0].properties.description)
            .addTo(map);
         });
     
        map.on('mouseenter', toggleableLayerIds[i], function () {
            map.getCanvas().style.cursor = 'pointer';
        });
         };
         });
};

function create_bottoms(map){
     var toggleableLayerIds = ["Comida","Agua","Refugio", "Transporte","Manos/Voluntarios", "Asistencia Médica","Peritajes","Artículos de limpieza","Medicamentos","Carpas, Tiendas de Campaña","Ropa","Gasolina","Otro"]; 
    for (var i = 0; i < toggleableLayerIds.length; i++) {
         var id = toggleableLayerIds[i];

         var link = document.createElement('a');
         link.href = '#';
         link.className = 'active';
         link.textContent = id;

        link.onclick = function (e) {
            var clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();

            var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
            if (visibility === 'visible') {
               map.setLayoutProperty(clickedLayer, 'visibility', 'none');
               this.className = '';
            } else {
                this.className = 'active';
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
             }
       };
  

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}

}

function wrapper_parseRow(data,db){
    function parseRow(row){
    
      if(row.data[0][19] != ''){ // Trowing out entries without timestamp
      if(row.data[0][0] != ''){ // Trowing out entries without timestamp
        var elem = {};
        elem["type"]="Feature";
        var geom = {"type":"Point", 
                    "coordinates":[parseFloat(row.data[0][19]),parseFloat(row.data[0][18])]
                     };
        var properties = {"title":row.data[0][1], 
                          "name":row.data[0][1], 
                          "icon": "harbor",
                          "description": get_message(row),
                          "time": get_time(row.data[0][0])};
        elem = get_categories(row.data[0][2],elem); // Categories
         elem["geojson"] = {"geometry": geom,"id":"points","properties":properties,"type":"circle"};
        elem["title"] = row.data[0][1]; 
        db.insert(elem); 
	};
    };
    };
    return parseRow
}

function get_time(time){
  var now = new Date().getTime() / 1000;
  var then = Math.round(new Date(time).getTime()/1000)
  var diff = (now-then)/86400;
  if (diff < 1){
     return "today";
  }
  if (diff < 3){
     return "three";
  }
  if (diff < 7){
     return "week";
  }
  return "more";
}


function get_message(row){
       var line = "<strong>"+row.data[0][0] +" "+row.data[0][1]+"</strong><p> ¿Qué ofrezco/necesito? "+row.data[0][2]+" <\p>";
       if(row.data[0][5] != ''){ // Trowing out entries without timestamp
           line = line + "<p> <strong>Nombre</strong> "+row.data[0][5] +" <p>";}
       if(row.data[0][3] != ''){ // Trowing out entries without timestamp
           line = line + "<p> <strong>Lugar</strong> "+row.data[0][3] +","+row.data[0][4]+","+ row.data[0][7] +","+row.data[0][8]+","+row.data[0][9]+"<p>";
       }
       if(row.data[0][11] != ''){ // Trowing out entries without timestamp
           line = line + "<p> <strong>¿Qué tanto puedes dar/necesitas?</strong> "+row.data[0][11] +"<\p> ";
       }
       if(row.data[0][6] != ''){ // Trowing out entries without timestamp
          line = line + "<p> <strong>Facebook</strong> "+row.data[0][6]+"<\p> ";
       }
       if(row.data[0][13] != ''){ // Trowing out entries without timestamp
          line = line + "<p> <strong>Teléfono</strong> "+row.data[0][13]+"<\p> ";
       }
       if(row.data[0][14] != ''){ // Trowing out entries without timestamp
          line = line + "<p> <strong>Email</strong> "+row.data[0][14]+"<\p> ";
       }
       if(row.data[0][15] != ''){ // Trowing out entries without timestamp
          line = line + "<p> <strong>Twitter</strong> "+row.data[0][15]+"<\p> ";
       }
       if(row.data[0][10] != ''){ // Trowing out entries without timestamp
          line = line +"<p> <strong>Comentarios</strong> "+row.data[0][10] +"<\p> ";
        }
        return line;
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
		return remove_char(strAccentsOut);
}


function remove_char(line){
    return line.replaceAll(" ",'').replaceAll(",","").replaceAll("-","").replaceAll("/","").toLowerCase();
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function get_categories(line,elem){
    line = RemoveAccents(line);
    //console.log(line);
    for (var i =0; i < n_categories-1; i++){
        if (line.search(categories[i])> -1){
          elem[categories[i]] = true;
          line = line.replaceAll(categories[i], "");
        }
        else{
          elem[categories[i]] = false;
       }
     };
     if (line != ""){
        elem[categories[n_categories-1]] = true;
    }
    else{
        elem[categories[n_categories-1]] = false;
    };
    //console.log(line_f);
    return elem;
}

//createdatabase("Necesito");

