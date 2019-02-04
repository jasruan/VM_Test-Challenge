/*  Code challenge done by Jasmine Ruan */
$(function() { 
    //defining some global variables
   let tableOne = document.querySelector('#table_one');
   let tableTwo = document.querySelector('#table_two');
   let movedItems= [], movedAlbums=[];
   let currId;
    /*
        getDataById - get data based on userId from API and 
        display the data with displayData function by passing in the
        table to be populated and the userId received from the selection
    */
    let getDataById=(currTable, userId)=>{
        $.getJSON(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`, result=>{
        displayData(currTable, result);
        });
    };
    /*
        getFilteredData - filter out the data based on the user's
        input and takes in the table that's being filtered out
        hide or show the row if the title matches with the input
    */
    let getFilteredData=(currTable, inputTitle)=>{
        let currRows = currTable.getElementsByClassName('data__row');   
        for(let i=0;i<currRows.length;i++){
            if(currRows[i].innerText.indexOf(inputTitle)>-1){
                currRows[i].style.display = 'flex';
            }
            else{
                currRows[i].style.display = 'none';
            }            
        }
    };
    /* Used to populate the selection dropdown with all the users
       Gets data and passes the results into the selection dropdown based
       on which table it belongs to  
    */
    let getAllUsers=(baseId)=>{
        $.getJSON('https://jsonplaceholder.typicode.com/users', results=>{
        createSelectionUsers(baseId, results);
        });
    };
    /*
        Create selection dropdown based on passed Id and data received from
        API and tells which table to append to and which table is changing
        the current user of the table
     */
    let createSelectionUsers=(basedId, allUsers)=>{
        let selectionUsers = document.createElement("select");
        selectionUsers.id = 'user_selection' +basedId;
        for(let i=0; i < allUsers.length; i++){
            let option = document.createElement('option');
            option.value = allUsers[i].id;
            option.text = allUsers[i].name; 
            selectionUsers.appendChild(option);
        }
        selectionUsers.addEventListener('change',()=>{
           let oldTable = selectionUsers.parentNode.id;
           let determineTable; 

           if(oldTable == 'table_header_1'){
               determineTable = tableOne;
           }
           else if(oldTable == 'table_header_2'){
                determineTable = tableTwo; 
           }
           $(`#${oldTable}`).nextAll('div').remove();
           getDataById(determineTable, selectionUsers.value);
        });
        selectionUsers.value = basedId;
        $('#table_header_' + basedId).append(selectionUsers);
    }
    /*
        Create all the rows based on passed in data that is received
        from the get methods and appends to the passed in table 
        Attach select and drag events to each table row except 
        for the header. 
     */
    let displayData=(currTable, jsonData)=>{   
        for(let i = 0; i< jsonData.length; i++){
            let tableRow = document.createElement("div");
            tableRow.className="table__row data__row";
            tableRow.addEventListener('click', selectAlbum);
            tableRow.addEventListener('dragstart', dragstart);
            let tableRowId = document.createElement("div");
            tableRowId.className="table__cell table__cell--short";
            let idText = document.createTextNode(jsonData[i].id);
            tableRowId.appendChild(idText);
            let tableRowTitle = document.createElement("div");
            tableRowTitle.className="table__cell";
            let titleText = document.createTextNode(jsonData[i].title);
            tableRowTitle.appendChild(titleText);
            tableRow.appendChild(tableRowId);
            tableRow.appendChild(tableRowTitle);
            tableRow.dataset.user = jsonData[i].userId;
            tableRow.dataset.album = jsonData[i].id;
            tableRow.id = `album_${jsonData[i].id}`;
            currTable.appendChild(tableRow);
        }
        //also creates the dropzone to the table but hides it 
        createDropZone(currTable.id);
        currTable.addEventListener('drop', drop);
    }
    /*
        Selecting an album make it draggable. 
     */
    let selectAlbum=(e)=>{
        let thisItem = e.currentTarget;
        thisItem.classList.toggle('selected');
        thisItem.toggleAttribute('draggable');
        thisItem.setAttribute('draggable', true); 
    }
   /*  
        When it is dragged attach dragover events to the tables
        so that dropzones are visible to the user. Append the selected
        data so that they can be transferred to the other table. 
   */
    let dragstart=(e)=>{
        tableOne.addEventListener('dragover', dragover);
        tableTwo.addEventListener('dragover', dragover);
        let selectedItems = document.querySelectorAll('.selected');
        for(let i=0;i<selectedItems.length;i++){
            movedItems.push(selectedItems[i].id);
            e.dataTransfer.setData('text', movedItems);
            movedAlbums.push(selectedItems[i].getAttribute('data-album'));
        }
        e.dataTransfer.dropEffect = "move";
}
    /* 
        Determines which dropzone should be visible based
        on which table the dragged elements are hovering over. 
    */
    let dragover=(e)=>{
        e.preventDefault();
        let dropzone_one = document.getElementById('dropzone_1');
        let dropzone_two = document.getElementById('dropzone_2');
        if(e.currentTarget.id == 'table_one'){
            currId = $('#user_selection1').val();
            dropzone_one.style.display = 'flex';
            dropzone_one.classList.add('drop_target');
            dropzone_two.style.display = 'none';
            dropzone_two.classList.remove('drop_target');
        }
        else if(e.currentTarget.id == 'table_two'){
            currId = $('#user_selection2').val();
            dropzone_two.style.display = 'flex';
            dropzone_two.classList.add('drop_target');
            dropzone_one.style.display = 'none';
            dropzone_one.classList.remove('drop_target');
        }
    }
    /*
        When dragged elements are dropped they should be
        non-draggable and triggers an ajax request to update
        the album's userID to the new one. Also updates the 
        data-attribute. Empties the arrays to start anew. 
     */
    let drop=(e)=>{
        e.preventDefault();
        let dropTarget = document.querySelector('.drop_target');
        let data = e.dataTransfer.getData('text').split(',');
        for(let i=0;i<data.length; i++){
            let dataDoc = document.getElementById(data[i]);
            dropTarget.insertAdjacentElement('afterend',dataDoc);
            dataDoc.setAttribute('draggable', false);
            dataDoc.setAttribute('data-user',currId);
            document.getElementById(data[i]).classList.remove('selected');
        }
        for(let i=0; i < movedAlbums.length; i++){
            updateData(movedAlbums[i], currId);
        }
        movedAlbums = [];
        movedItems = [];
        dropTarget.style.display = 'none';
    }
    /* 
        Create the dropzones and set their id based on the table
        they are in.
     */
    let createDropZone=(id)=>{
        if(id == 'table_one'){
            id = 1;
        }
        else if(id == 'table_two'){
            id = 2;
        }
        let getAllDrop = document.querySelectorAll('dropzone');
        let dropzone = document.createElement('div');
        dropzone.className='dropzone';
        dropzone.id = `dropzone_${id}`;
        dropzone.innerHTML = 'Drop Here!'
        let currentTable = document.querySelector(`#table_header_${id}`);
        currentTable.insertAdjacentElement('afterend',dropzone);
        
    }
    /*
        Updates the old userId to the new one with patch request since
        we are only updating one part of the album. 
    */
    let updateData=(draggedElement, newId)=>{
        $.ajax({
            url: `https://jsonplaceholder.typicode.com/albums/${draggedElement}`,
            method: 'PATCH',
            data: {
                userId: newId 
            }
        });
    }
    /*
        Probably useless for submit buttons to exist because 
        the table will filter when the user types in something
        but doesn't hurt to have it in case! 
     */
    $('#search_one').click(()=>getFilteredData(tableOne, $('#input_one').val().trim().toLowerCase()));
    $('#search_two').click(()=>getFilteredData(tableTwo, $('#input_two').val().trim().toLowerCase()));  
   /* 
        Filter data based on what's inside the input line.
   */
    $('#input_one').keyup(event=>{
        getFilteredData(tableOne,$('#input_one').val().trim().toLowerCase());
    });
    $('#input_two').keyup(event=>{
        getFilteredData(tableTwo,$('#input_two').val().trim().toLowerCase());
       });
    //Populate the page with both tables
   getDataById(tableOne, 1);
   getDataById(tableTwo, 2);
   getAllUsers(1);
   getAllUsers(2);
});
