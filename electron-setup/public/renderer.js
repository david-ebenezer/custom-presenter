document.getElementById('textInput').addEventListener('input', (event) => {
    window.electron.sendText(event.target.value);
  });
  