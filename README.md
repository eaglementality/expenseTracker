### To use this CLI, use the following commands:

1. To add a new expense:
    node index.js add -d "Description" -a Amount [--date "MM/DD/YYYY, HH:MM AM/PM"]
2. To view all expenses:
    node index.js list
3. To view total expenses:
    node index.js summary
4. To view summary by month:
    node index.js summary --month MM --year YYYY
5. To delete an expense by ID:
    node index.js delete --id ExpenseID
6. To update an expense by ID:
    node index.js update --id ExpenseID [--description "New Description"] [--amount NewAmount] [--date "MM/DD/YYYY, HH:MM AM/PM"]
7. To list expenses by month:
    node index.js list --month MM --year YYYY

### Project URL 
https://roadmap.sh/projects/expense-tracker
