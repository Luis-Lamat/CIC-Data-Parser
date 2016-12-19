
// OBJECTS
main_button = document.getElementById("btn");
download_button = document.getElementById("btn-csv");
query_input = document.getElementById("query_input");
response_box = document.getElementById("response");
summary_div = document.getElementById("summary");
file_name_input = document.getElementById("filename");
response_json = undefined;


// FUNCTIONS

function do_stuff() {
	var query = query_input.value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
        	var json = JSON.parse(xhttp.response);
            response_box.innerHTML = xhttp.response.slice(0, 2000) + "...";
            summary_div.innerHTML = "<h4> Total rows: " + json.rows.length + "<h4>";
            response_json = json;
        }
        else {
            console.log("Failed...");
        };
    };
    xhttp.open("GET", "https://cicadmin.carto.com/api/v2/sql?q=" + query, true);
    xhttp.send();
};

function download_csv() {
	if (response_json) {
		JSONToCSVConvertor(response_json.rows, "", true);
	} else {
		response_box.innerHTML = "Please press parse first, or wait a couple of seconds.";
	}
}

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = !!file_name_input.value ? file_name_input.value : "My_Report";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Creating blob
    var blobdata = new Blob([CSV],{type : 'text/csv'});
    

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = window.URL.createObjectURL(blobdata);
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// BINDINGS
main_button.onclick = do_stuff;
download_button.onclick = download_csv;