// importing required modules
const fs = require('fs');
const command = require('commander');

// reading data from database.json
const data = fs.readFileSync('database.json','utf8');
const ifFileIsEmpty = data.trim() === "" ? '[]' : data;
const parsedData = JSON.parse(ifFileIsEmpty);
const expenseData = [...parsedData]

// template for new expense entry
const dateTime = new Date().toISOString();
const template = {id:0, date:dateTime, description:'', amount:0};


function isValidISODate(dateStr) {
  // 1. Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  // 2. Parse components
  const [year, month, day] = dateStr.split('-').map(Number);

  // 3. Create Date (month is 0-based)
  const date = new Date(year, month - 1, day);

  // 4. Verify round-trip
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}


const program = new command.Command();
// configuration of the CLI
program
  .name('Expense Tracker')
  .description('A simple CLI for tracking expenses')
  .version('1.0.0')
  .helpOption('-h, --help', 'Read the README.md for usage instructions');
  


// Command to add a new expense
program.command('add')
.requiredOption('-d, --description <description>', 'Description of the expense')
.requiredOption('-a, --amount <amount>','Amount of the expense')
.option('--date <date>', 'Date of the expense')
.action((options) => {
    if (isNaN(options.amount)){
        console.log('Please provide a valid numeric amount');
        return;
    }
    if (options.date && isValidISODate(options.date) === false){
        console.log('Please provide a valid date in YYYY-MM-DD format');
        return;
    }
    const newExpense = {...template};
    newExpense.id = expenseData.length + 1;
    newExpense.description = options.description || 'No description';
    newExpense.amount = parseFloat(options.amount) || 0;
    newExpense.date = options.date || dateTime;

    expenseData.push(newExpense);
    fs.writeFileSync('database.json', JSON.stringify(expenseData, null, 2));
    console.log(`Expense added successfully (ID:${newExpense.id})`);
}
);
// Command to list all expenses
program.command('list')
.option('-m --month <month>', 'Filter by month (MM)')
.option('-y --year <year>', 'Filter by year (YYYY)')
.option('-i --id <id>', 'Filter by expense ID')
.action((options)=>{
    let filteredExpenses = [...expenseData];
    if (options.id){
        if (isNaN(options.id)){
            console.log('Please provide a valid numeric ID');
            return;
        }
        const expense = filteredExpenses.find(exp => exp.id === parseInt(options.id));
        const result  = expense ? expense : `No expense found with ID ${options.id}`;
        console.log(result);
    }
    if(options.month){
        filteredExpenses = filteredExpenses.filter(exp => {
            const expMonth = new Date(exp?.date).getMonth()+1 ;
            console.log(expMonth);
            return expMonth === parseInt(options.month);
        });
        if(filteredExpenses.length === 0){
            console.log(`No expenses found for month ${options.month}`);
            return;
        }
        console.log(filteredExpenses);
    }
    if(options.year){
        filteredExpenses = filteredExpenses.filter(exp => {
            const expYear = new Date(exp.date).getFullYear();
            return expYear === parseInt(options.year);
        });
        if(filteredExpenses.length === 0){
            console.log(`No expenses found for year ${options.year}`);
            return;
        }
    }
    console.log(`# ID   Date         Description           Amount\n`);
    return filteredExpenses.forEach(exp => {
        console.log(`# ${exp.id.toString().padEnd(4)} ${exp.date.split('T')[0]}   ${exp.description.padEnd(20)}  ${exp.amount}\n`);
    });

})
// Command to get summary of expenses
program.command('summary')
.option('-i --id <id>','Summary of expense by ID')
.option('-m --month <month>','Summary of expenses by month (MM)')
.option('-y --year <year>','Summary of expenses by year (YYYY)')
.action((options)=>{
    let filteredExpenses = [...expenseData];
    if (options.id){
        if (isNaN(options.id)){
            console.log('Please provide a valid numeric ID');
            return;
        }
        const expense = filteredExpenses.find(exp => exp.id === parseInt(options.id));
        const result  = expense ? `Total expenses: $${expense.amount}` : `No expense found with ID ${options.id}`;
        console.log(result);
    }
    if(options.month){
        filteredExpenses = filteredExpenses.filter(exp => {
            const expMonth = new Date(exp?.date).getMonth()+1 ;
            return expMonth === parseInt(options.month);
        });
        if(filteredExpenses.length === 0){
            console.log(`No expenses found for month ${options.month}`);
            return;
        }
        const total = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
        console.log(`Total expenses for ${new Date(options.month).toLocaleDateString('en',{month:'long'})}: $${total}`);
    }
    if(options.year){
        filteredExpenses = filteredExpenses.filter(exp => {
            const expYear = new Date(exp.date).getFullYear();
            return expYear === parseInt(options.year);
        });
        if(filteredExpenses.length === 0){
            console.log(`No expenses found for year ${options.year}`);
            return;
        }
        const total = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
        console.log(`Total expenses for year ${options.year}: $${total}`);
    }
})

// Command to delete an expense by ID
program.command('delete')
.requiredOption('-i --id <id>', 'ID of the expense to delete')
.action((options)=>{
    if (isNaN(options.id)){
        console.log('Please provide a valid numeric ID');
        return;
    }
    const expenseIndex = expenseData.findIndex(exp => exp.id === parseInt(options.id));
    if (expenseIndex === -1){
        console.log(`No expense found with ID ${options.id}`);
        return;
    }
    expenseData.splice(expenseIndex, 1);
    fs.writeFileSync('database.json', JSON.stringify(expenseData, null, 2));
    console.log(`Expense with ID ${options.id} deleted successfully`);
})

// show help if no arguments are provided
if (process.argv.length < 2){
    program.outputHelp();
    process.exit();
}

// parsing command line arguments
program.parse(process.argv);



