mapboxgl.accessToken = 'pk.eyJ1IjoiYnV6b2hlcmJlcnQiLCJhIjoibXJXclpEVSJ9.YxiPmO7Q5QZrOGCuOsAYQg';

var data_base;
var n_categories = 13;
var categories = ["comida","agua","refugio", "transporte","manosvoluntarios", "asistenciamedica","peritajes","articulosdelimpieza","medicamentos","carpastiendasdecampana","ropa","gasolina","otro"]; 

var toggleableLayerIds = ["Todo","Necesito","Ofrezco","Comida","Agua","Refugio", "Transporte","Manos/Voluntarios", "Asistencia Médica","Peritajes","Artículos de limpieza","Medicamentos","Carpas, Tiendas de Campaña","Ropa","Gasolina","Otro"]; 

var general_stops = [["Necesito","#602320"],["Ofrezco","#002366"]]





//);

function createdatabase(container,menu){
    getting_db(container,menu);
}


function getting_db(container,menu){
    // Document
    // directamente por tabla
    var googlesheet = "https://docs.google.com/spreadsheets/d/1vHrM6r3sO1f6ylsci_B7z08PrLsYKpG5VywjZXD6l5M/gviz/tq?tq=select%20A%20B%20C%20R%20S%20T&sheet={Form Responses 1}"

   // Loading everything
   google.load('visualization', '1.0', {
             callback:function(){
             var query = new google.visualization.Query(googlesheet);
             query.setQuery("SELECT *"); 
             query.send(function(response){handleQueryResponse(response,container,menu)});
             }
            })
   }

function handleQueryResponse(response,container,menu){
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
                          create_selectors(db,container,menu);
                 }});
        }


function create_selectors(db,map_container,menu){
    console.log(menu)



    var map = new mapboxgl.Map({
       container: map_container,	
       style: 'mapbox://styles/buzoherbert/cj827abvc9bnr2rmscyivgxpb',
       center: [-99.1831799, 19.471516],
       zoom: 4
    });
    separate_data(db,"Necesito",map);
    //var sel = 'a';
    //var layers = separate_data(db,kind,map);//,add_layer);
    create_bottoms(map,menu);
    map.addControl(new mapboxgl.FullscreenControl());
    map.resize();
    //callback();
}


function separate_data(data,kind,map){

   //for (var i = 0;  i< n_categories; i++){
   map.on('load', function () {
   for (var i = 3;  i< 16; i++){
      var entry = categories[i-3];
      var key_entry = {};
      key_entry[entry] = true;
      var selection = select_data(data,key_entry);
      create_layer(selection,key_entry,i,map);
   };
   var entry = categories[i];
   var key_entry = {};
   var selection = select_data(data,key_entry);
   key_entry["title"] = "Necesito";
   create_layer(selection,key_entry,1,map);

   var key_entry = {};
   key_entry["title"] = "Ofrezco";
   var selection = select_data(data,key_entry);
   create_layer(selection,key_entry,2,map);
   
   var selection = get_all_data(data);
   create_layer(selection,key_entry,0,map);
   
   });
}

function select_data_nested(data,key_entry,key){
      var selection = data().filter(key_entry,key).select("geojson");
      console.log(key_entry);
    }

function select_data(data,key_entry){
      var selection = data().filter(key_entry).select("geojson");
      console.log(key_entry);
      return selection;
      size = Object.keys(selection).length;
      for( var i=0; i < size; i++){
         var item = selection[i];
         console.log(item);
         console.log(generate_styles["Necesito"]["comida"]);
         item["properties"]["icon"] = generate_styles["Necesito"]["comida"];
         selection[i] = item;
         console.log(item);
      };
      return selection;
}


function get_all_data(data){
     return data().select("geojson");
}

function create_layer_element(data,key_entry,i,map){
      console.log(i);
      console.log(data);
      data.forEach(function(marker) {
        var el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = 'url("agua_verde.png")';
        //el.style.width = '1 px';
        //el.style.height = '1 px';

        //el.addEventListener('click', function() {
        //   window.alert(marker["properties"]["description"]);
        //});

        // add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates)
          .addTo(map);
    });
}

function create_layer(data,key_entry,i,map){

  var img = new Image();//document.createElement('img');
  img.className = "comida";
  img.width = 20;
  img.height = 20;
  img.crossOrigin = "Anonymous";
  img.src = "agua_verde.png";
  img.onload  = function(){
      map.addImage(toggleableLayerIds[i], img);
      console.log(i);
      console.log(data);
      var data_geo = {//"id": "point",
                 "type": "geojson",
                 "data": {"type": "FeatureCollection",
                          "features":data
                         },
               };
      var layer = {
          "id": toggleableLayerIds[i],
          'source': data_geo,
          "type": "symbol",
          'layout': {'visibility': 'visible',
                     "icon-image": toggleableLayerIds[i],
                     "icon-size":4
                    },
            };
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
  }
}

function create_bottoms(map,menu){
    console.log(menu);
    
    for (var i = 0; i < toggleableLayerIds.length; i++) {
         var id = toggleableLayerIds[i];

         var link = document.createElement('a');
         link.className = 'inactive';
         link.id = id;
         link.textContent = id;
         link.setAttribute('horizontal', '');

         link.onclick = function (e) {
            //window.alert(JSON.stringify(e));
            //Apaga todos los selectores.
            for (var j = 0; j < toggleableLayerIds.length; j++) {
                 var layerID = toggleableLayerIds[j];
                 var otro_clickedLayer = layerID;
                 map.setLayoutProperty(layerID, 'visibility', 'none');
                 document.getElementById(layerID).className = 'inactive';
            };
            document.getElementById(this.id).className = 'active';
            e.preventDefault();
            e.stopPropagation();
            map.setLayoutProperty(this.id, 'visibility', 'visible');
            //map.setLayoutProperty(this.id, "icon-image", 'harbor');
            this.className = 'active';
          }
         menu.appendChild(link);
    };

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
                          "icon": "monument",
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
    for (var i =0; i < n_categories-1; i++){
        if (line.search(categories[i])> -1){
          elem[categories[i]] = true;
          line = line.replaceAll(categories[i], "");
        }
        else{
          elem[categories[i]] = false;
       }
     };
    line = getotro(line,elem);
    return elem;
 }

function getotro(line,elem){
    if (line != ""){
        elem[categories[n_categories-1]] = true;
    }
    else{
        elem[categories[n_categories-1]] = false;
    };
    return elem;
}



//createdatabase("Necesito");

