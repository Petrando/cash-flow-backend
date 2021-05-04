exports.getCurrentMonthName = () => {
	const today = new Date();
    const currentMonthName = today.toLocaleString('default', { month: 'long' });

    return currentMonthName;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

exports.getLastDayOfMonth = (monthName) => {	
	const monthIdx = months.indexOf(monthName);	

	const currentYear = new Date().getFullYear();

	const lastDate =  new Date(currentYear, monthIdx + 1, 0).getDate();	
	
	return new Date(`${currentYear}-${monthIdx + 1}-${lastDate}`);
}


exports.getFirstDayOfMonth = (monthName) => {	
	const monthIdx = months.indexOf(monthName);
	const currentYear = new Date().getFullYear();	
		
	return new Date(`${currentYear}-${monthIdx + 1}-1`);
}