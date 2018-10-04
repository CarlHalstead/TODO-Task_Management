/*
	LIBRARIES/FRAMEWORKS USED:
		* Bootstrap (https://getbootstrap.com/docs/3.3/)
		* Lodash 	(https://lodash.com)
*/

function body_OnLoad(){
	const NUM_OF_EXAMPLES = 10;

	for(let i = NUM_OF_EXAMPLES; i > 0; i--){
		addTask(
			`Example Task ${i}`, 
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus justo lacus, pretium sit amet volutpat quis, vulputate at enim. Suspendisse.',
			'2019-10-01'
		);
	}
}

function btnAddTask_OnClick(){
	const taskTitle = tbTaskTitle.value;
	const taskDescription = tbTaskDescription.value;
	const taskDueDate = tbDueDate.value;

	addTask(taskTitle, taskDescription, taskDueDate);
}

function btnClearTasks_OnClick(){
	while(existingTasks.firstChild != null)
		existingTasks.removeChild(existingTasks.firstChild);
}

function addTask(title, description, dueDate){
	if( !_.isString(title) 		 || _.isEmpty(title) 	  ||
		!_.isString(description) || _.isEmpty(description) ||
		!_.isString(dueDate) 	 || _.isEmpty(dueDate)){

		alert('Make sure that the task you are trying to add has the contents filled in!');
	    return;
	}

	if(doesTaskExist(title)){
		alert('A task with that name already exists, please choose another!');
		return;
	}

	/*
		Create a HTML element with this layout

		<div>
			<h3 class="padded-text">Example Task Title</h3>
			<h4 class="padded-text">Due Date: 2018-10-3</h4>
			<p class="padded-text">Example Task Description - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus justo lacus, pretium sit amet volutpat quis, vulputate at enim. Suspendisse.</p>
			
			<br />

			<button id="btnCompleteTask" class="btn btn-success" type="button">Complete Task</button>
			<button id="btnDeleteTask" class="btn btn-danger" type="button">Delete Task</button>

			<hr />
		</div>
	*/

	const outerDiv = document.createElement("div");
	outerDiv.id = title.toLowerCase();

	const titleElement = document.createElement("h3");
	titleElement.classList.add("padded-text");
	titleElement.innerText = title;

	const dueElement = document.createElement("h4");
	dueElement.classList.add("padded-text");
	dueElement.innerText = `Due Date: ${dueDate}`;

	const descriptionElement = document.createElement("p");
	descriptionElement.classList.add("padded-text");
	descriptionElement.innerText = description;

	const breakElement = document.createElement("br");

	const btnCompleteTask = document.createElement("button");
	btnCompleteTask.classList.add("btn");
	btnCompleteTask.classList.add("btn-success");
	btnCompleteTask.innerText = "Complete Task";
	btnCompleteTask.type = "button";

	btnCompleteTask.addEventListener('click', function(){
		completeTaskAtTitle(title);
	});

	const btnDeleteTask = document.createElement("button");
	btnDeleteTask.classList.add("btn");
	btnDeleteTask.classList.add("btn-danger");
	btnDeleteTask.innerText = "Delete Task";
	btnDeleteTask.type = "button";

	btnDeleteTask.addEventListener('click', function(){
		removeTaskAtTitle(title);
	});

	const horizontalRuler = document.createElement("hr");

	outerDiv.appendChild(titleElement);
	outerDiv.appendChild(dueElement);
	outerDiv.appendChild(descriptionElement);
	outerDiv.appendChild(breakElement);
	outerDiv.appendChild(btnCompleteTask);
	outerDiv.appendChild(btnDeleteTask);
	outerDiv.appendChild(horizontalRuler);

	existingTasks.prepend(outerDiv);
}

function doesTaskExist(title){
	// @Optimisation
	// I do not need this temp variable here it is just for clarity
	const element = document.getElementById(title.toLowerCase());
	return element != null;
}

function getTaskElement(title){
	if(!doesTaskExist(title))
		return null;

	return document.getElementById(title.toLowerCase());
}

function completeTaskAtTitle(title){
	console.log('Completing task: ' + title);
}

function completeTaskAtIndex(index){
	console.log('Completing task at index: ' + index);
}

function removeTaskAtTitle(title){
	if(!doesTaskExist(title))
		return;

	const taskElement = getTaskElement(title);
	existingTasks.removeChild(taskElement);
}

function removeTaskAtIndex(index){
	if(existingTasks.childElementCount <= index)
		return;

	const taskElement = existingTasks.childNodes[index];
	existingTasks.removeChild(taskElement);
}
