/*
	LIBRARIES/FRAMEWORKS USED:
		* Bootstrap 3 (https://getbootstrap.com/docs/3.3/)
		* Lodash 	  (https://lodash.com)
		* JQuery	  (https://jquery.com/)

	@Improvement
	*	When a new task is added or an existing one is deleted or completed,
		save the tasks. This is instead of the user having to press 'Save Tasks',
		whenever they need to save. Pretty simple.
	*	When a new task is added or an existing one deleted, fade in/out the task perhaps.

	@Refactor
	*	We have some obsolete code or methods here as well as some naming which could be improved.
		This can be done over time when all or most features have been implemented.

	@TODO
	*	Within the task array should be a concrete class, 'Task' instead of an anonymous type
	*	Allow the user to download their tasks when exporting.
	* 	Where possible, change all for loops to forEach for clarity.

	@Bug
	*	Date for completed tasks always comes out as undefined.
	*	For some reason attempting to open the site in Edge causes a 'Hmmm...can’t reach this page' issue.
 	
 	@Obsolete
 	* getNumberOfTasks
 	* getTaskElementAtIndex
 	* getTaskElementAtTitle
 	* canAddTask
 */

const ACTIVE_TASKS_COOKIE_NAME 	  = "active-tasks";
const COMPLETED_TASKS_COOKIE_NAME = "completed-tasks";

const ACTIVE_TASKS_DIV_NAME    = "existing-tasks";
const COMPLETED_TASKS_DIV_NAME = "completed-tasks";

let currentlyActiveTasks 	= [];
let currentlyCompletedTasks = [];

function body_OnLoad(){
	if( Cookies.doesCookieExist(ACTIVE_TASKS_COOKIE_NAME) &&
		Cookies.doesCookieExist(COMPLETED_TASKS_COOKIE_NAME)){
			loadAndDisplayTasks();
			return;
	}

	createExampleTasks(20);
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

/**
 * Remove all tasks under the 'Current Tasks' column
 */
function btnClearTasks_OnClick(){
	removeAllTasks();
}

/**
 * Remove all tasks under the 'Completed Tasks' column
 */
function btnDeleteCompletedTasks_OnClick(){
	removeAllCompletedTasks();
}

/**
 * Stringify the active and completed tasks arrays and save them as a cookie
 * for the website. We should also add an option for the JSON to be downloaded
 * so that it wont get wiped after a cookie refresh.
 */
function btnExportTasks_OnClick(){
	Cookies.setCookie(ACTIVE_TASKS_COOKIE_NAME, JSON.stringify(currentlyActiveTasks));
	Cookies.setCookie(COMPLETED_TASKS_COOKIE_NAME, JSON.stringify(currentlyCompletedTasks));
}

function btnImportTasks_OnClick(){
	const tasks = prompt("Please paste your task JSON!", "");

	if(_.isEmpty(tasks)){
		alert("Import cancelled!");
		return;
	}

	const willReplaceExistingTasks = confirm("Would you like to delete existing tasks?");

	if(willReplaceExistingTasks)
		removeAllTasks();

	importTasks(tasks);
}

function btnDeleteSavedTasks_OnClick(){
	Cookies.deleteCookie(ACTIVE_TASKS_COOKIE_NAME);
	Cookies.deleteCookie(COMPLETED_TASKS_COOKIE_NAME);
}

function importTasks(json){
	const allTasks = JSON.parse(json);

	if(!_.isArray(allTasks)){
		alert("Your JSON is incorrect or malformed! \nAborting the import process!");
		return;
	}

	// We loop backwards here to preserve the order when exporting and
	// re-importing data.
	allTasks.reverse().forEach((element, index) => {
		if(doesTaskExist(element.taskTitle)){
			alert(`A task with the name '${element.taskTitle}' already exists, please choose another!`);
			return;
		}

		addActiveTask(
			element.taskTitle, 
			element.taskDescription, 
			element.taskDueDate
		);
	});
}

/**
 * Get the current date formatted locally. e.g. In the UK we use DD/MM/YYYY,
 * whereas in the US, they use MM/DD/YYYY and in some parts of asia they use,
 * YYYY/MM/DD I think. This should do it automatically.
 * @return {String} [Current date]
 */
function getCurrentDate(){
	return new Date().toLocaleDateString();
}

/**
 * Take a date and format it to whichever format is correct for the user 
 * locally. This should be used the Date picker when creating a task so that
 * the date formats are consistent across active and completed tasks. 
 * @param  {String} date [Date to reformat]
 * @return {String}      [Date in local format]
 */
function dateToLocalFormat(date){
	return new Date(date).toLocaleDateString();
}

/**
 * Load any saved tasks from cookies and instantiate them onto the site.
 */
function loadAndDisplayTasks(){
	loadTasks();
	displayTasks();
}

/**
 * Load any existing saved tasks from cookies and parse them into the 
 * arrays that we use to keep track of the tasks.
 */
function loadTasks(){
	currentlyActiveTasks = JSON.parse(Cookies.getCookie(ACTIVE_TASKS_COOKIE_NAME));
	currentlyCompletedTasks = JSON.parse(Cookies.getCookie(COMPLETED_TASKS_COOKIE_NAME));
}

/**
 * Remove any existing tasks (if there are any) and redraw all of them again.
 */
function redrawTasks(){
	Utilities.removeAllChildren(ACTIVE_TASKS_DIV_NAME);
	Utilities.removeAllChildren(COMPLETED_TASKS_DIV_NAME);

	displayTasks();
}

/**
 * Redraw all tasks giving no notice of if any already exist.
 */
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

function addActiveTask(taskTitle, taskDescription, taskDueDate){
	currentlyActiveTasks.push({
		taskTitle, 
		taskDescription, 
		taskDueDate
	});

	displayNewActiveTask(taskTitle, taskDescription, taskDueDate);
}

function displayNewActiveTask(title, description, dueDate){
	const htmlElement = $.parseHTML(
		`<div id="${title.toLowerCase()}">
			<h3 class="padded-text white-text">${title}</h3>
			<h4 class="padded-text white-text">Due Date: ${dueDate}</h4>
			<p class="padded-text white-text">${description}</p>
			
			<br />

			<button id="btnCompleteTask" class="btn btn-success btn-padding" type="button" onclick="completeTaskAtTitle('${title}')">Complete Task</button>
			<button id="btnDeleteTask" class="btn btn-danger btn-padding" type="button" onclick="removeTaskAtTitle('${title}')">Delete Task</button>

			<hr />
		</div>`);

	$(`#${ACTIVE_TASKS_DIV_NAME}`).prepend(htmlElement);
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
	const htmlElement = $.parseHTML(
		`<div id=${title.toLowerCase()}>
			<h3 class="padded-text white-text">${title}</h3>
			<h4 class="padded-text white-text">Due Date: ${completedDate}</h4>
			<p class="padded-text white-text">${description}</p>
			
			<br />

			<button id="btnDeleteTask" class="btn btn-danger btn-padding" type="button" onclick="removeCompletedTaskAtTitle('${title}')">Delete Task</button>

			<hr />
		</div>`);

	$(`#${COMPLETED_TASKS_DIV_NAME}`).prepend(htmlElement);
}

/**
 * Check if a task exists by fetching it by what its ID should be. Making
 * sure to use toLowerCase() on the check. This is so all IDs have the same
 * casing so a duplicate one cannot be made.
 * @param  {String} title [Name of the task]
 * @return {Boolean}      [Whether the task exists]
 */
function doesTaskExist(title){
	// @Optimisation
	// I do not need this temp variable here it is just for clarity
	const element = document.getElementById(title.toLowerCase());
	return element != null;
}

/**
 * A more explicit version of doesTaskExist with the sole function of
 * telling me if a task can be added with a specific name by checking
 * if it already exists.
 * @param  {String} title [Name of the task]
 * @return {Boolean}      [Whether the task can be added with this name]
 */
function canAddTask(title){
	return !doesTaskExist(title);
}

/**
 * Number of tasks that currently exist under the 'Current Tasks' column
 * @return {Number} [Number of tasks]
 */
function getNumberOfTasks(){
	return currentlyActiveTasks.length;
}

/**
 * Search through the currentlyActiveTasks array for an element matching
 * a specific title.
 * @param  {String} title [Name of the task]
 * @return {Object}       [Object - taskTitle, taskDescription and taskDueDate]
 */
function getCurrentlyActiveTaskByTitle(title){
	return _.find(currentlyActiveTasks, (element) => {
		return element.taskTitle == title;
	});
}

/**
 * Return the HTML element at the specific ID
 * 
 * @param  {String} title [ID of the task]
 * @return {DOM Element}  [HTML element at the specified ID]
 */
function getTaskElementAtTitle(title){
	if(!doesTaskExist(title))
		return null;

	return document.getElementById(title.toLowerCase());
}

/**
 * Return the HTML element at the specified index
 * 
 * @param  {Number} index [Index of the task]
 * @return {DOM Element}  [HTML element at the specified index]
 */
function getTaskElementAtIndex(index){
	// @Optimisation
	// Duplicated check, refactor so we do not check for this multiple times
	if(existingTasks.childElementCount <= index)
		return;

	return existingTasks.childNodes[index];
}

/**
 * Remove the task with the specified title from the 'Current Tasks' column
 * and add it to the 'Completed Tasks' column.
 */
function completeTaskAtTitle(title){
	const task = getCurrentlyActiveTaskByTitle(title);

	removeTaskAtTitle(title);
	addCompletedTask(task.taskTitle, task.taskDescription, getCurrentDate());
}

function removeTaskAtTitle(title){
	// @TODO
	// removeTaskAtTitle and removeCompletedTaskAtTitle could be made
	// generic enough where one of the parameters is the array of which to 
	// take the task from and the other being the title like normal.
	// For specificity reason I could create a concrete class called Task and
	// populate the array with those as opposed to these anonymous objects.
	
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
	Utilities.removeAllChildren(ACTIVE_TASKS_DIV_NAME);
}

function removeAllCompletedTasks(){
	Utilities.removeAllChildren(COMPLETED_TASKS_DIV_NAME);
}

/**
 * Create a number of example tasks containing Lorem Ipsum illustrate what
 * the site looks like.
 * @param  {Number} amount [Amount of elements to create]
 */
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
