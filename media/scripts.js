/* eslint-env browser */
/* global acquireVsCodeApi */


const vscode = acquireVsCodeApi();

const generatedData = generateTestData();
const table = new Tabulator("#tabulator-table", {
   data: generatedData, // set initial data
   height: "100%", // set height of table
   resizableColumns: true, // allow columns width to be changed
   movableColumns: true, // allow column order to be changed
   resizableRows: true, // allow row height to be changed
   autoColumns: true, // create columns from data field names
   layout: "fitDataTable", // fit columns to width of table
   layoutColumnsOnNewData:true,
   autoColumnsDefinitions:function(definitions){
      //definitions - array of column definition objects

      definitions.forEach((column) => {
         column.headerFilter = true; // add header filter to every column
         // set column initial maxwidth to viewport width - 50px
         column.maxInitialWidth = `${window.innerWidth - 50}px`;
      });

      return definitions;
   },
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
   tableBuilt: function () {
      document
         .querySelectorAll(".tabulator-col-resize-handle")
         .forEach((handle) => {
            handle.addEventListener("mousedown", () => {
               document.addEventListener(
                  "mousemove",
                  handleColumnResize
               );
               document.addEventListener(
                  "mouseup",
                  () => {
                     document.removeEventListener(
                        "mousemove",
                        handleColumnResize
                     );
                  },
                  { once: true }
               );
            });
         });

      document
         .querySelectorAll(".tabulator-row-resize-handle")
         .forEach((handle) => {
            handle.addEventListener("mousedown", () => {
               document.addEventListener("mousemove", handleRowResize);
               document.addEventListener(
                  "mouseup",
                  () => {
                     document.removeEventListener(
                        "mousemove",
                        handleRowResize
                     );
                  },
                  { once: true }
               );
            });
         });

      enableScrolling(); // Call enableScrolling here
      updateVerticalOverflowIndicators(); // Call updateVerticalOverflowIndicators here

   },
});

function handleColumnResize(event) {
   const columnElement = event.target.closest(".tabulator-col");
   if (columnElement) {
      const columnField =
         columnElement.getAttribute("tabulator-field");
      updateVerticalOverflowIndicatorsForColumn(columnField);
   }
}

function handleRowResize(event) {
   const rowElement = event.target.closest(".tabulator-row");
   if (rowElement) {
      // const rowIndex = rowElement.getAttribute("data-index");
      updateVerticalOverflowIndicatorsForRow(rowElement);
   }
}

if (true) {
   table.on("columnResized", function (column) {
      // console.log("columnResized", column.getField());
      updateVerticalOverflowIndicatorsForColumn(column.getField());
   });
   table.on("rowResized", function (row) {
      // console.log("rowResized", row.getElement());
      updateVerticalOverflowIndicatorsForRow(row.getElement());
   });
   table.on("columnWidth", function (column) {
      // console.log("columnWidth", column.getField());
      updateVerticalOverflowIndicatorsForColumn(column.getField());
   });

   table.on("rowHeight", function (row) {
      // console.log("rowHeight", row.getIndex());
      updateVerticalOverflowIndicatorsForRow(row.getElement());
   });
}

function applyCustomScrollbarStyles() {
   const tableHolder = document.querySelector(
      ".tabulator-tableHolder"
   );
   if (tableHolder) {
      tableHolder.style.scrollbarWidth = "thin";
      tableHolder.style.scrollbarColor = "#888 #f0f0f0";

      const style = document.getElementById("dynamic-styles");
      style.textContent = `
         .tabulator-tableHolder::-webkit-scrollbar {
            width: 8px;
            height: 8px;
         }
         .tabulator-tableHolder::-webkit-scrollbar-track {
            background: #f0f0f0;
         }
         .tabulator-tableHolder::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
         }
         .tabulator-tableHolder::-webkit-scrollbar-thumb:hover {
            background: #555;
         }
         .tabulator-tableHolder::-webkit-scrollbar-button {
            display: none; /* Hide buttons if not needed */
         }
      `;
   }
}

function enableScrolling() {
   const tableHolder = document.querySelector(
      ".tabulator-tableHolder"
   );
   if (tableHolder) {
      tableHolder.addEventListener("wheel", (event) => {
         event.preventDefault();
         if (event.shiftKey) {
            tableHolder.scrollBy({
               left: event.deltaY,
               behavior: "smooth",
            });
         } else {
            tableHolder.scrollBy({
               top: event.deltaY,
               behavior: "smooth",
            });
         }
      });
   }
}

function generateTestData() {
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
   // const rowElement = document.querySelector(
   //    `.tabulator-row[data-index="${rowIndex}"]`
   // );
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

window.addEventListener("message", (event) => {
   const message = event.data;
   switch (message.command) {
      case "updateData":
         table.setData(message.data);
         // Apply custom scrollbar styles dynamically after setting data
         applyCustomScrollbarStyles();
         updateVerticalOverflowIndicators();
         break;
   }
});

// Send requestData message to extension when button is clicked
document
   .getElementById("requestDataButton")
   .addEventListener("click", () => {
      vscode.postMessage({ command: "requestData" });
   });

// Apply custom scrollbar styles after table initialization
applyCustomScrollbarStyles();

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

updateVerticalOverflowIndicators();