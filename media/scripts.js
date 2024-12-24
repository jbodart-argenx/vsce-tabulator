/* eslint-env browser */
/* global acquireVsCodeApi */


const vscode = acquireVsCodeApi();

let headerFilter = false;
let classes = {};
let data;

const metadataDiv = document.getElementById('metadata');
const rotateButton = metadataDiv.querySelector('#rotateButton');
const rotateLabel = metadataDiv.querySelector('#rotateLabel');
const toggleDiv = metadataDiv.querySelector('#toggleDiv');
const resizableDiv = metadataDiv.querySelector('#resizable');
const handle = metadataDiv.querySelector('#handle');
const metatoprow = metadataDiv.querySelector('#metaTopRow');
// const requestDataButton = document.getElementById("requestDataButton");
const requestDataButton = metadataDiv.querySelector('#requestDataButton');

const columnsField = metadataDiv.querySelector('#columns');
const rowsField = metadataDiv.querySelector('#rows');
const groupByField = metadataDiv.querySelector('#groupBy');
const havingField = metadataDiv.querySelector('#having');
const orderByField = metadataDiv.querySelector('#orderBy');
const sourceField = metadataDiv.querySelector('#source');

const hiddenColumnsField = metadataDiv.querySelector('#hiddenColumns');
const totalField = metatoprow.querySelector('#total');
const limitField = metatoprow.querySelector('#limit');
const displayedRowsField = metatoprow.querySelector('#displayedRows');
const filePropertiesField = metadataDiv.querySelector('#fileProperties');

const fontSelector = metatoprow.querySelector('#font-selector');
// const whiteSpaceSelector = metatoprow.querySelector('#white-space-selector');
const dynamicStyles = document.getElementById('dynamic-styles');


