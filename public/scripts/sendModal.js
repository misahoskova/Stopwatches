function openSendModal(id) {
  document.getElementById('entryId').value = id
  document.getElementById('sendModal').classList.add('is-active')
}

function closeSendModal() {
  document.getElementById('sendModal').classList.remove('is-active')
}
