const console = require("node:console");

function Click() {
   const response = window.electronAPI.syncPing();
   console.log(response + 'Nipun');
}

function clickMe(){
   console.log('clala[s')
}

window.Click = Click;
window.clickMe = clickMe;