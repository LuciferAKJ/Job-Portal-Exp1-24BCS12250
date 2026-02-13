const jobForm = document.getElementById('jobForm');
const jobCardContainer = document.getElementById('jobCardContainer');
let editMode = false;
let currentEditCard = null;

jobForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get input values
    const title = document.getElementById('jobTitle').value;
    const company = document.getElementById('companyName').value;
    const loc = document.getElementById('location').value;
    const desc = document.getElementById('description').value;

    if (editMode) {
        // Update existing card
        currentEditCard.querySelector('h4').innerText = title;
        currentEditCard.querySelector('.company-text').innerText = company;
        currentEditCard.querySelector('.location-text').innerText = loc;
        currentEditCard.querySelector('.desc-text').innerText = desc;
        
        // Reset form
        editMode = false;
        document.getElementById('submitBtn').innerText = "Post Job";
        currentEditCard = null;
    } else {
        // Create new Job Card
        createJobCard(title, company, loc, desc);
    }

    jobForm.reset();
});

function createJobCard(title, company, loc, desc) {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <h4>${title}</h4>
        <p><strong>Company:</strong> <span class="company-text">${company}</span></p>
        <p><strong>Location:</strong> <span class="location-text">${loc}</span></p>
        <p class="desc-text">${desc}</p>
        <div class="card-actions">
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
        </div>
    `;

    // Delete Functionality
    card.querySelector('.btn-delete').addEventListener('click', () => {
        card.remove();
    });

    // Edit Functionality
    card.querySelector('.btn-edit').addEventListener('click', () => {
        document.getElementById('jobTitle').value = title;
        document.getElementById('companyName').value = company;
        document.getElementById('location').value = loc;
        document.getElementById('description').value = desc;
        
        editMode = true;
        currentEditCard = card;
        document.getElementById('submitBtn').innerText = "Save Changes";
        window.scrollTo(0, 0); // Scroll back to form
    });

    jobCardContainer.appendChild(card);
}