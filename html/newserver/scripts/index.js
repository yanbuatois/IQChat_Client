window.addEventListener('load', () => {
  const createButton = document.getElementById('create-button');
  const joinButton = document.getElementById('join-button');

  createButton.addEventListener('click', event => {
    event.preventDefault();
    window.location.href = "create.html";
  });

  joinButton.addEventListener('click', event => {
    event.preventDefault();
    window.location.href = "invited.html";
  });
});