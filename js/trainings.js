/**
 * Trainings page – list and CRUD for training programs
 */

(function () {
  const form = document.getElementById('training-form');
  const formTitleEl = document.getElementById('training-form-title');
  const idInput = document.getElementById('training-id');
  const titleInput = document.getElementById('training-title');
  const titleError = document.getElementById('training-title-error');
  const listEl = document.getElementById('trainings-list');
  const tbody = document.getElementById('admin-trainings-tbody');
  const cancelBtn = document.getElementById('training-cancel');

  function renderPublicList() {
    const trainings = getTrainings();
    if (trainings.length === 0) {
      listEl.innerHTML = '<p class="empty-state">No training programs yet. Check back later or use "Manage Trainings" below to add some.</p>';
      return;
    }
    listEl.innerHTML = trainings.map(function (t) {
      return (
        '<div class="card">' +
          '<h3>' + escapeHtml(t.title) + '</h3>' +
          (t.duration || t.date ? '<div class="meta">' + [t.duration, t.date].filter(Boolean).join(' &middot; ') + '</div>' : '') +
          (t.description ? '<p>' + escapeHtml(t.description) + '</p>' : '') +
          (t.capacity ? '<p class="meta">Capacity: ' + escapeHtml(t.capacity) + '</p>' : '') +
          '<a href="booking.html" class="btn btn-primary btn-sm">Register</a>' +
        '</div>'
      );
    }).join('');
  }

  function escapeHtml(s) {
    if (!s) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderAdminTable() {
    const trainings = getTrainings();
    if (trainings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No trainings. Use the form above to add one.</td></tr>';
      return;
    }
    tbody.innerHTML = trainings.map(function (t) {
      return (
        '<tr>' +
          '<td>' + escapeHtml(t.title) + '</td>' +
          '<td>' + escapeHtml(t.duration || '–') + '</td>' +
          '<td>' + escapeHtml(t.date || '–') + '</td>' +
          '<td><div class="table-actions">' +
            '<button type="button" class="btn btn-secondary btn-sm btn-edit" data-id="' + escapeHtml(t.id) + '">Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm btn-delete" data-id="' + escapeHtml(t.id) + '" aria-label="Delete ' + escapeHtml(t.title) + '">Delete</button>' +
          '</div></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('.btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () { openEdit(btn.getAttribute('data-id')); });
    });
    tbody.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteTraining(btn.getAttribute('data-id')); });
    });
  }

  function openEdit(id) {
    const trainings = getTrainings();
    const t = trainings.find(function (x) { return x.id === id; });
    if (!t) return;
    formTitleEl.textContent = 'Edit Training';
    idInput.value = t.id;
    titleInput.value = t.title || '';
    document.getElementById('training-description').value = t.description || '';
    document.getElementById('training-duration').value = t.duration || '';
    document.getElementById('training-date').value = t.date || '';
    document.getElementById('training-capacity').value = t.capacity || '';
    titleError.textContent = '';
    titleInput.classList.remove('invalid');
    form.scrollIntoView({ behavior: 'smooth' });
  }

  function clearForm() {
    formTitleEl.textContent = 'Add Training';
    idInput.value = '';
    form.reset();
    idInput.value = '';
    titleError.textContent = '';
    titleInput.classList.remove('invalid');
  }

  function deleteTraining(id) {
    var title = '';
    getTrainings().forEach(function (t) { if (t.id === id) title = t.title; });
    if (!confirm('Delete training "' + title + '"? This cannot be undone.')) return;
    var list = getTrainings().filter(function (t) { return t.id !== id; });
    saveTrainings(list);
    renderPublicList();
    renderAdminTable();
    showToast('Training deleted.', 'success');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    titleError.textContent = '';
    titleInput.classList.remove('invalid');
    var title = titleInput.value.trim();
    if (!title) {
      titleError.textContent = 'Title is required.';
      titleInput.classList.add('invalid');
      titleInput.focus();
      return;
    }
    var trainings = getTrainings();
    var id = idInput.value.trim();
    var item = {
      id: id || generateId(),
      title: title,
      description: document.getElementById('training-description').value.trim(),
      duration: document.getElementById('training-duration').value.trim(),
      date: document.getElementById('training-date').value.trim(),
      capacity: document.getElementById('training-capacity').value.trim()
    };
    if (id) {
      var idx = trainings.findIndex(function (t) { return t.id === id; });
      if (idx !== -1) trainings[idx] = item;
      else trainings.push(item);
    } else {
      trainings.push(item);
    }
    saveTrainings(trainings);
    renderPublicList();
    renderAdminTable();
    clearForm();
    showToast(id ? 'Training updated.' : 'Training added.', 'success');
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', clearForm);
  }

  renderPublicList();
  renderAdminTable();
})();
