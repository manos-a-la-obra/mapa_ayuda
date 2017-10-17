mapboxgl.accessToken = 'pk.eyJ1IjoiYnV6b2hlcmJlcnQiLCJhIjoibXJXclpEVSJ9.YxiPmO7Q5QZrOGCuOsAYQg';

var data_base;
var n_categories = 13;
var categories = ["comida","agua","refugio", "transporte","manosvoluntarios", "asistenciamedica","peritajes","articulosdelimpieza","medicamentos","carpastiendasdecampana","ropa","gasolina","otro"]; 

var toggleableLayerIds = ["Todo","Necesito","Ofrezco","Comida","Agua","Refugio", "Transporte","Manos/Voluntarios", "Asistencia Médica","Peritajes","Artículos de limpieza","Medicamentos","Carpas, Tiendas de Campaña","Ropa","Gasolina","Otro"]; 

var general_stops = {"necesito":[["today","#FF8F8B"],["three","#FF8F8B"],["week","#FF8F8B"],["more","#FF8F8B"]],
                    "ofrezco":[["today","#B8DAC3"],["three","#B8DAC3"],["week","#B8DAC3"],["more","#B8DAC3"]]};

var layerIds = {"comida":{"necesito":"comida_rojo.png","ofrezco":"comida_verde.png"},
"agua":{"necesito":"agua_rojo.png","ofrezco":"agua_verde.png"},
"refugio":{"necesito":"refugio_rojo.png","ofrezco":"refugio_verde.png"},
"transporte":{"necesito":"transporte_rojo.png","ofrezco":"transporte_verde.png"},
"manosvoluntarios":{"necesito":"manos_rojo.png","ofrezco":"manos_verde.png"},
"asistenciamedica":{"necesito":"asistencia_medica_rojo.png","ofrezco":"asistencia_medica_verde.png"},
"peritajes":{"necesito":"peritajes_rojo.png","ofrezco":"peritajes_verde.png"},
"articulosdelimpieza":{"necesito":"articulos_limpieza_rojo.png","ofrezco":"articulos_limpieza_verde.png"},
"medicamentos":{"necesito":"medicamentos_rojo.png","ofrezco":"medicamentos_verde.png"},
"carpastiendasdecampana":{"necesito":"carpas_rojo.png","ofrezco":"carpas_verde.png"},
"ropa":{"necesito":"ropa_rojo.png","ofrezco":"ropa_verde.png"},
"gasolina":{"necesito":"gasolina_rojo.png","ofrezco":"gasolina_verde.png"},
"otro":{"necesito":"otros_rojo.png","ofrezco":"otros_verde.png"}}

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
                          console.log("Hi there :)");
                          create_selectors(db,container,menu);
                 }});
        }


function create_selectors(db,map_container,menu){
    var map = new mapboxgl.Map({
       container: map_container,	
       style: 'mapbox://styles/buzoherbert/cj827abvc9bnr2rmscyivgxpb',
       center: [-99.1831799, 19.471516],
       zoom: 4
    });
    var list_layers = get_all_layers(db,map);
    //separate_data(db,"Necesito",map);
    //var sel = 'a';
    //var layers = separate_data(db,kind,map);//,add_layer);
    //create_bottoms(map,menu);
    create_filter_bottoms(map,menu,list_layers,list_layers);
    map.addControl(new mapboxgl.FullscreenControl());
    map.resize();
    //callback();
}


function get_all_sublayer_ids(){
   var all_layers = [];
   for (var key in layerIds) {
     if (layerIds.hasOwnProperty(key)) {           
       for (var subkey in layerIds[key]) {
           all_layers.push(layerIds[key][subkey].replace(".png",""));
       }
     }
   };
   return all_layers;

}

function get_filtered_layers(key){
   var all_layers = [];
   for (var subkey in layerIds[key]) {
        all_layers.push(layerIds[key][subkey].replace(".png",""));
   };
   return all_layers;
}

function get_filtered_sublayers(subkey){
   var all_layers = [];
   for (var key in layerIds) {
     if (layerIds.hasOwnProperty(key)) {           
            all_layers.push(layerIds[key][subkey].replace(".png",""));
       }
   };
   return all_layers;
}

function create_filter_bottoms(map,menu,list_layers){

   // Todo
   var filtered_layers = ["necesito","ofrezco"];
   create_bottoms_layers(map,menu,toggleableLayerIds[0],list_layers,filtered_layers,'active');
  
   var filtered_layers = ["necesito"];
   create_bottoms_layers(map,menu,toggleableLayerIds[1],list_layers,filtered_layers,'inactive');
 
   var filtered_layers = ["ofrezco"];
   create_bottoms_layers(map,menu,toggleableLayerIds[2],list_layers,filtered_layers,'inactive');

   for (var i = 0;  i< categories.length; i++){
      var entry = categories[i];
      var filtered_layers = get_filtered_layers(entry);
      create_bottoms_layers(map,menu,toggleableLayerIds[3+i],list_layers,filtered_layers,'inactive');
    }
 
   
}

