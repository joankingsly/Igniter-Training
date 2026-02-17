/**
 * Booking page – registration form and registrations CRUD
 */

(function () {
  const regForm = document.getElementById('registration-form');
  const trainingSelect = document.getElementById('reg-training');
  const editForm = document.getElementById('registration-edit-form');
  const editSection = document.getElementById('registration-edit-section');
  const editCancelBtn = document.getElementById('registration-edit-cancel');
  const tbody = document.getElementById('admin-registrations-tbody');

  var trainingsCache = [];

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function getTrainingTitle(id) {
    var t = trainingsCache.find(function (x) { return x.id === id; });
    return t ? t.title : id || '–';
  }

  function fillTrainingSelects() {
    trainingsCache = getTrainings();
    var options = '<option value="">Select a training</option>' +
      trainingsCache.map(function (t) {
        return '<option value="' + escapeHtml(t.id) + '">' + escapeHtml(t.title) + '</option>';
      }).join('');
    trainingSelect.innerHTML = options;
    var editSelect = document.getElementById('edit-reg-training');
    if (editSelect) editSelect.innerHTML = options;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
  }

  function clearRegErrors() {
    ['reg-name', 'reg-email', 'reg-training'].forEach(function (id) {
      var el = document.getElementById(id);
      var err = document.getElementById(id + '-error');
      if (el) el.classList.remove('invalid');
      if (err) err.textContent = '';
    });
  }

  regForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearRegErrors();
    var name = document.getElementById('reg-name').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var trainingId = document.getElementById('reg-training').value.trim();
    var valid = true;
    if (!name) {
      document.getElementById('reg-name-error').textContent = 'Name is required.';
      document.getElementById('reg-name').classList.add('invalid');
      valid = false;
    }
    if (!email) {
      document.getElementById('reg-email-error').textContent = 'Email is required.';
      document.getElementById('reg-email').classList.add('invalid');
      valid = false;
    } else if (!validateEmail(email)) {
      document.getElementById('reg-email-error').textContent = 'Please enter a valid email address.';
      document.getElementById('reg-email').classList.add('invalid');
      valid = false;
    }
    if (!trainingId) {
      document.getElementById('reg-training-error').textContent = 'Please select a training.';
      document.getElementById('reg-training').classList.add('invalid');
      valid = false;
    }
    if (!valid) return;

    var list = getRegistrations();
    list.push({
      id: generateId(),
      name: name,
      email: email,
      phone: document.getElementById('reg-phone').value.trim(),
      trainingId: trainingId,
      datePreference: document.getElementById('reg-date-pref').value.trim(),
      notes: document.getElementById('reg-notes').value.trim(),
      createdAt: new Date().toISOString()
    });
    saveRegistrations(list);
    regForm.reset();
    fillTrainingSelects();
    renderAdminTable();
    showToast('Registration submitted successfully.', 'success');
  });

  function renderAdminTable() {
    var regs = getRegistrations();
    if (regs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No registrations yet.</td></tr>';
      return;
    }
    tbody.innerHTML = regs.map(function (r) {
      return (
        '<tr>' +
          '<td>' + escapeHtml(r.name) + '</td>' +
          '<td>' + escapeHtml(r.email) + '</td>' +
          '<td>' + escapeHtml(getTrainingTitle(r.trainingId)) + '</td>' +
          '<td>' + escapeHtml(r.datePreference || '–') + '</td>' +
          '<td><div class="table-actions">' +
            '<button type="button" class="btn btn-secondary btn-sm btn-edit-reg" data-id="' + escapeHtml(r.id) + '">Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm btn-delete-reg" data-id="' + escapeHtml(r.id) + '" aria-label="Delete registration for ' + escapeHtml(r.name) + '">Delete</button>' +
          '</div></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('.btn-edit-reg').forEach(function (btn) {
      btn.addEventListener('click', function () { openEditReg(btn.getAttribute('data-id')); });
    });
    tbody.querySelectorAll('.btn-delete-reg').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteReg(btn.getAttribute('data-id')); });
    });
  }

  function openEditReg(id) {
    var regs = getRegistrations();
    var r = regs.find(function (x) { return x.id === id; });
    if (!r) return;
    editSection.style.display = 'block';
    editSection.setAttribute('aria-hidden', 'false');
    document.getElementById('registration-edit-title').textContent = 'Edit Registration';
    document.getElementById('edit-reg-id').value = r.id;
    document.getElementById('edit-reg-name').value = r.name || '';
    document.getElementById('edit-reg-email').value = r.email || '';
    document.getElementById('edit-reg-phone').value = r.phone || '';
    document.getElementById('edit-reg-training').value = r.trainingId || '';
    document.getElementById('edit-reg-date-pref').value = r.datePreference || '';
    document.getElementById('edit-reg-notes').value = r.notes || '';
    document.getElementById('edit-reg-name-error').textContent = '';
    document.getElementById('edit-reg-email-error').textContent = '';
    editSection.scrollIntoView({ behavior: 'smooth' });
  }

  function closeEditReg() {
    editSection.style.display = 'none';
    editSection.setAttribute('aria-hidden', 'true');
    editForm.reset();
    document.getElementById('edit-reg-id').value = '';
  }

  function deleteReg(id) {
    var regs = getRegistrations();
    var r = regs.find(function (x) { return x.id === id; });
    if (!r) return;
    if (!confirm('Delete registration for "' + r.name + '"? This cannot be undone.')) return;
    saveRegistrations(regs.filter(function (x) { return x.id !== id; }));
    renderAdminTable();
    closeEditReg();
    showToast('Registration deleted.', 'success');
  }

  editForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = document.getElementById('edit-reg-id').value.trim();
    var name = document.getElementById('edit-reg-name').value.trim();
    var email = document.getElementById('edit-reg-email').value.trim();
    var nameErr = document.getElementById('edit-reg-name-error');
    var emailErr = document.getElementById('edit-reg-email-error');
    nameErr.textContent = '';
    emailErr.textContent = '';
    document.getElementById('edit-reg-name').classList.remove('invalid');
    document.getElementById('edit-reg-email').classList.remove('invalid');
    var valid = true;
    if (!name) {
      nameErr.textContent = 'Name is required.';
      document.getElementById('edit-reg-name').classList.add('invalid');
      valid = false;
    }
    if (!email) {
      emailErr.textContent = 'Email is required.';
      document.getElementById('edit-reg-email').classList.add('invalid');
      valid = false;
    } else if (!validateEmail(email)) {
      emailErr.textContent = 'Please enter a valid email address.';
      document.getElementById('edit-reg-email').classList.add('invalid');
      valid = false;
    }
    if (!valid) return;

    var list = getRegistrations();
    var idx = list.findIndex(function (x) { return x.id === id; });
    if (idx === -1) return;
    list[idx] = {
      id: id,
      name: name,
      email: email,
      phone: document.getElementById('edit-reg-phone').value.trim(),
      trainingId: document.getElementById('edit-reg-training').value.trim(),
      datePreference: document.getElementById('edit-reg-date-pref').value.trim(),
      notes: document.getElementById('edit-reg-notes').value.trim(),
      createdAt: list[idx].createdAt || new Date().toISOString()
    };
    saveRegistrations(list);
    renderAdminTable();
    closeEditReg();
    showToast('Registration updated.', 'success');
  });

  if (editCancelBtn) {
    editCancelBtn.addEventListener('click', closeEditReg);
  }

  fillTrainingSelects();
  renderAdminTable();
})();
