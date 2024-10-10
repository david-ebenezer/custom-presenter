window.electron.onTextUpdate((text) => {
    document.getElementById('displayText').textContent = text;
  });
  