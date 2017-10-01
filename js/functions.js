
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
var generateTitle = function(gene){
    var geneName = gene.name
    var entrezID = gene.entrezGeneId
    var hugo = gene.hugoSymbol


    return geneName + "\tEntrezID: " + entrezID +
        "\tHugo Symbol: " + hugo

}


var getData = function(data){
    // get columns to display; can be done dynamically as well, but since only a
    // subset is wanted and we know the object we can hard code for now.
    var columns=[
        { "data": ".alteration", title: "Alteration" },
        { "data": "consequence.term", title: "Term" },
        { "data": "proteinStart" , title: "Protein Start Loc" },
        { "data": "proteinEnd" , title: "Protein End Loc" }
        ];
    // Per assignment request: display a column for OncoGene and or TSG Only when one or both terms are true
    if (data[0].gene.oncogene == true) {
        columns.push({title:'OncoGene', data: "gene.oncogene", defaultContent:"-"})
        }
    if (data[0].gene.tsg == true) {
        columns.push({title:'TumorSuppression', data: "gene.tsg", defaultContent:"-"})
        }
    // Now populate the jQuery DataTable.
    // If the table has been prepopulated (prior search run), one needs to reinitialize

    if ( $.fn.dataTable.isDataTable( '#geneTable' ) ) {
        table = $('#geneTable').DataTable();
        table.clear();
        table.rows.add(data);
        table.draw();
    }
    // Otherwise, we can initialize the Table.
    else {
       table = $('#geneTable').DataTable( {
            columns: columns,
            bAutoWidth: true,
            data: data
       } )

    }

    // Now let's gather the data for the break down chart.
    // First, get the unique consequence terms, and there counts.
    var dataCounts = {}
    for (var i = 0; i < data.length; i++) {
        var term = data[i].consequence.term;
        if (!(dataCounts.hasOwnProperty(term))){
            dataCounts[term] = 0
        }
        ++dataCounts[term];
    }
    // Now populate the datapoint object for the Chart.js datapoints
    var chartDataPoints = []
    for (var key in dataCounts) {
        if (dataCounts.hasOwnProperty(key)) {
            chartDataPoints.push({"y" : dataCounts[key], "label": key});
        }
    }

    // Initialize and Create teh Chart.js chart.
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light1",
        title:{
            text: generateTitle(data[0].gene)
        },
        axisY: {
            title: "Count"
        },
        data: [{
            type: "column",
            showInLegend: true,
            legendMarkerColor: "grey",
            legendText: "Mutation Term",
            dataPoints: chartDataPoints
        }]
    });
    chart.render();
 }

$(document).ready(function() {
      $('#searchbutton').click(function(){

        var mygene = $('#gene').val();
        $.ajax({
            'type': 'GET',
            'url': 'http://oncokb.org/api/v1/genes/'+ mygene + '/variants',

            error: function (error) {
                alert("Enter a valid Gene Id")
                },

            success: getData

        });
      })
})