
//latitude λ (lambda, Greek L)
//longitude φ (phi, Greek F)
//φλ



var data;
var svgG;
var width;// = 960,
var height;// = 500;
var mcoord = "clear";
var theData = [];
//var jDataG;
var LocArray = [];
var CollectArray = [];
//var bitsG;

var theData;
var data;



console.log("startNow");
////////////////////////////////////////////////////////////////////////
//set up container


var container = d3.select('body')
                  .append('svg')
                  .attr('width', '100%')//use % otherwise tree is masked
                 .attr('height', '100%')

.attr('id','myContainer')//styleCSS//.....................................................
                  .call(d3.zoom()
                  .on("zoom", function () {
                  container.attr("transform", d3.event.transform)
                  }))
                 .append("g");// allows mousewheele to scale in place, otherwise mousewheel moves off to the side



///////////////////////////////////////////////////////////
var dispatch = d3.dispatch("load", "statechange");


////////////////////////////////////////////////////////

d3.csv("Q_treeCsv_4k.csv", function(error, flatData) {
  if (error) throw error;

  flatData.forEach(function(d){
    if(d.parent == "null"){d.parent = null};
  });

  var treeData = d3.stratify()
  .id(function(d) { return d.name; })//this data can be retrieved
  .parentId(function(d) { return d.parent; })
  (flatData);

  treeData.each(function(d,i){//each - D3 specific - allows d, this, i | forEach - native js - allows d & i only
    d.name = d.id;
    d.parent = d.parentId;
  });

  
  
////////////////////////////////////////////////////////////
  theData = treeData.descendants(); 
  
  theData.forEach(function (d,i){
    if(theData[i].data.geoLocation_lat.length<=0){
      theData[i].data.geoLocation_lat = null;
    }else{
      theData[i].data.geoLocation_lat = parseFloat(theData[i].data.geoLocation_lat);
    }
    
  }) 
  

    theData.forEach(function (d,i){
      
    if(theData[i].data.geoLocation_lng.length<=0){
      theData[i].data.geoLocation_lng = null;
      theData[i].data.geoLocation_coord = null;
    }else{

      theData[i].data.geoLocation_lng = parseFloat(theData[i].data.geoLocation_lng);
      theData[i].data.geoLocation_coord = "set";


   var LocArray = [];
 LocArray.push({"longitude":parseFloat(theData[i].data.geoLocation_lng),"latitude":parseFloat(theData[i].data.geoLocation_lat)}); 

      theData[i].data.geoLocation_coord = LocArray;

      LocArray = [];

    }
    
  }) 
  


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////



  dispatch.call("load", this, treeData);

  var stateById = 111;
  dispatch.call("statechange",stateById);

  });


////////////////////////////////////////////////////////////////