function get_all_layers(data,map){
   var key_necesito = {}
   key_necesito["title"] = "Necesito";

   var key_ofrezco = {}
   key_ofrezco["title"] = "Ofrezco";
   
   var list_obj_layer = [];

   for (var i = 0;  i< categories.length; i++){
      var entry = categories[i];
      var key_entry = {};
      key_entry[entry] = true;
      selection = get_filter(data,key_ofrezco,key_entry);
      create_layer_element(selection,entry,"ofrezco",map,list_obj_layer);

      selection = get_filter(data,key_necesito,key_entry);
      create_layer_element(selection,entry,"necesito",map,list_obj_layer);
   };

   var selection = get_subfilter(data,key_necesito);
   create_layer_dots(selection,"necesito",map,list_obj_layer);
   
   var selection = get_subfilter(data,key_ofrezco);
   create_layer_dots(selection,"ofrezco",map,list_obj_layer);

   var list_layers = get_all_sublayer_ids();
   list_layers.push("necesito");
   list_layers.push("ofrezco");
   return list_layers;

}


function get_subfilter(data,key_entry){
    var selection = data().filter(key_entry).select("geojson");
    return selection
}


function get_filter(data,key_entry,key_sub){
    var selection = data().filter(key_entry,key_sub).select("geojson");
    return selection
}

function create_layer_dots(data,kind,map,list){
   map.on('load', function () {
      var data_geo = {//"id": "point",
                 "type": "geojson",
                 "data": {"type": "FeatureCollection",
                          "features":data,
                         },
               };
      var layer = {
          "id": kind,
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
        var layer_obj = map.addLayer(layer);
        list.push(layer_obj);

    });
    map.on('click',kind, function (e) {
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(e.features[0].properties.description)
        .addTo(map);
     });
    
    map.on('mouseenter', kind, function () {
        map.getCanvas().style.cursor = 'pointer';
    });
};


function create_layer_element(data,cat,sub,map){
  var img = new Image();//document.createElement('img');
  var file = layerIds[cat][sub];
  img.className = "comida";
  img.width = 20;
  img.height = 20;
  img.crossOrigin = "Anonymous";
  img.src = file;
  img.onload  = function(){
      var layer_id= file.replace('.png',"");
      map.on('load', function(){
        map.addImage(layer_id, img);
        var data_geo = {//"id": "point",
             "type": "geojson",
             "data": {"type": "FeatureCollection",
                      "features":data
                     },
        }
        var layer = {
         "id": layer_id,
         'source': data_geo,
         "type": "symbol",
         'layout': {'visibility': 'none',
                   "icon-image": layer_id,
                   "icon-size":2.0
                   },
        };
 
        map.addLayer(layer);
    });
    map.on('click',layer_id, function (e) {
    new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML(e.features[0].properties.description)
        .addTo(map);
     });
  
    map.on('mouseenter', layer_id, function () {
        map.getCanvas().style.cursor = 'pointer';
    });
  };
}


function create_bottoms_layers(map,menu,layer_id,list_layers,filter_layer,status_bottom){

     var link = document.createElement('a');
     link.className = status_bottom;
     link.id = layer_id;
     link.textContent = layer_id;
     link.setAttribute('horizontal', '');

     link.onclick = function (e) {
            //window.alert(JSON.stringify(e));
            //Apaga todos los selectores.
            for (var j = 0; j < list_layers.length; j++) {
                 var layerID = list_layers[j];
                 var otro_clickedLayer = layerID;
                 map.setLayoutProperty(layerID, 'visibility', 'none');
            };
            for (var i = 0; i< toggleableLayerIds.length; i++){
                 document.getElementById(toggleableLayerIds[i]).className = 'inactive';
            };
            document.getElementById(this.id).className = 'active';
            e.preventDefault();
            e.stopPropagation();
            
            for (var j = 0; j < filter_layer.length; j++) {
                map.setLayoutProperty(filter_layer[j], 'visibility', 'visible');
            };
            var layer_obj = map.getLayer(filter_layer[0]);
            //console.log(layer_obj);
            //this.className = 'active';
            //var mbounds = map.getBounds();
            //var lat = [mbounds[LngLat][lng], ]
            //map.fitBounds(layer_obj.latLngBounds());
          }
         menu.appendChild(link);
    };

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

