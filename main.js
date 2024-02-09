const todoList = document.getElementById("todo_list");
const addTodoButton = document.getElementById('add_todo');

const alertBackground = document.getElementById("alert_background");
const alertBox = document.getElementById("deleteContainer");
const deleteButton = document.getElementById("delete_button");
const cancelButton = document.getElementById("cancel_button");

// Listen for the window load event
window.onload = function () {
    // function to retrieve todo items when the window loads
    retrieveTodoItems();
};


const todoItemTemplate = `
        <div class="todo_item">
            <div class="header">
                <div class="container_time">
                    <input type="text" name="item_title" class="item_title" value="Title" readonly>
                    <p class="date_created">Time</>
                </div>
                <div class="operations">
                    <img src="icons/check.svg" class="icon checked_icon">
                    <img src="icons/edit.svg" class="icon edit_icon">
                    <img src="icons/delete.svg" class="icon delete_icon">
                </div>
            </div>
            <input type="text" name="item_body" class="item_body" value="Placeholder Body" readonly>
        </div>
        `;

// Create a todo
addTodoButton.addEventListener("click", function () {
    const hasValidTitle = document.getElementById("enter_title").value != '';
    const hasValidBody = document.getElementById("enter_todo").value != '';

    const title = document.getElementById("enter_title");
    const body = document.getElementById('enter_todo');

    if (hasValidTitle && hasValidBody) {
        // Add todo to Local Storage
        addTodoToStorage(title, body);

        // Retrieve items from local storage
        retrieveTodoItems();

        // resetting values & colors
        title.value = '';
        body.value = '';

        title.style.border = "1px solid #4f4f4f";
        body.style.border = "1px solid #4F4F4F";

    }

    else if (hasValidTitle && !hasValidBody) {
        title.style.border = "1px solid #4f4f4f";
        body.style.border = "1px solid red";
    }

    else if (!hasValidTitle && hasValidBody) {
        title.style.border = "1px solid red";
        body.style.border = "1px solid #e0e0e0";
    }

    else {
        title.style.border = "1px solid red";
        body.style.border = "1px solid red";
    }
});

// Add to storage
function addTodoToStorage(title, body) {
    // Retrieve existing todo items
    const storedTodoItemsJSON = localStorage.getItem('todoItems');
    const storedTodoItems = JSON.parse(storedTodoItemsJSON) || [];

    // Sample todo items
    const todoItem = {
        id: Date.now(), // Generate unique ID
        title: title.value,
        body: body.value,
        isChecked: false
    }

    // Add the new todo item to the array
    storedTodoItems.push(todoItem);

    // Convert the array back to JSON
    const updatedTodoItemsJSON = JSON.stringify(storedTodoItems);

    // Store teh JSON in local storage with a specific key
    localStorage.setItem('todoItems', updatedTodoItemsJSON);
}


// Todo Retrieval
function retrieveTodoItems() {
    // Retrieve existing todo items
    const storedTodoItemsJSON = localStorage.getItem('todoItems');
    console.log(localStorage.getItem('todoItems'));

    const storedTodoItems = JSON.parse(storedTodoItemsJSON) || [];
    console.log(JSON.parse(storedTodoItemsJSON))

    // Clear existing content in the todo list container
    todoList.innerHTML = '';

    // Iterate over the array of todo items and create HTML elements for each items 
    storedTodoItems.forEach(todoItem => {
        // Create a todo item element
        const todoItemElement = document.createElement("div");
        todoItemElement.innerHTML = todoItemTemplate;



        // Update todo values
        todoItemElement.querySelector(".date_created").innerHTML = formatDate(todoItem.id);
        todoItemElement.querySelector(".item_title").value = todoItem.title;
        todoItemElement.querySelector(".item_body").value = todoItem.body;

        // Add todo to container
        todoList.appendChild(todoItemElement);

        // Checking checked state
        if (todoItem.isChecked) {
            todoItemElement.classList.add('checked');
        }

        // checked
        const checkIcon = todoItemElement.querySelector(".checked_icon");
        checkedTodoItem(checkIcon, todoItemElement, todoItem, storedTodoItems);

        // edit
        const editIcon = todoItemElement.querySelector(".edit_icon");
        editTodoItem(editIcon, todoItem, todoItemElement, storedTodoItems);

        // // delete a todo
        const deleteIcon = todoItemElement.querySelector(".delete_icon");
        deleteTodoItem(deleteIcon, todoItemElement, todoItem, storedTodoItems);
    });
}

