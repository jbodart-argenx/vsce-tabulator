/* eslint-env browser */
/* global acquireVsCodeApi */


const vscode = acquireVsCodeApi();

const data = generateTestData();

const table = new Tabulator("#tabulator-table", {
   data: data, // set initial data
   height: "100%", // set height of table
   resizableColumns: true, // allow columns width to be changed
   movableColumns: true, // allow column order to be changed
   resizableRows: true, // allow row height to be changed
   autoColumns: true, // create columns from data field names
   //layout: "fitDataTable", // fit table width and columns width to the data
   layout: "fitData", // fit columns width to the data
   layoutColumnsOnNewData:true,
   columnDefaults: {
      maxInitialWidth: `${window.innerWidth - 50}px`,
      headerFilter: true,
   },
   // autoColumnsDefinitions:function(definitions){
   //    //definitions - array of column definition objects
   //    definitions.forEach((column) => {
   //       column.headerFilter = true; // add header filter to every column
   //       // set column initial maxwidth to viewport width - 50px
   //       column.maxInitialWidth = `${window.innerWidth - 50}px`;
   //    });
   //    return definitions;
   // },
   placeholder: "No Data Available",
   rowHeader:{formatter:"rownum", headerSort:true, hozAlign:"right", resizable:true, frozen:true},
   columns: [
      {
         title: "#",
         formatter: "rownum",
         hozAlign: "right",
         headerSort: true,
         sorter: "number",
         frozen: true,
         resizable: true,
      },
   ],
});

// Add event listeners to update vertical overflow indicators
table.on("columnWidth", function (column) {
   updateVerticalOverflowIndicatorsForColumn(column.getField());
});
table.on("rowHeight", function (row) {
   updateVerticalOverflowIndicatorsForRow(row.getElement());
});
table.on("tableBuilt", function () {
   updateVerticalOverflowIndicators();
});

function updateVerticalOverflowIndicators() {
   const cells = document.querySelectorAll(".tabulator-cell");
   cells.forEach((cell) => {
      if (cell.scrollHeight > cell.clientHeight) {
         cell.classList.add("overflow");
      } else {
         cell.classList.remove("overflow");
      }
   });
}

function updateVerticalOverflowIndicatorsForColumn(columnField) {
   const cells = document.querySelectorAll(
      `.tabulator-cell[tabulator-field="${columnField}"]`
   );
   cells.forEach((cell) => {
      if (cell.scrollHeight > cell.clientHeight) {
         cell.classList.add("overflow");
      } else {
         cell.classList.remove("overflow");
      }
   });
}

function updateVerticalOverflowIndicatorsForRow(rowElement) {
   if (rowElement) {
      const cells = rowElement.querySelectorAll(".tabulator-cell");
      cells.forEach((cell) => {
         if (cell.scrollHeight > cell.clientHeight) {
            cell.classList.add("overflow");
         } else {
            cell.classList.remove("overflow");
         }
      });
   }
}

// Add event listener to toggle wrap text in table cells
document
   .getElementById("toggleWrapCheckbox")
   .addEventListener("change", (event) => {
      const tableElement = document.querySelector("#tabulator-table");
      if (event.target.checked) {
         tableElement.classList.add("wrap-text");
         tableElement.classList.remove("nowrap-text");
      } else {
         tableElement.classList.add("nowrap-text");
         tableElement.classList.remove("wrap-text");
      }
      const fullReRender = true;
      table.redraw(fullReRender);
      updateVerticalOverflowIndicators();
   });


// Generate test data
function generateTestData() {
   function generateRandomText(wordCount) {
      const words =
         "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(
            " "
         );
      let text = "";
      for (let i = 0; i < wordCount; i++) {
         text += words[Math.floor(Math.random() * words.length)] + " ";
      }
      return text.trim();
   }  
   const data = [];
   for (let i = 0; i < 5000; i++) {
      data.push({
         name: `Name ${i}`,
         progress: Math.floor(Math.random() * 100),
         gender: i % 2 === 0 ? "Male" : "Female",
         rating: Math.floor(Math.random() * 5) + 1,
         col: `Color ${i}`,
         dob: `1990-01-${(i % 30) + 1}`,
         car: `Car ${i}`,
         description: generateRandomText(
            Math.floor(Math.random() * 201)
         ),
      });
   }
   return data;
}

// Send requestData message to extension when button is clicked
document
   .getElementById("requestDataButton")
   .addEventListener("click", () => {
      vscode.postMessage({ command: "requestData" });
   });

// Handle messages sent from the extension to the webview
window.addEventListener("message", (event) => {
   const message = event.data;
   switch (message.command) {
      case "updateData":
         table.setData(message.data);
         updateVerticalOverflowIndicators();
         break;
   }
});