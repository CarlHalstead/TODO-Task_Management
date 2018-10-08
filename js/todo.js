/*
	LIBRARIES/FRAMEWORKS USED:
		* Bootstrap (https://getbootstrap.com/docs/3.3/)
		* Lodash 	(https://lodash.com)
 */

/*
	@Refactor
	Currently, our data is stored in our HTML. I think this is a bad way of
	doing it. When we add a task, it should be added to an array first
	before adding the new task to the webpage. As opposed to what we are doing 
	now, which is store this information in the page and extract it when we want
	to export this information.
 */

function body_OnLoad(){
	if(doesCookieExist("savedTasks")){
		importTasks(getCookie("savedTasks"));
		return; 
	}

	const NUM_OF_EXAMPLES = 10;

	for(let i = NUM_OF_EXAMPLES; i > 0; i--){
		addTask(
			`Example Task ${i}`, 
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus justo lacus, pretium sit amet volutpat quis, vulputate at enim. Suspendisse.',
			'2019-01-01'
		);
	}
}

function btnAddTask_OnClick(){
	const taskTitle = tbTaskTitle.value;
	const taskDescription = tbTaskDescription.value;
	const taskDueDate = tbDueDate.value;

	if( !_.isString(taskTitle) 		 || _.isEmpty(taskTitle) 	   ||
		!_.isString(taskDescription) || _.isEmpty(taskDescription) ||
		!_.isString(taskDueDate) 	 || _.isEmpty(taskDueDate)){

		alert('Make sure that the task you are trying to add has the contents filled in!');
		return;
	}

	if(doesTaskExist(taskTitle)){
		alert(`A task with the name '${title}' already exists, please choose another!`);
	}

	addTask(taskTitle, taskDescription, taskDueDate);
}

function btnClearTasks_OnClick(){
	removeAllTasks();	
}

function btnExportTasks_OnClick(){
	const allTasks = [];

	for(let i = 0; i < getNumberOfTasks(); i++){
		const taskElement = getTaskElementAtIndex(i);

		// @Workaround
		// For some reason we are getting an undefined element. We should not be. This 
		// is a workaround.
		if(_.isNull(taskElement) || _.isUndefined(taskElement))
			continue;

		const taskTitle = taskElement.childNodes[0].innerText;

		// @Optimisation
		// If the refactor at the top of this file is implemented, then we
		// would not need this replace call.
		const taskDueDate = taskElement.childNodes[1].innerText.replace("Due Date: ", "");
		const taskDescription = taskElement.childNodes[2].innerText;

		allTasks.push({
			taskTitle,
			taskDueDate,
			taskDescription
		});
	}

	console.log("Your exported JSON is below!");
	console.log(JSON.stringify(allTasks));

	setCookie("savedTasks", JSON.stringify(allTasks));

	// @TODO
	// Allow the user to download this as json. How? I have no idea.
}

function btnImportTasks_OnClick(){
	const tasks = prompt("Please paste your task JSON!", "");

	if(_.isNull(tasks) || _.isUndefined(tasks) || _.isEmpty(tasks)){
		alert("Please input your JSON!");
		return;
	}

	const willReplaceExistingTasks = confirm("Would you like to delete existing tasks?");

	if(willReplaceExistingTasks)
		removeAllTasks();

	importJson(tasks);
}

function importTasks(json){
	const allTasks = JSON.parse(json);

	if(!_.isArray(allTasks)){
		alert("Your JSON is incorrect or malformed! \nAborting the import process!");
		return;
	}

	// We loop backwards here so that the order is preserved when exporting and
	// re-importing data.
	for(let i = allTasks.length - 1; i >= 0; i--){
		if(doesTaskExist(allTasks[i].taskTitle)){
			alert(`A task with the name '${allTasks[i].taskTitle}' already exists, please choose another!`);
			continue;
		}

		addTask(
			allTasks[i].taskTitle, 
			allTasks[i].taskDescription, 
			allTasks[i].taskDueDate
		);
	}
}