function formatDate(timestamp) {
    // Create a new Date object from the timestamp
    const date = new Date(timestamp);

    // Create an Intl.DateTimeFormat object
    const formatter = new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    // Format the date
    const formattedDate = formatter.format(date);

    return formattedDate;
}

// checked a todo item
function checkedTodoItem(checkIcon, todoItemElement, todoItem, storedTodoItems) {
    checkIcon.addEventListener("click", () => {
        const hasClass = todoItemElement.classList.contains("checked");

        if (todoItemElement) {
            // Modifying todo item property of isChecked
            todoItem.isChecked = hasClass ? false : true;

            // convert the modified todo item back to JSON
            const updatedTodoItemsJSON = JSON.stringify(storedTodoItems)

            // Update the value stored in local storage
            localStorage.setItem('todoItems', updatedTodoItemsJSON);

            // Retrieve the values again 
            retrieveTodoItems();
        }
    })
}

// edit a todo item
function editTodoItem(editIcon, todoItem, todoItemElement, storedTodoItems) {
    editIcon.addEventListener("click", (event) => {
        event.stopPropagation();

        const todoTitle = todoItemElement.querySelector(".item_title");
        const todoBody = todoItemElement.querySelector(".item_body");
        const todoHeader = todoItemElement.querySelector(".header");
        const todoOperations = todoItemElement.querySelector(".operations");

        if (todoItemElement) {
            // Make title and body editable
            todoTitle.removeAttribute("readonly");
            todoBody.removeAttribute("readonly");

            // Focus on body input
            todoBody.focus();

            // Remove operations class from header element
            todoHeader.removeChild(todoOperations);

            // Add update button to todoItem header element
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.classList.add('update');
            todoHeader.appendChild(updateButton);

            // Add click handler for update button
            updateTodoItem(todoTitle, todoBody, todoHeader, updateButton, todoOperations, todoItem, storedTodoItems);

            // Add event listener to stop editing when clicking outside todoItem
            document.addEventListener("click", (event) => {
                if (!todoItemElement.contains(event.target)) {
                    // Retrieve previous values
                    retrieveTodoItems();
                }
            });
        }
    })
}

// update an edited todo item
function updateTodoItem(todoTitle, todoBody, todoHeader, updateButton, todoOperations, todoItem, storedTodoItems) {
    updateButton.addEventListener("click", () => {
        // Modifying todo data
        todoItem.title = todoTitle.value;
        todoItem.body = todoBody.value;

        // convert the modified todo item back to JSON
        const updatedTodoItemsJSON = JSON.stringify(storedTodoItems)

        // Update the value stored in local storage
        localStorage.setItem('todoItems', updatedTodoItemsJSON);

        // Retrieve the values again 
        retrieveTodoItems();


        // Restore read-only state and operations element
        todoTitle.setAttribute("readonly", '');
        todoBody.setAttribute("readonly", '');
        todoHeader.appendChild(todoOperations);
        updateButton.remove();
    })
}



// delete a todo item
function deleteTodoItem(deleteIcon, todoItemElement, todoItem, storedTodoItems) {
    deleteIcon.addEventListener("click", () => {

        if (todoItemElement) {
            // displaying confirmation alert
            alertBackground.style.display = "block";
            alertBox.style.display = "block";

            // Passing todoItem to alertDeleteButton
            alertDeleteButton(todoItem, storedTodoItems);
        }
    })
}


// alert confirm button
function alertDeleteButton(todoItem, storedTodoItems) {
    deleteButton.addEventListener("click", () => {
        todoIndex = storedTodoItems.indexOf(todoItem);
        if (todoIndex != -1) {
            storedTodoItems.splice(todoIndex, 1);
        }

        // convert the modified todo item back to JSON
        const updatedTodoItemsJSON = JSON.stringify(storedTodoItems)

        // Update the value stored in local storage
        localStorage.setItem('todoItems', updatedTodoItemsJSON);

        // Retrieve the values again 
        retrieveTodoItems();

        // Dismising Confirmation Alert
        alertBackground.style.display = "none";
        alertBox.style.display = "none";
    });
}

// alert cancel button
cancelButton.addEventListener("click", () => {
    // Dismissing confirmation alert
    alertBackground.style.display = "none";
    alertBox.style.display = "none";
});



