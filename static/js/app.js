//FUNCTION "Extractor": Extract from samples.json
//keyword, {extractor: custom name for the function/variable related to accessing the samples.json file.}
//keyword, {depot: custom designation of the dictionary that pulls useful information related to OTU.}
//description, {Iterate through the samples.json data to pull out particular values into a new dictionary (depot) to help future functions access data easily by utilizing keys.}
function extractor(data, idFlag) {
    var pull = data.samples.filter(i => i.id === idFlag);
    var depot = [];
    
    for (var i=0; i < pull[0].sample_values.length; i++) {
        dict = {};
        dict["sample_values"] = pull[0].sample_values[i];
        dict["otu_labels"] = pull[0].otu_labels[i];
        dict["otu_ids"] = `OTU ${pull[0].otu_ids[i]}`;
        dict["otu_ids_original"] = pull[0].otu_ids[i];
        depot.push(dict);
    }
    return depot;
}


//FUNCTION "constructBar": Present horizontal bar graph.
//utilizing previous keywords, {depot}
//keyword, {constructBar: custom name for function to utilize data within depot to create a horizontal bar graph utilizing plotly.}
//keyword, {siftTop10: filter through the depot to contain select values per laid out function or logic.}
//description, {data/layout: simple little buckets of info to slot into 'barPlot' to be plotted.}

function constructBar(depot){
    siftTop10 = depot.sort((firstNum,secondNum)=>firstNum.sample_values - secondNum.sample_values)
        .slice(0,10);
    
    data = [{y: siftTop10.map(i => i.otu_ids), x:siftTop10.map(i=>i.sample_values),
            type: "bar",
            orientation: "h",
            text: siftTop10.map(i=>i.otu_labels)
        }
    ];
    
    layout = {margin:{l: 100,t: 60},
        width: 500,
        height: 400,
    };
    
    var outputBar = [data, layout];
    return outputBar;
}


//FUNCTION "constructBubble": Present bubble plot.
//utilizing previous keywords, {depot}
//description, {data/layout: simple little buckets of info to slot into 'barPlot' to be plotted.}
function constructBubble(depot) {
  data = [{x: depot.map(i => i.otu_ids_original), y: depot.map(i => i.sample_values),
      mode: "markers",
      text: depot.map(i => i.otu_labels),
      marker: {
        color: depot.map(i => i.otu_ids_original),
        size: depot.map(i => i.sample_values),
        colorscale: "Earth"
      }
    }
  ];
  layout = {height: 600,width: 1000};
  var outputBar = [data, layout];
  return outputBar;
}


//FUNCTION Initialize
function init() {
    //Import data from json
    d3.json("samples.json").then(function(data) {console.log(data);
                                                      
    // Append test subject ID
    var selection = d3.select("#selDataset").selectAll("option");
    selection
      .data(data.names)
      .enter()
      .append("option")
      .text(i => i);

    //Pull data from json
    defaultOtu = extractor (data, "940");
    console.log(defaultOtu);

    // Construct bar plot based off default values
    defaultBar = constructBar(defaultOtu);
    console.log(defaultBar);
    Plotly.newPlot("bar", defaultBar[0], defaultBar[1]);

    // Construct bubble plot based off default values
    defaultBubble = constructBubble(defaultOtu);
    Plotly.newPlot("bubble", defaultBubble[0], defaultBubble[1]);

    // Construct demographic information based off default values (940)
    var metadata940 = data.metadata.filter(i => i.id === 940);
    console.log(metadata940);

    row = d3.select("#sample-metadata");
    Object.entries(metadata940[0]).forEach(([key, value]) =>
      row.append("p").text(`${key}: ${value}`)
    );
  });
}

function optionChanged (idFlag) {
  //Import local json file and define variables.
  d3.json("samples.json").then(function(data) {
    var flagValue = d3.select("#selDataset");
    var idFlag = flagValue.property("value");
    var selection = extractor(data, idFlag);

    // Update bar plot
    var updateBar = constructBar(selection);
    console.log(updateBar);
    Plotly.restyle("bar", "x", [updateBar[0][0].x]);
    Plotly.restyle("bar", "y", [updateBar[0][0].y]);
    Plotly.restyle("bar", "text", [updateBar[0][0].text]);

    // Update bubble plot
    var updateBubble = constructBubble(selection);
    Plotly.restyle("bubble", "x", [updateBubble[0][0].x]);
    Plotly.restyle("bubble", "y", [updateBubble[0][0].y]);
    Plotly.restyle("bubble", "text", [updateBubble[0][0].text]);

    // Update demographic Info
    var updateMeta = data.metadata.filter(i => i.id === parseInt(idFlag));
    console.log(updateMeta);
    row = d3.select("#sample-metadata");
    row.html("");
    Object.entries(updateMeta[0]).forEach(([key, value])=>row.append("p").text(`${key}: ${value}`));
  });
}

init();
