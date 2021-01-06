function log(message: string) {
    console.log(message);
}
 
function divide(n1: number, n2: number) {
    let result = n1 / n2;
    log(result.toString());
    return result;
}
 
log("do it");
divide(2,3);

