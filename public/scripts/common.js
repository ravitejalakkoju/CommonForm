

// signup structure
if(document.getElementById('list-home-list')!== null){
  document.getElementById('list-home-list').addEventListener('click', el => {
    document.getElementById('logo_c').classList.remove('d-inline-block');
    document.getElementById('logo_c').classList.add('d-none');
});
}

document.getElementById('projectSelect').addEventListener('click', el => {
  const name = document.getElementById('projectSelect').value;
  console.log(name);
  document.getElementById(`project${name}`).classList.toggle("d-block");
});

$(function () {
  $('[data-toggle="popover"]').popover()
});