class Task{

	constructor(title, description, date){
		this.title = title;
		this.description = description;
		this.date = date;
	}

	get title(){
		return this.title;
	}

	get description(){
		return this.description;
	}

	get date(){
		return this.date;
	}
}