function addTask(title, description, dueDate){
	/*
		Create a HTML element with this layout!

		<div>
			<h3 class="padded-text white-text">Example Task Title</h3>
			<h4 class="padded-text white-text">Due Date: 2018-10-3</h4>
			<p class="padded-text white-text">Example Task Description - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus justo lacus, pretium sit amet volutpat quis, vulputate at enim. Suspendisse.</p>
			
			<br />

			<button id="btnCompleteTask" class="btn btn-success" type="button">Complete Task</button>
			<button id="btnDeleteTask" class="btn btn-danger" type="button">Delete Task</button>

			<hr />
		</div>
	*/

	// @Readability @Maintainability
	// This could be cleaned up a fair amount if I use JQuery.
	// Probably will not install it though as that defeats the purpose of this Javascript module.
	const outerDiv = document.createElement("div");
	outerDiv.id = title.toLowerCase();

	const titleElement = document.createElement("h3");
	titleElement.classList.add("padded-text");
	titleElement.classList.add("white-text");
	titleElement.innerText = title;

	const dueElement = document.createElement("h4");
	dueElement.classList.add("padded-text");
	dueElement.classList.add("white-text");
	dueElement.innerText = `Due Date: ${dueDate}`;

	const descriptionElement = document.createElement("p");
	descriptionElement.classList.add("padded-text");
	descriptionElement.classList.add("white-text");
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

// We use toLowerCase on all checks for a task so that 2 tasks cannot be added 
// with the same name.We do this because the title name is what we use to 
// reference each task.

// Could/should reference them using another method as wanting to 
// have 2 tasks named the same is a valid use case.
function doesTaskExist(title){
	// @Optimisation
	// I do not need this temp variable here it is just for clarity
	const element = document.getElementById(title.toLowerCase());
	return element != null;
}

function canAddTask(title){
	return !doesTaskExist(title);
}

function getNumberOfTasks(){
	return existingTasks.childNodes.length;
}

function getTaskElementAtTitle(title){
	if(!doesTaskExist(title))
		return null;

	return document.getElementById(title.toLowerCase());
}

function getTaskElementAtIndex(index){
	// @Optimisation
	// Duplicated check, refactor so we do not check for this multiple times
	if(existingTasks.childElementCount <= index)
		return;

	return existingTasks.childNodes[index];
}

function completeTaskAtTitle(title){
	// @TODO
	// This should send the task to another page or column showing all 
	// completed tasks.
	console.log(`Completing task: ${title}`);
}

function completeTaskAtIndex(index){
	// @TODO
	// See above
	console.log(`Completing task at index: ${index}`);
}

function removeTaskAtTitle(title){
	if(!doesTaskExist(title))
		return;

	const taskElement = getTaskElementAtTitle(title);
	existingTasks.removeChild(taskElement);
}

function removeTaskAtIndex(index){
	if(existingTasks.childElementCount <= index)
		return;

	existingTasks.removeChild(getTaskElementAtIndex(index));
}

function removeAllTasks(){
	while(existingTasks.firstChild != null)
		existingTasks.removeChild(existingTasks.firstChild);
}

function setCookie(key, value){
	document.cookie = `${key}=${value}`;
}

function getCookie(key){
	if(_.isEmpty(document.cookie))
		return "";

	/*
		Cookies follow this pattern:

		cookieName=cookieValue; anotherCookieName=anotherCookieValue	
	 */

	const cookies = document.cookie.split(';');

	for(let i = 0; i < cookies.length; i++){
		const cookie = cookies[i].split('=');
		const cookieKey = cookie[0];
		const cookieValue = cookie[1];

		if(cookieKey === key)
			return cookieValue;
	}
}

function doesCookieExist(key){
	return !_.isEmpty(getCookie(key));
}
