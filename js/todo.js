/*
	LIBRARIES/FRAMEWORKS USED:
		* Bootstrap (https://getbootstrap.com/docs/3.3/)
		* Lodash 	(https://lodash.com)
 */

/*
	@Improvement
	When a new task is added or an existing one is deleted or completed,
	save the tasks. This is instead of the user having to press 'Export Tasks',
	whenever they need to save. Pretty simple.

	@Refactor
	We have some obsolete code here as well as some naming which could be improved.
	This can be done over time when all or most features have been implemented.

	@Bug
	Date for completed tasks always comes out as undefined.
 */

const ACTIVE_TASKS_COOKIE_NAME 	  = "active-tasks";
const COMPLETED_TASKS_COOKIE_NAME = "completed-tasks";

let currentlyActiveTasks 	= [];
let currentlyCompletedTasks = [];

function getCurrentDate(){
	return new Date().toLocaleDateString();
}

function loadAndDisplayTasks(){
	loadTasks();
	displayTasks();
}

function loadTasks(){
	currentlyActiveTasks = JSON.parse(getCookie(ACTIVE_TASKS_COOKIE_NAME));
	currentlyCompletedTasks = JSON.parse(getCookie(COMPLETED_TASKS_COOKIE_NAME));
}

function redrawTasks(){
	removeAllChildren(existingTasks);
	removeAllChildren(completedTasks);

	displayTasks();
}

function displayTasks(){
	currentlyActiveTasks.forEach((element, index) => {
		displayNewActiveTask(
			element.taskTitle, 
			element.taskDescription, 
			element.taskDueDate
		);
	});

	currentlyCompletedTasks.forEach((element, index) => {
		displayNewCompletedTask(
			element.taskTitle, 
			element.taskDescription, 
			element.taskDueDate
		);
	});
}

function body_OnLoad(){
	if(doesCookieExist(ACTIVE_TASKS_COOKIE_NAME)){
		if(doesCookieExist(COMPLETED_TASKS_COOKIE_NAME)){
			loadAndDisplayTasks();
			return;
		}
	}

	createExampleTasks(10);
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

	addActiveTask(taskTitle, taskDescription, taskDueDate);

	
}

function btnClearTasks_OnClick(){
	removeAllTasks();
}

function btnDeleteCompletedTasks_OnClick(){
	removeAllCompletedTasks();
}

function btnExportTasks_OnClick(){
	setCookie(ACTIVE_TASKS_COOKIE_NAME, JSON.stringify(currentlyActiveTasks));
	setCookie(COMPLETED_TASKS_COOKIE_NAME, JSON.stringify(currentlyCompletedTasks));
	
	// @TODO
	// Allow the user to download this as json. How? I have no idea.
	// If this were ASP.NET I could figure it out but not pure JS.
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

function btnDeleteSavedTasks_OnClick(){
	deleteCookie(ACTIVE_TASKS_COOKIE_NAME);
	deleteCookie(COMPLETED_TASKS_COOKIE_NAME);
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

		addActiveTask(
			allTasks[i].taskTitle, 
			allTasks[i].taskDescription, 
			allTasks[i].taskDueDate
		);
	}
}

function addActiveTask(taskTitle, taskDescription, taskDueDate){
	currentlyActiveTasks.push({
		taskTitle, 
		taskDescription, 
		taskDueDate
	});

	displayNewActiveTask(taskTitle, taskDescription, taskDueDate);
}

function displayNewActiveTask(title, description, dueDate){
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

function addCompletedTask(taskTitle, taskDescription, taskCompletedDate){
	currentlyCompletedTasks.push({
		taskTitle, 
		taskDescription, 
		taskCompletedDate
	});

	displayNewCompletedTask(taskTitle, taskDescription, taskCompletedDate);
}

function displayNewCompletedTask(title, description, completedDate){
	/*
		Create a HTML element with this layout!

		<div>
			<h3 class="padded-text white-text">The tasks title</h3>
			<h4 class="padded-text white-text">Completed: NOW</h4>
			<p class="padded-text white-text">The tasks description</p>
			
			<br />

			<button id="btnDeleteTask" class="btn btn-danger" type="button">Delete Task</button>

			<hr />
		</div>
	*/

	const outerDiv = document.createElement("div");
	outerDiv.id = title.toLowerCase();

	const titleElement = document.createElement("h3");
	titleElement.classList.add("padded-text");
	titleElement.classList.add("white-text");
	titleElement.innerText = title;

	const dueElement = document.createElement("h4");
	dueElement.classList.add("padded-text");
	dueElement.classList.add("white-text");
	dueElement.innerText = `Completed: ${completedDate}`;

	const descriptionElement = document.createElement("p");
	descriptionElement.classList.add("padded-text");
	descriptionElement.classList.add("white-text");
	descriptionElement.innerText = description;

	const breakElement = document.createElement("br");

	const btnDeleteTask = document.createElement("button");
	btnDeleteTask.classList.add("btn");
	btnDeleteTask.classList.add("btn-danger");
	btnDeleteTask.innerText = "Delete Task";
	btnDeleteTask.type = "button";

	btnDeleteTask.addEventListener('click', function(){
		removeCompletedTaskAtTitle(title);
	});

	const horizontalRuler = document.createElement("hr");

	outerDiv.appendChild(titleElement);
	outerDiv.appendChild(dueElement);
	outerDiv.appendChild(descriptionElement);
	outerDiv.appendChild(breakElement);
	outerDiv.appendChild(btnDeleteTask);
	outerDiv.appendChild(horizontalRuler);

	completedTasks.prepend(outerDiv);
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

function getCurrentlyActiveTaskByTitle(title){
	return _.find(currentlyActiveTasks, (element) => {
		return element.taskTitle == title;
	});
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
	const task = getCurrentlyActiveTaskByTitle(title);

	removeTaskAtTitle(title);
	addCompletedTask(task.taskTitle, task.taskDescription, getCurrentDate());
}


function removeTaskAtTitle(title){
	_.remove(currentlyActiveTasks, (element) => {
		return element.taskTitle == title;
	});

	redrawTasks();
}

function removeCompletedTaskAtTitle(title){
	_.remove(currentlyCompletedTasks, (element) => {
		return element.taskTitle == title;
	});

	redrawTasks();
}

function removeAllTasks(){
	removeAllChildren(existingTasks);
}

function removeAllCompletedTasks(){
	removeAllChildren(completedTasks);
}

function setCookie(key, value){
	document.cookie = `${key}=${value}; Path=/;`;
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
		const cookieKey = _.trim(cookie[0]);
		const cookieValue = cookie[1];

		if(cookieKey == key)
			return cookieValue;
	}
}

function deleteCookie(key){
	document.cookie = `${key}=; Path=/; expires=Thur, 01 Jan 1970 00:00:00 GMT`;
}

function doesCookieExist(key){
	return !_.isEmpty(getCookie(key));
}

function createExampleTasks(amount){
	if(!_.isNumber(amount))
		return;

	for(let i = amount; i > 0; i--){
		const taskTitle = `Example Task ${i}`;
		const taskDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus justo lacus, pretium sit amet volutpat quis, vulputate at enim. Suspendisse.';
		const taskDueDate = '2019-01-01';

		addActiveTask(
			taskTitle,
			taskDescription,
			taskDueDate
		);
	}
}
