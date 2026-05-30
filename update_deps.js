const fs = require('fs');
const files = [
    { name: 'BudgetForm.tsx', editVar: 'budgetToEdit', idField: 'id_budget' },
    { name: 'RecurringForm.tsx', editVar: 'recurringToEdit', idField: 'id_recurring' },
    { name: 'TabunganForm.tsx', editVar: 'dataToEdit', idField: 'id_tabungan' },
    { name: 'TitipanForm.tsx', editVar: 'titipanToEdit', idField: 'id_titipan' },
    { name: 'TransaksiForm.tsx', editVar: 'transaksiToEdit', idField: 'id_transaksi' },
    { name: 'TransferForm.tsx', editVar: 'transferToEdit', idField: 'id_transfer' }
];

files.forEach(f => {
    let path = 'src/modules/dashboard/forms/' + f.name;
    let content = fs.readFileSync(path, 'utf8');

    let regex = new RegExp('}, \\\\[([^\\\\]]*' + f.editVar + '[^\\\\]]*reset[^\\\\]]*)\\\\]\\\\);', 'g');
    content = content.replace(regex, (match, p1) => {
        let newDeps = p1.replace(f.editVar, f.editVar + '?.' + f.idField);
        return '// eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [' + newDeps + ']);';
    });
    
    fs.writeFileSync(path, content);
    console.log('Updated ' + f.name);
});
