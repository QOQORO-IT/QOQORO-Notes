function reOrderDivs() {
  const pagebookElements = document.querySelectorAll('.pagebook');
  pagebookElements.forEach((element, index) => {
    element.id = `pagenumber${index + 1}`;
  });
}

document.getElementById('add-newPage').addEventListener('click', () => {
  const newPage = document.createElement('div');
  const oldPage = document.querySelector('.pagebook');
  const pagebookElements = document.querySelectorAll('.pagebook');
  const newId = `pagenumber${pagebookElements.length + 1}`;
  let Container = document.getElementById('MainContainer');

  newPage.setAttribute('contenteditable', '');
  newPage.id = newId;
  newPage.className = 'pagebook';
  newPage.style = oldPage.style
  newPage.innerHTML = `<div>New Page ${pagebookElements.length + 1}</div>`;
  // newPage.addEventListener('keyup', isCaretBeforeFirstChildDiv);
  // newPage.addEventListener('click', isCaretBeforeFirstChildDiv);

  Container.appendChild(newPage);
  reOrderDivs();
});