const table = new Tabulator("#tabulator-table", {
   data: data, // set initial data
   height: "100%", // set height of table
   resizableColumns: true, // allow columns width to be changed
   movableColumns: true, // allow column order to be changed
   resizableRows: true, // allow row height to be changed
   autoColumns: "full", // true, // create columns from data field names
   //layout: "fitDataTable", // fit table width and columns width to the data
   layout: "fitData", // fit columns width to the data
   layoutColumnsOnNewData:true,
   columnDefaults: {
      maxInitialWidth: `${window.innerWidth - 50}px`,
      headerFilter: headerFilter,
      tooltip: function (e, cell, onRendered){
         // e           -  mouseover event
         // cell        -  cell component
         // onRendered  -  onRendered callback registration functionton - allows you to register a callback that will be triggered
         //                when the popup has been added to the DOM but before its position is confirmed.
         const tooltipElement = document.createElement("div");
         tooltipElement.style.backgroundColor = "lightblue";
         tooltipElement.innerText = cell.getColumn().getField() + " - " + cell.getValue(); //return cells "field - value";
         tooltipElement.style.backgroundColor = 'var(--vscode-button-background, #fff)';
         tooltipElement.style.border = '1px solid var(--vscode-button-foreground, #ccc)';
         tooltipElement.style.padding = '5px';
         tooltipElement.style.boxShadow = '3px 3px 15px 5px rgba(0, 0, 0, 0.3)';
         tooltipElement.style.zIndex = '10';
         tooltipElement.style.maxWidth = '90%'; // '400px';
         tooltipElement.style.wordWrap = 'break-word';
      
         onRendered(function(){ 
            tooltipElement.style.display = "block";
            const target = cell.getElement();
            const rect = target.getBoundingClientRect();
            tooltipElement.style.left = `${rect.left + window.scrollX + 3}px`;
            tooltipElement.style.top = `${rect.top + window.scrollY + 3}px`;
            tooltipElement.style.position = 'absolute';
         });
         
         return tooltipElement; 
      },
      headerTooltip: true,
   },
   autoColumnsDefinitions:function(definitions){
      //definitions - array of column definition objects
      definitions.forEach((column) => {
         // column.headerFilter = true; // add header filter to every column
         // set column initial maxwidth to viewport width - 50px
         // column.maxInitialWidth = `${window.innerWidth - 50}px`;
         if (!classes[column.field]) {
            // Add a default class for the column based on the auto-assigned column sorter
            classes[column.field] = column.sorter;
         }
         column.title = decorateHeader(column.field, classes);
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
});

// Add event listeners to update vertical overflow indicators
table.on("columnWidth", function (column) {
   updateVerticalOverflowIndicatorsForColumn(column.getField());
});
table.on("rowHeight", function (row) {
   updateVerticalOverflowIndicatorsForRow(row.getElement());
});

// Wait for the table to be built
table.on("tableBuilt", function () {
   if (!data) {
      data = generateTestData();
   }
   
   if (Array.isArray(data)) {
      table.setData(data);
      updateMetadata({ 
         total: data.length,
         maxRows: Math.max(5000, data.length),
         rows: data.length > 0 ? `1:${data.length}` : '',
         start: data.length > 0 ? 1 : NaN,
         end: data.length,
      });
   } else if (data instanceof Object && data != null) {
      const fields = Object.keys(data).filer(field => Array.isArray(data[field]));
      table.setData(data);
      updateMetadata({ 
         total: data[fields[0]].length, 
         maxRows: Math.max(5000, data[fields[0]].length),
         rows: data[fields[0]].length > 0 ? `1:${data[fields[0]].length}` : '',
         allColnames: fields,
         start: data[fields[0]].length > 0 ? 1 : NaN,
         end: data.length,
      });
   } else {
      alert(`Unexpected data type: ${typeof data}`);
   }
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

// Add event listener to update global font
// eslint-disable-next-line no-unused-vars
function updateGlobalFont() {
   const selectedValue = fontSelector.value;
   const styleSheet = dynamicStyles.sheet;
   const rules = styleSheet.cssRules || styleSheet.rules;
   
   for (let i = 0; i < rules.length; i++) {
      if (rules[i].selectorText === '.tabulator-cell') {
         if (selectedValue === 'proportional') {
            rules[i].style.fontFamily = 'var(--vscode-font-family, "Segoe WPC", "Segoe UI", sans-serif)';
         } else {
            rules[i].style.fontFamily = 'var(--vscode-editor-font-family, Consolas, "Courier New", Courier, monospace)';
         }
      }
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

// Add event listener to toggle metadata
rotateButton.addEventListener('click', () => {
   // Toggle the 'rotated' class on the button label
   rotateLabel.classList.toggle('rotated');

   // Toggle the visibility of the div
   if (rotateLabel.classList.contains('rotated')) {
      toggleDiv.classList.add('visible');
      handle.classList.add('visible');
      // const lineHeight = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const handleHeight = handle.offsetHeight;
      const metatoprowHeight = metatoprow.offsetHeight;
      resizableDiv.style.height = Math.max(
         metatoprowHeight,
         Math.min(metatoprowHeight + toggleDiv.scrollHeight + handleHeight, 0.5 * window.innerHeight)
      ) + 'px';
      // toggleDiv.style.maxHeight = 4.5 * lineHeight + 'px';
      toggleDiv.style.maxHeight = (resizableDiv.offsetHeight - (metatoprow.offsetHeight + handle.offsetHeight)) + 'px';
   } else {
      toggleDiv.classList.remove('visible');
      handle.classList.remove('visible');
      resizableDiv.style.height = metatoprow.offsetHeight + 'px';
   }

   // Adjust Table Height
   // setTimeout(adjustTableHeight, 20);
});

// Add event listener to resize metadata div
handle.addEventListener('mousedown', function(e) {
   e.preventDefault();
   if (toggleDiv.classList.contains('visible')) {
      document.addEventListener('mousemove', resizeDiv);
      document.addEventListener('mouseup', stopResizeDiv);
   }
});
function resizeDiv(e) {
   const newHeight = e.clientY - resizableDiv.getBoundingClientRect().top;
   const metatoprowHeight = metatoprow.offsetHeight;
   const handleHeight = handle.offsetHeight;
   resizableDiv.style.height = Math.max(
      metatoprowHeight,
      Math.min(newHeight, metatoprowHeight + toggleDiv.scrollHeight + handleHeight, 1.0 * window.innerHeight)) + 'px';
   toggleDiv.style.maxHeight = (resizableDiv.offsetHeight - handleHeight - metatoprowHeight) + 'px';
   // adjustTableHeight()
}
function stopResizeDiv() {
   document.removeEventListener('mousemove', resizeDiv);
   document.removeEventListener('mouseup', stopResizeDiv);
}

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
         dob: new Date(`1990-01-${(i % 30) + 1}`).toISOString().split("T")[0],
         car: `Car ${i}`,
         description: generateRandomText(
            Math.floor(Math.random() * 201)
         ),
      });
   }
   return data;
}


// Add method to replace special spaces to the String prototype
// (as non-breaking spaces can easily get inserted when copying & pasting between fields)
String.prototype.replaceSpecialSpaces = function() {
   const tab = '\t';
   const nonBreakingSpace = '\u00A0';
   const zeroWidthSpace = '\u200B';
   
   return this
      .replaceAll(tab, '    ')
      .replaceAll(nonBreakingSpace, ' ')
      .replaceAll(zeroWidthSpace, '');
};

function decorateHeader(header, classes) {
   const classname = classes[header];
   if(!header || ! classes) return header;
   switch (classname) {
      case 'number':
      case 'numeric':
         header += ' 🔟';
         break;
      case 'string':
      case 'character':
         header += ' 🅰️';
         break;
      case 'Date':
      case 'date':
         header += ' 📆';
         break;
      case 'time':
      case 'hms':
      case 'ITime':
         header += ' 🕒';
         break;
      case 'datetime':
      case 'POSIXct':
      case 'POSIXlt':
         header += ' 📅🕒';
         break;
      default:
         break;
   }
   return header;
}

// Hanlde Enter key press in editable fields
function handleEnter(element) {
   // Your custom function logic here
   console.log('Enter pressed in:', element.id, ' text content:', element.textContent, ' inner html:', element.innerHTML);
   let metadata = window.metadata;
   // const nonBreakingSpace = '\u00A0';
   // const zeroWidthSpace = '\u200B';
   // const specialSpaces = new RegExp(`[\t${zeroWidthSpace}${nonBreakingSpace}]`, 'g');  // equivalent to: /[\t\u200B\u00A0]/g
   metadata.maxRows = +(`${limitField.textContent.replaceSpecialSpaces()}`.trim() || metadata.maxRows || 5000);
   metadata.rows = rowsField.textContent.replaceSpecialSpaces() || '';
   metadata.groupBy = groupByField.textContent.replaceSpecialSpaces() || '';
   metadata.retrieve = toggleDiv.querySelector('input[name="retrieve"]:checked').value || '';
   metadata.orderBy = orderByField.textContent.replaceSpecialSpaces() || '';
   metadata.having = havingField.textContent.replaceSpecialSpaces() || '';
   const val = displayedRowsField.textContent.replaceSpecialSpaces();
   if (/^\s*\d+:\d+\s*$/.test(val)) {
      metadata.offset = +val.split(':')[0] - 1;
      displayedRowsField.textContent = `${+metadata.offset + 1}:${Math.min(+metadata.offset + metadata.maxRows, +metadata.total)}`
   }
   if (element.id === 'columns') {
      // re-derive hiddenColumns based on selected columns
      metadata.columns = columnsField.textContent.replaceSpecialSpaces(); // .split(',');
      metadata.columns = `${metadata.columns}`
         .replaceAll(/(^(\s*,\s*)+|(\s*,\s*)+$)/g, '')
         .replaceAll(/(^,*|,*$)/g, '')
         .replaceAll(/,(\s*,)+/g, ',')
         .replaceAll(/,(?!\s)/g, ', ');
      columnsField.textContent = metadata.columns;
      // metadata.hiddenColumns = metadata.colnames.filter((item) => !metadata.columns.includes(item));
      metadata.hiddenColumns = metadata.colnames.filter((item) => !`${metadata.columns}`.split(/[^\w.]/).includes(item));
      hiddenColumnsField.textContent = `${metadata.hiddenColumns}`.replaceAll(/,(?!\s)/g, ', ');
   }
   if (element.id === 'hiddenColumns') {
      if ((/^\s*\[.*\]\s*$/).test(`${metadata.columns}`)) {
         // re-derive hiddenColumns based on selected columns
         metadata.columns = columnsField.textContent.replaceSpecialSpaces(); // .split(',');
         // metadata.hiddenColumns = metadata.colnames.filter((item) => !metadata.columns.includes(item));
         metadata.hiddenColumns = metadata.colnames.filter((item) => !`${metadata.columns}`.split(/[^\w.]/).includes(item));
         hiddenColumnsField.textContent = `${metadata.hiddenColumns}`.replaceAll(/,(?!\s)/g, ', ');
      } else {
         // remove new hiddenColumns from columns, add removed hiddenColumns to columns
         metadata.hiddenColumns = hiddenColumnsField.textContent
            .replaceSpecialSpaces()
            .split(',')
            .map(item => `${item}`.trim());
         const addColumns = metadata.colnames
            .filter((item) => !metadata.hiddenColumns.includes(item))
            .filter((item) => !`${metadata.columns}`.split(/[^\w.]/).includes(item));
         const removeColumns = metadata.colnames
            .filter((item) => metadata.hiddenColumns.includes(item))
            .filter((item) => `${metadata.columns}`.split(/[^\w.]/).includes(item));
         columnsField.textContent = (`${metadata.columns}`
            .replaceAll(new RegExp(`(^|,)\\s*(${removeColumns.join('|')})\\s*(,|$)`, 'g'), ',')
            + `,${addColumns}`)
            .replaceAll(/(^,*|,*$)/g, '')
            .replaceAll(/,(\s*,)+/g, ',')
            .replaceAll(/,(?!\s)/g, ', ');
      }
   }
   let newSource = sourceField.textContent.replaceSpecialSpaces() || '';
   if (newSource && newSource !== metadata.source) {
      metadata = { source: newSource };
      if (/^[\w.-]+:[\\/]{2}[\w.-]+[\\/][\w.-]+/.test(newSource)) {
         // for a URI allpath separators should be '/'
         metadata.source = metadata.source.replaceAll('\\', '/');
         sourceField.textContent = metadata.source;
         console.log(`Detected URL source: ${metadata.source}`);
      } else {
         // For local files replace '/' and '\' by the OS path separator
         metadata.source = metadata.source.replaceAll(/[/\\]/g, window.pathSeparator || '\\');
         sourceField.textContent = metadata.source;
         console.log(`Detected non-URL source: ${metadata.source}`);
      }
      columnsField.textContent = '';
      rowsField.textContent = '';
      groupByField.textContent = '';
      havingField.textContent = '';
      orderByField.textContent = '';
      hiddenColumnsField.textContent = '';
      displayedRowsField.textContent = '';
   }
   metadata.requestType = 'updateData'; 
   window.metadata = metadata;
   window.requestData(metadata);
}

function checkEnter(event) {
   // debugger ;
   if (event.key === 'Enter') {
      if (!event.shiftKey && !event.ctrlKey) {
         event.preventDefault(); // Prevents the default action of adding a newline
         handleEnter(event.target);
      }
   }
}

function handleBlur(element) {
   // debugger ;
   let metadata = window.metadata;
   if (element.target.id === 'columns') {
      // re-derive hiddenColumns based on selected columns
      metadata.columns = columnsField.textContent.replaceSpecialSpaces(); // .split(',');
      metadata.columns = `${metadata.columns}`
         .replaceAll(/(^(\s*,\s*)+|(\s*,\s*)+$)/g, '')
         .replaceAll(/(^,*|,*$)/g, '')
         .replaceAll(/,(\s*,)+/g, ',')
         .replaceAll(/,(?!\s)/g, ', ');
      columnsField.textContent = metadata.columns;
      // metadata.hiddenColumns = metadata.colnames.filter((item) => !metadata.columns.includes(item));
      metadata.hiddenColumns = metadata.colnames.filter((item) => !`${metadata.columns}`.split(/[^\w.]/).includes(item));
      hiddenColumnsField.textContent = `${metadata.hiddenColumns}`
         .replaceAll(/(^,*|,*$)/g, '')
         .replaceAll(/,(\s*,)+/g, ',')
         .replaceAll(/,(?!\s)/g, ', ');
   }
   if (element.target.id === 'hiddenColumns') {
      if ((/^\s*\[.*\]\s*$/).test(`${metadata.columns}`)) {
         // re-derive hiddenColumns based on selected columns
         metadata.columns = columnsField.textContent.replaceSpecialSpaces(); // .split(',');
         // metadata.hiddenColumns = metadata.colnames.filter((item) => !metadata.columns.includes(item));
         metadata.hiddenColumns = metadata.colnames.filter((item) => !`${metadata.columns}`.split(/[^\w.]/).includes(item));
         hiddenColumnsField.textContent = `${metadata.hiddenColumns}`.replaceAll(/,(?!\s)/g, ', ');
      } else {
         // remove new hiddenColumns from columns, add removed hiddenColumns to columns
         metadata.hiddenColumns = hiddenColumnsField.textContent
            .replaceSpecialSpaces()
            .split(',')
            .map(item => `${item}`.trim());
         hiddenColumnsField.textContent = `${metadata.hiddenColumns}`
            .replaceAll(/,(?!\s)/g, ', ');
         const addColumns = metadata.colnames
            .filter((item) => !metadata.hiddenColumns.includes(item))
            .filter((item) => !`${metadata.columns}`.split(/[^\w.]/).includes(item));
         const removeColumns = metadata.colnames
            .filter((item) => metadata.hiddenColumns.includes(item))
            .filter((item) => `${metadata.columns}`.split(/[^\w.]/).includes(item));
         metadata.columns = (`${metadata.columns}`
            .replaceAll(new RegExp(`(^|,)\\s*(${removeColumns.join('|')})\\s*(,|$)`, 'g'), ',')
            + `,${addColumns}`)
            .replaceAll(/(^,*|,*$)/g, '')
            .replaceAll(/,(\s*,)+/g, ',')
            .replaceAll(/,(?!\s)/g, ', ');
         columnsField.textContent = metadata.columns;
      }
   }
   window.metadata = metadata;
}

function updateMetadata(metadata) {
   metadata.colnames = metadata.allColnames || metadata.colnames || metadata.headers || [];
   metadata.columns = metadata.columns || metadata.colnames || [];
   metadata.hiddenColumns = metadata.colnames.filter((item) => !`${metadata.columns}`.split(/[^\w.]/).includes(item));
   metadata.rows = metadata.rows || '';
   metadata.orderBy = metadata.orderBy || '';
   metadata.colClasses = metadata.colClasses || { } ;
   window.metadata = metadata;

   sourceField.textContent = metadata.source;
   columnsField.textContent = `${metadata.columns}`.replaceAll(/,(?!\s)/g, ', ');
   hiddenColumnsField.textContent = `${metadata.hiddenColumns}`.replaceAll(/,(?!\s)/g, ', ');
   rowsField.textContent = metadata.rows;
   displayedRowsField.textContent = `${metadata.start}:${metadata.end}`;
   orderByField.textContent = `${metadata.orderBy || ''}`;
   groupByField.textContent = `${metadata.groupBy || ''}`;
   havingField.textContent = `${metadata.having || ''}`;
   if (metadata.retrieve) {
      const radio = toggleDiv.querySelector('input[name="retrieve"][value="${metadata.retrieve}"]');
      if (radio) radio.checked = true;
   }
   totalField.textContent = `${metadata.total}`;
   limitField.textContent = `${metadata.maxRows}`;

   let { size, mtime, ctime, created, lastModified, createdBy, lastModifiedBy, versioned, checkedOut, locked, digest } = 
      {...metadata.fileStat, ...metadata.fileProperties};
   let fileProperties = { 
      size, 
      created: created || ctime != null ? new Date(ctime).toISOString() : null,
      lastModified: lastModified || mtime != null ? new Date(mtime).toISOString() : null,
      createdBy,
      lastModifiedBy,
      versioned,
      checkedOut,
      locked,
      digest
   }

   filePropertiesField.textContent = Object.entries(fileProperties)
      .map(([k, v]) => v != null ? `${k}: ${v}` : '')
      .filter(v => v)
      .join(', ');

   // Adding Event Listeners to .editable objects
   metadataDiv.querySelectorAll('.editable').forEach(element => {
      element.addEventListener('keydown', checkEnter);
      element.addEventListener('blur', handleBlur);
   });
}



// Request data from the extension
function requestData(metadata) {
   if (typeof metadata === 'object' && metadata != null && ! (metadata instanceof Event)) {
      metadata.source = sourceField.textContent.replaceSpecialSpaces() || '';
      metadata.columns = (columnsField.textContent.replaceSpecialSpaces() || '') // .split(','); // .split() needed ?
      metadata.rows = rowsField.textContent.replaceSpecialSpaces() || '';
      metadata.groupBy = groupByField.textContent.replaceSpecialSpaces() || '';
      metadata.retrieve = toggleDiv.querySelector('input[name="retrieve"]:checked').value || '';
      metadata.having = havingField.textContent.replaceSpecialSpaces() || '';
      metadata.orderBy = orderByField.textContent.replaceSpecialSpaces() || '';

      console.log('Webview requesting data...', { metadata });
      try {
         vscode.postMessage({ command: 'requestData', metadata });
      } catch (error) {
         debugger;
         console.error('(requestData) error:', error);
      }
   } else {
      vscode.postMessage({ command: 'requestData' });
   }
   console.log('requestData message posted!');
}

// Send requestData message to extension when button is clicked
requestDataButton.addEventListener("click", requestData);

// Handle messages sent from the extension to the webview
window.addEventListener("message", (event) => {
   const message = event.data;
   switch (message.command) {
      case "updateData":
         if (message.data) {
            table.setData(message.data);
         }
         if (message.metadata) {
            updateMetadata(message.metadata);
         }
         updateVerticalOverflowIndicators();
         break;
   }
});
