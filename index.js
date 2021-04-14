const run = async (date) => {
    console.log(date);
}

run(new Date()).catch(err => {
    throw err
});