dispatch.on("load.globe", function(treeData) {//was load.menu///////////////////////////////////////////////////////////////?????here


  var width = 960;//960
  var  height = 500;


var projection = d3.geoOrthographic()
    .scale(250)
    .rotate([0, 0])
    .translate([width / 2, height / 2])
    .clipAngle(90);

var path = d3.geoPath()
    .projection(projection);

var velocity = 0.02;

 var coord;

var graticule = d3.geoGraticule();
var sphere = {type: "Sphere"};

//var
SsvgG = d3.select("body").append("svg")////////////////////////////////////////////////////////////////////////////////////////////////////////////$$$$$$
    .attr("width", width)
    .attr("height", height)
    .attr('id', "my_svgG")
    .attr("pointer-events","none");//works - turning off pointer-events allows the lower tree layer to receive mouse events
//layers


  svgG = SsvgG.append("g")
              .attr("transform","translate(0,200) scale(0.4)");//seems that can only apply transform once - all actions to the strung together



  var layerGlobeBackground = svgG.append("g");

  var layerGlobeBackMarker = svgG.append("g");//////////////////////////////////////////////////////

  var layerGlobeFeatures = svgG.append("g");////////////////////////////////////////////////////////

  var layerGlobeFrontMarker = svgG.append("g");///////////////////////////////////////////////////////



var isVisible = {
  front: function(d) {
    return ((Math.cos((projection.rotate()[0]+d.lng)/360 * Math.PI * 2) > 0)?'visible':'hidden');
  },
  back: function(d) {
    return ((Math.cos((projection.rotate()[0]+d.lng)/360 * Math.PI * 2) < 0)?'visible':'hidden');
  }
};
////////////////////////////////////////////////////////////////////////////////////////////

  data = theData;
  
  data.forEach(function(d,i){
    
    if(d.data.geoLocation_coord !== null){

    var bell = d.data.geoLocation_coord;
    bell.forEach(function(d,i) {
      d.lng = +d.longitude;
      d.lat = +d.latitude;
      d.coordinate = function() {return projection([d.lng, d.lat]);};
      d.φλ = d.coordinate();
    })
      
      
    }

  })
  

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



d3.json("ne_110m_land.json", function(error, world) {
  if (error) throw error;

dispatch.on("statechange.coordinate", function(coord){


 mcoord = coord;


        data.forEach(function(d,i) {


         if (i === mcoord){
      
          if(d.data.geoLocation_coord !== null){
            backMarker(d.data.geoLocation_coord);
            frontMarker(d.data.geoLocation_coord);
            }

         }

     });



  if (mcoord === "clear"){
     backMarkerRemove();
     frontMarkerRemove();
  }



 });///////////////////////////////////////////////////////////end dispatch for coord



    projection.clipAngle(180);


   layerGlobeBackground.append('circle')
    .attr('cx', 480)
    .attr('cy', 250)
    .attr('r', 250)
    .style('fill', 'orange');



  function backMarker(d){
    layerGlobeBackMarker.selectAll('circle.back').data(d)
      .enter()
      .append('circle')
      .attr('class', 'data back')
      .attr('cx', function(d){return d.φλ[0];})
      .attr('cy', function(d){return d.φλ[1];})
      .attr('fill', "blue")
      .attr('stroke', '#FFF')
      .attr('stroke-width', 1.0)
      .attr('opacity', 0.75)//0.75
      .attr('visibility', isVisible.back)
      .attr('r', 7);
   }

    function backMarkerRemove(d){
    svgG.selectAll('circle.back').remove();//need to remove circle
  }



    layerGlobeFeatures.append('path')
        .datum(topojson.feature(world, world.objects.ne_110m_land))
        .attr("class", "land back")
        .attr('opacity', 0.1)//0.8
        .attr('fill', '#dadac4')
        .attr("d", path);
    projection.clipAngle(90);

    layerGlobeFeatures.append('path')
        .datum(graticule)
        .attr('class', 'grid front')
        .attr('fill', 'none')
        .attr('stroke', '#CCC')
        .attr('d', path);

    layerGlobeFeatures.append('path')
        .datum(sphere)
        .attr('class', 'grid front')
        .attr('fill', 'rgba(255,255,255,0.4)')
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .attr('d', path);
    layerGlobeFeatures.append("path")
        .datum(topojson.feature(world, world.objects.ne_110m_land))
        .attr("class", "land front")
        .attr('fill', '#737368')
        .attr('opacity', 0.8)//0.8
        .attr("d", path);



    function frontMarker(d){
    layerGlobeFrontMarker.selectAll('circle.front').data(d)
      .enter()
     //.filter(function(d,i){
     //return i===mcoord})//0,1,2
     // return i})
      .append('circle')
      .attr('class', 'data front')
      .attr('cx', function(d){return d.φλ[0];})
      .attr('cy', function(d){return d.φλ[1];})
      .attr('fill', "red")
      .attr('stroke', '#FFF')
      .attr('stroke-width', 1.0)
      .attr('opacity', 0.75)
      .attr('visibility', isVisible.front)
      .attr('r', 7);
  }

  function frontMarkerRemove(d){
    svgG.selectAll('circle.front').remove();//need to remove circle
  }

  ////////////////////////////////////////////////////////

    d3.timer(function(elapsed) {

      projection.rotate([velocity * elapsed, 0]).clipAngle(180);
      svgG.selectAll("path.back").attr("d", path);
      projection.clipAngle(90);
      svgG.selectAll("path.front").attr("d", path);

    
            data.forEach(function(d,i) {
         if (i == mcoord){
           
            if(d.data.geoLocation_coord !== null){
              d.data.geoLocation_coord[0].φλ = d.data.geoLocation_coord[0].coordinate();
            }

         }

     });
      


      svgG.selectAll('circle.front')
      //svgG.selectAll('circle.box')
        .attr('cx', function(d){return d.φλ[0];})
        .attr('cy', function(d){return d.φλ[1];})
        .attr('visibility', isVisible.front);
        svgG.selectAll('circle.back')
          .attr('cx', function(d){return d.φλ[0];})
          .attr('cy', function(d){return d.φλ[1];})
          .attr('visibility', isVisible.back);

     // }

    });//d3.timer
  
  
  

});//d3.json("ne_110m_land.json

});//ends dispatch.on("load.globe")
//////////////////////////////////////////////////////////////////////////////////////////////////////




////TREE////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dispatch.on("load.tree", function(treeData) {

//in tree
dispatch.on("statechange.treecoordinate",function(coord){
});


  // Set the dimensions and margins of the diagram
  var margin = {top: 20, right: 90, bottom: 30, left: 60},//using left margin move tree to right to make room for globe
      width = 4000 - margin.left - margin.right,
      height = 2000 - margin.top - margin.bottom;


  var treeContainer = container.append('g').attr('id', "myTreeContainer")//.....................................
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .attr('x', 50)
      .attr('transform', 'translate(300,10)scale(0.15)');


  var svgT = treeContainer///////
      .append("svg")
      .attr('id',"svgTree")//styleCSS//.................................................................
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .attr('x', 50)
      .append("g")
      .attr("transform", "translate("
           + margin.left + "," + margin.top + ")");


var i = 0,
    duration = 750;
    //root;


// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);


//Root logically belongs with the Tree
//  assigns the data to a hierarchy using parent-child relationships
  var root = d3.hierarchy(treeData, function(d) {
     return d.children;
    });




root.x0 = height / 2;
root.y0 = 0;

// Collapse after the second level
root.children.forEach(collapse);

update(root);



// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 480});

  // ****************** Nodes section ***************************

  ///////////////////////////////////////////////////////

  var report = d3.select("svgTree").selectAll("p")
    .data(nodes)
    .enter()
    .append("p")


      .text(function (d,i) {

        return "see id i = " + i + " dd = "+d.data.id;//yes: i = 0 d = QDC | same as d.data.name
       });

  //////////////////////////////////////////////////////////


  // Update the nodes...
  var node = svgT.selectAll('g.node')/////
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

//////////////////////////////////////////////

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });


  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {

        return d._children ? "orange" : "yellow";
      //  return d._children ? "lightsteelblue" : "#fff";//call syntax
    })
    .attr('cursor', 'pointer')

    // findTree

    .on('mouseover',function (d,i){

   //dispatch.call('statechange',this,i);///////////////////////////////////////////////////////////////////////////////////////////////////interact with Globe
    dispatch.call('statechange',this,i);//works
    })

  .on('mouseout',function(){

    dispatch.call('statechange',this,"clear");//////////////////////////////////////////////////////////////////////////////////////////////interact with Globe
  });

//////////////////////////////////////////////////////////////////////

  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svgT.selectAll('path.link')////
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}




});//ends dispatch.on(load.tree)



//mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm




