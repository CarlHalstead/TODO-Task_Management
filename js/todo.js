/*
	LIBRARIES/FRAMEWORKS USED:
		* Bootstrap 3 (https://getbootstrap.com/docs/3.3/)
		* Lodash 	(https://lodash.com)
		* JQuery	(https://jquery.com/)

	@Improvement
	*	When a new task is added or an existing one is deleted or completed,
		save the tasks. This is instead of the user having to press 'Save Tasks',
		whenever they need to save. Pretty simple.

	@Refactor
	*	We have some obsolete code or methods here as well as some naming which could be improved.
		This can be done over time when all or most features have been implemented.

	@TODO
	*	Allow the user to download their tasks when exporting.
	* 	Where possible, change all for loops to forEach for clarity.
	*	Move cookie methods (setCookie, getCookie) to a module which will be included.

	@Bug
	*	Date for completed tasks always comes out as undefined.
 */

const ACTIVE_TASKS_COOKIE_NAME 	  = "active-tasks";
const COMPLETED_TASKS_COOKIE_NAME = "completed-tasks";

let currentlyActiveTasks 	= [];
let currentlyCompletedTasks = [];

function body_OnLoad(){
	if(doesCookieExist(ACTIVE_TASKS_COOKIE_NAME)){
		if(doesCookieExist(COMPLETED_TASKS_COOKIE_NAME)){
			loadAndDisplayTasks();
			return;
		}
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
	setCookie(ACTIVE_TASKS_COOKIE_NAME, JSON.stringify(currentlyActiveTasks));
	setCookie(COMPLETED_TASKS_COOKIE_NAME, JSON.stringify(currentlyCompletedTasks));
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
	deleteCookie(ACTIVE_TASKS_COOKIE_NAME);
	deleteCookie(COMPLETED_TASKS_COOKIE_NAME);
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
	currentlyActiveTasks = JSON.parse(getCookie(ACTIVE_TASKS_COOKIE_NAME));
	currentlyCompletedTasks = JSON.parse(getCookie(COMPLETED_TASKS_COOKIE_NAME));
}

/**
 * Remove any existing tasks (if there are any) and redraw all of them again.
 */
function redrawTasks(){
	removeAllChildren(existingTasks);
	removeAllChildren(completedTasks);

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

	$("#existingTasks").prepend(htmlElement);
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

	$("#completedTasks").prepend(htmlElement);
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
	// @TODO
	// This should return the length of the array as opposed to
	// the number of HTML children.
	return existingTasks.childNodes.length;
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
 * @Obsolete
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
 * @Obsolete
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
	removeAllChildren(existingTasks);
}

function removeAllCompletedTasks(){
	removeAllChildren(completedTasks);
}

/**
 * Save a cookie with a specified key and value, making sure that it is
 * a site-wide cookie.
 */
function setCookie(key, value){
	document.cookie = `${key}=${value}; Path=/;`;
}

/**
 * Search for a cookies value given its key. Using some string methods,
 * split the cookie so we can extract its value and return it.
 * @param  {String} key [Name of the cookie]
 * @return {String}     [Value of the found cookie]
 */
function getCookie(key){
	if(_.isEmpty(document.cookie))
		return "";

	/*
		Cookies follow this pattern:

		cookieName=cookieValue; anotherCookieName=anotherCookieValue	
	 */

	const cookies = document.cookie.split(';');

	// @TODO
	// Test this forEach. With extremely limited testing it appears
	// to not load the cookies and with no errors in the console.
	/*
	cookies.forEach((element, index) => {
		const cookie = element.split('=');
		const cookieKey = _.trim(cookie[0]);
		const cookieValue = cookie[1];

		if(cookieKey == key)
			return cookieValue;
	});
	*/

	for(let i = 0; i < cookies.length; i++){
		const cookie = cookies[i].split('=');
		const cookieKey = _.trim(cookie[0]);
		const cookieValue = cookie[1];

		if(cookieKey == key)
			return cookieValue;
	}
}

/**
 * Set a cookies value to an empty value and set its expiry to as early as
 * possible paying attention to that it uses UNIX (EPOCH?) time so cannot be 
 * earlier than 1970.
 * @param  {String} key [Name of cookie to delete]
 */
function deleteCookie(key){
	document.cookie = `${key}=; Path=/; expires=Thur, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Check whether a cookie with a given key exists. It is classed as existing 
 * as long as it is not empty according to Lodash.
 * @param  {String} key [Name of the cookie]
 * @return {Boolean}    [Whether the cookie is not empty]
 */
function doesCookieExist(key){
	return !_.isEmpty(getCookie(key));
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
