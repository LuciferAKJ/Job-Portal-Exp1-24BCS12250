const jobForm         = document.getElementById('jobForm');
const jobCardContainer = document.getElementById('jobCardContainer');
const submitBtn       = document.getElementById('submitBtn');
const cancelBtn       = document.getElementById('cancelBtn');
const emptyState      = document.getElementById('emptyState');
const jobCountEl      = document.getElementById('jobCount');
const filterLocationEl = document.getElementById('filterLocation');

let jobs = [];      
let editId = null;    

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icons = { success: '✅', danger: '🗑️', warning: '✏️' };
    toast.textContent = (icons[type] || '') + '  ' + message;
    toast.className = 'toast show ' + type;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}
jobForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const title   = document.getElementById('jobTitle').value.trim();
    const company = document.getElementById('companyName').value.trim();
    const loc     = document.getElementById('location').value.trim();
    const desc    = document.getElementById('description').value.trim();
    const salary  = document.getElementById('salary').value.trim();

    if (editId) {
        const job = jobs.find(j => j.id === editId);
        if (job) {
            job.title   = title;
            job.company = company;
            job.loc     = loc;
            job.desc    = desc;
            job.salary  = salary;
        }
        showToast('Job updated successfully!', 'warning');
        resetForm();
    } else {
        const job = { id: generateId(), title, company, loc, desc, salary };
        jobs.push(job);
        addLocationOption(loc);
        showToast('Job posted successfully!');
    }

    renderJobs();
    jobForm.reset();
    updateJobCount(document.querySelectorAll('.job-card:not([style*="display: none"])').length);
});

function renderJobs() {
    const existing = jobCardContainer.querySelectorAll('.job-card');
    existing.forEach(c => c.remove());

    if (jobs.length === 0) {
        emptyState.style.display = 'block';
        updateJobCount(0);
        return;
    }

    emptyState.style.display = 'none';
    jobs.forEach(job => jobCardContainer.appendChild(buildCard(job)));
    filterJobs();
}

function buildCard(job) {
    const card = document.createElement('div');
    card.className = 'card job-card';
    card.dataset.id  = job.id;
    card.dataset.loc = job.loc.toLowerCase();

    const salaryHTML = job.salary
        ? `<span class="salary-badge">💰 ${job.salary}</span>`
        : '';

    card.innerHTML = `
        <h4>${escapeHTML(job.title)}</h4>
        <p><strong>🏢 Company:</strong> <span class="company-text">${escapeHTML(job.company)}</span></p>
        <p><strong>📍 Location:</strong> <span class="location-text">${escapeHTML(job.loc)}</span></p>
        ${salaryHTML}
        <p class="desc-text">${escapeHTML(job.desc)}</p>
        <div class="card-actions">
            <button class="card btn-edit">✏️ Edit</button>
            <button class="card btn-delete">🗑️ Delete</button>
        </div>
    `;

    card.querySelector('.btn-delete').addEventListener('click', () => {
        if (confirm(`Delete "${job.title}"? This cannot be undone.`)) {
            jobs = jobs.filter(j => j.id !== job.id);
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
                card.remove();
                rebuildLocationFilter();
                filterJobs();
                if (jobs.length === 0) emptyState.style.display = 'block';
            }, 300);
            showToast('Job deleted.', 'danger');
        }
    });

    card.querySelector('.btn-edit').addEventListener('click', () => {
        document.getElementById('jobTitle').value   = job.title;
        document.getElementById('companyName').value = job.company;
        document.getElementById('location').value   = job.loc;
        document.getElementById('description').value = job.desc;
        document.getElementById('salary').value     = job.salary || '';

        editId = job.id;
        submitBtn.textContent = '💾 Save Changes';
        cancelBtn.style.display = 'inline-block';

        document.getElementById('postJobSection').scrollIntoView({ behavior: 'smooth' });
        showToast('Editing job — make your changes and save.', 'warning');
    });

    return card;
}
function filterJobs() {
    const query    = document.getElementById('jobSearch').value.toLowerCase().trim();
    const locFilter = document.getElementById('filterLocation').value.toLowerCase().trim();
    const salFilter = document.getElementById('filterSalary').value;

    const cards = jobCardContainer.querySelectorAll('.job-card');
    let visible = 0;

    cards.forEach(card => {
        const id      = card.dataset.id;
        const job     = jobs.find(j => j.id === id);
        if (!job) return;

        const matchQuery = !query ||
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.loc.toLowerCase().includes(query) ||
            job.desc.toLowerCase().includes(query);

        const matchLoc = !locFilter || job.loc.toLowerCase().includes(locFilter);

        const matchSalary = matchesSalaryFilter(job.salary, salFilter);

        const show = matchQuery && matchLoc && matchSalary;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
    });

    let noRes = document.getElementById('noResults');
    if (visible === 0 && jobs.length > 0) {
        if (!noRes) {
            noRes = document.createElement('div');
            noRes.id = 'noResults';
            noRes.className = 'no-results';
            noRes.innerHTML = '🔍 No jobs match your search. Try different keywords.';
            jobCardContainer.appendChild(noRes);
        }
    } else {
        if (noRes) noRes.remove();
    }

    updateJobCount(visible);
}

function matchesSalaryFilter(salaryStr, filter) {
    if (!filter) return true;
    if (!salaryStr) return false;

    const nums = salaryStr.match(/\d+(\.\d+)?/g);
    if (!nums) return false;
    const val = parseFloat(nums[0]);

    if (filter === 'low')  return val < 5;
    if (filter === 'mid')  return val >= 5 && val <= 12;
    if (filter === 'high') return val > 12;
    return true;
}

function heroSearch() {
    const q   = document.getElementById('heroSearch').value.trim();
    const loc = document.getElementById('heroLocation').value.trim();

    if (q) document.getElementById('jobSearch').value = q;
    if (loc) {
        const opts = filterLocationEl.options;
        for (let o of opts) {
            if (o.value.toLowerCase().includes(loc.toLowerCase())) {
                filterLocationEl.value = o.value;
                break;
            }
        }
    }

    filterJobs();
    document.getElementById('dynamicJobsSection').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    resetForm();
    showToast('Edit cancelled.');
}

function resetForm() {
    jobForm.reset();
    editId = null;
    submitBtn.textContent = '🚀 Post Job';
    cancelBtn.style.display = 'none';
}

function updateJobCount(count) {
    jobCountEl.textContent = `${count} job${count !== 1 ? 's' : ''} found`;
}

function addLocationOption(loc) {
    const trimmed = loc.trim();
    const existing = Array.from(filterLocationEl.options).map(o => o.value.toLowerCase());
    if (trimmed && !existing.includes(trimmed.toLowerCase())) {
        const opt = document.createElement('option');
        opt.value = trimmed;
        opt.textContent = trimmed;
        filterLocationEl.appendChild(opt);
    }
}

function rebuildLocationFilter() {
    filterLocationEl.innerHTML = '<option value="">All Locations</option>';
    const seen = new Set();
    jobs.forEach(job => {
        const loc = job.loc.trim();
        if (loc && !seen.has(loc.toLowerCase())) {
            seen.add(loc.toLowerCase());
            const opt = document.createElement('option');
            opt.value = loc;
            opt.textContent = loc;
            filterLocationEl.appendChild(opt);
        }
    });
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

updateJobCount(0);