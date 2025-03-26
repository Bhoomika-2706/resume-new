document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const usernameDisplay = document.getElementById('username-display');
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resumeForm = document.getElementById('resume-form');
    const addWorkBtn = document.getElementById('add-work-btn');
    const addEducationBtn = document.getElementById('add-education-btn');
    const addSkillBtn = document.getElementById('add-skill-btn');
    const newSkillInput = document.getElementById('new-skill');
    const workExperienceContainer = document.getElementById('work-experience-container');
    const educationContainer = document.getElementById('education-container');
    const skillsContainer = document.getElementById('skills-container');
    const templateGallery = document.getElementById('template-gallery');
    const resumePreview = document.getElementById('resume-preview');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const downloadDocxBtn = document.getElementById('download-docx');

    // Current user and resume data
    let currentUser = null;
    let resumeData = {
        personalInfo: {},
        workExperience: [],
        education: [],
        skills: [],
        selectedTemplate: 'template1'
    };

    // Templates data
    const templates = [
        { id: 'template1', name: 'Professional', thumbnail: 'https://via.placeholder.com/150x200?text=Professional' },
        { id: 'template2', name: 'Modern', thumbnail: 'https://via.placeholder.com/150x200?text=Modern' },
        { id: 'template3', name: 'Creative', thumbnail: 'https://via.placeholder.com/150x200?text=Creative' }
    ];

    // Initialize the app
    function init() {
        loadTemplates();
        checkAuthStatus();
        setupEventListeners();
    }

    // Check if user is logged in
    function checkAuthStatus() {
        // In a real app, this would check localStorage or make an API call
        const token = localStorage.getItem('resumeBuilderToken');
        if (token) {
            // Simulate getting user data
            currentUser = {
                name: "John Doe",
                email: "john@example.com"
            };
            toggleAuthUI(true);
            loadUserResume();
        } else {
            toggleAuthUI(false);
        }
    }

    // Toggle between auth buttons and user menu
    function toggleAuthUI(isLoggedIn) {
        if (isLoggedIn) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'block';
            usernameDisplay.textContent = currentUser.name;
        } else {
            authButtons.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    // Load templates into the gallery
    function loadTemplates() {
        templateGallery.innerHTML = '';
        templates.forEach(template => {
            const templateElement = document.createElement('div');
            templateElement.className = 'col-12 template-thumbnail';
            if (resumeData.selectedTemplate === template.id) {
                templateElement.classList.add('selected');
            }
            templateElement.innerHTML = `
                <img src="${template.thumbnail}" alt="${template.name}" class="img-fluid">
                <p class="text-center mt-2">${template.name}</p>
            `;
            templateElement.addEventListener('click', () => selectTemplate(template.id));
            templateGallery.appendChild(templateElement);
        });
    }

    // Select a template
    function selectTemplate(templateId) {
        resumeData.selectedTemplate = templateId;
        document.querySelectorAll('.template-thumbnail').forEach(el => {
            el.classList.remove('selected');
            if (el.querySelector('img').alt === templates.find(t => t.id === templateId).name) {
                el.classList.add('selected');
            }
        });
        renderResumePreview();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Auth buttons
        loginBtn.addEventListener('click', () => loginModal.show());
        registerBtn.addEventListener('click', () => registerModal.show());
        logoutBtn.addEventListener('click', logout);

        // Forms
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        resumeForm.addEventListener('submit', handleResumeSubmit);

        // Resume form buttons
        addWorkBtn.addEventListener('click', addWorkExperience);
        addEducationBtn.addEventListener('click', addEducation);
        addSkillBtn.addEventListener('click', addSkill);
        newSkillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
            }
        });

        // Download buttons
        downloadPdfBtn.addEventListener('click', downloadAsPdf);
        downloadDocxBtn.addEventListener('click', downloadAsDocx);

        // Form input changes
        resumeForm.addEventListener('input', () => {
            updateResumeDataFromForm();
            renderResumePreview();
        });
    }

    // Handle login
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Simulate API call
        setTimeout(() => {
            // In a real app, you would validate credentials with the server
            currentUser = {
                name: "John Doe", // This would come from the server
                email: email
            };
            localStorage.setItem('resumeBuilderToken', 'simulated-token');
            toggleAuthUI(true);
            loginModal.hide();
            loadUserResume();
        }, 500);
    }

    // Handle registration
    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        // Simulate API call
        setTimeout(() => {
            currentUser = {
                name: name,
                email: email
            };
            localStorage.setItem('resumeBuilderToken', 'simulated-token');
            toggleAuthUI(true);
            registerModal.hide();
            // Initialize empty resume for new user
            resetResumeData();
        }, 500);
    }

    // Logout
    function logout() {
        localStorage.removeItem('resumeBuilderToken');
        currentUser = null;
        toggleAuthUI(false);
        resetResumeData();
    }

    // Load user's resume data
    function loadUserResume() {
        // In a real app, this would fetch from the server
        const savedResume = localStorage.getItem(`resume_${currentUser.email}`);
        if (savedResume) {
            resumeData = JSON.parse(savedResume);
            populateFormFromResumeData();
        } else {
            resetResumeData();
        }
    }

    // Save resume data
    function saveResumeData() {
        if (currentUser) {
            // In a real app, this would save to the server
            localStorage.setItem(`resume_${currentUser.email}`, JSON.stringify(resumeData));
        }
    }

    // Reset resume data
    function resetResumeData() {
        resumeData = {
            personalInfo: {},
            workExperience: [],
            education: [],
            skills: [],
            selectedTemplate: 'template1'
        };
        populateFormFromResumeData();
    }

    // Populate form from resume data
    function populateFormFromResumeData() {
        // Personal info
        document.getElementById('firstName').value = resumeData.personalInfo.firstName || '';
        document.getElementById('lastName').value = resumeData.personalInfo.lastName || '';
        document.getElementById('email').value = resumeData.personalInfo.email || '';
        document.getElementById('phone').value = resumeData.personalInfo.phone || '';
        document.getElementById('address').value = resumeData.personalInfo.address || '';

        // Work experience
        workExperienceContainer.innerHTML = '';
        resumeData.workExperience.forEach((work, index) => {
            addWorkExperience(work, index);
        });

        // Education
        educationContainer.innerHTML = '';
        resumeData.education.forEach((edu, index) => {
            addEducation(edu, index);
        });

        // Skills
        skillsContainer.innerHTML = '';
        resumeData.skills.forEach((skill, index) => {
            addSkill(skill, index);
        });

        // Template
        selectTemplate(resumeData.selectedTemplate);

        renderResumePreview();
    }

    // Update resume data from form
    function updateResumeDataFromForm() {
        // Personal info
        resumeData.personalInfo = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        // Skills are updated in real-time as they're added/removed
        // Work experience and education are updated when the form is submitted
    }

    // Handle resume form submission
    function handleResumeSubmit(e) {
        e.preventDefault();
        updateResumeDataFromForm();
        saveResumeData();
        alert('Resume saved successfully!');
    }

    // Add work experience
    function addWorkExperience(workData = {}, index = null) {
        const workId = index !== null ? index : resumeData.workExperience.length;
        const workEntry = document.createElement('div');
        workEntry.className = 'work-entry';
        workEntry.innerHTML = `
            <span class="remove-entry" data-id="${workId}">&times;</span>
            <div class="mb-2">
                <label for="work-title-${workId}" class="form-label">Job Title</label>
                <input type="text" class="form-control" id="work-title-${workId}" value="${workData.title || ''}" required>
            </div>
            <div class="mb-2">
                <label for="work-company-${workId}" class="form-label">Company</label>
                <input type="text" class="form-control" id="work-company-${workId}" value="${workData.company || ''}" required>
            </div>
            <div class="row g-2">
                <div class="col-md-6">
                    <label for="work-start-${workId}" class="form-label">Start Date</label>
                    <input type="month" class="form-control" id="work-start-${workId}" value="${workData.startDate || ''}">
                </div>
                <div class="col-md-6">
                    <label for="work-end-${workId}" class="form-label">End Date</label>
                    <input type="month" class="form-control" id="work-end-${workId}" value="${workData.endDate || ''}">
                </div>
            </div>
            <div class="mt-2">
                <label for="work-description-${workId}" class="form-label">Description</label>
                <textarea class="form-control" id="work-description-${workId}" rows="2">${workData.description || ''}</textarea>
            </div>
        `;
        
        // Add remove event listener
        workEntry.querySelector('.remove-entry').addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            resumeData.workExperience.splice(id, 1);
            populateFormFromResumeData();
        });
        
        workExperienceContainer.appendChild(workEntry);
        
        // If this is a new entry, add to resumeData
        if (index === null) {
            resumeData.workExperience.push({
                title: '',
                company: '',
                startDate: '',
                endDate: '',
                description: ''
            });
        }
    }

    // Add education
    function addEducation(eduData = {}, index = null) {
        const eduId = index !== null ? index : resumeData.education.length;
        const eduEntry = document.createElement('div');
        eduEntry.className = 'education-entry';
        eduEntry.innerHTML = `
            <span class="remove-entry" data-id="${eduId}">&times;</span>
            <div class="mb-2">
                <label for="edu-degree-${eduId}" class="form-label">Degree</label>
                <input type="text" class="form-control" id="edu-degree-${eduId}" value="${eduData.degree || ''}" required>
            </div>
            <div class="mb-2">
                <label for="edu-school-${eduId}" class="form-label">School</label>
                <input type="text" class="form-control" id="edu-school-${eduId}" value="${eduData.school || ''}" required>
            </div>
            <div class="row g-2">
                <div class="col-md-6">
                    <label for="edu-start-${eduId}" class="form-label">Start Date</label>
                    <input type="month" class="form-control" id="edu-start-${eduId}" value="${eduData.startDate || ''}">
                </div>
                <div class="col-md-6">
                    <label for="edu-end-${eduId}" class="form-label">End Date</label>
                    <input type="month" class="form-control" id="edu-end-${eduId}" value="${eduData.endDate || ''}">
                </div>
            </div>
            <div class="mt-2">
                <label for="edu-description-${eduId}" class="form-label">Description</label>
                <textarea class="form-control" id="edu-description-${eduId}" rows="2">${eduData.description || ''}</textarea>
            </div>
        `;
        
        // Add remove event listener
        eduEntry.querySelector('.remove-entry').addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            resumeData.education.splice(id, 1);
            populateFormFromResumeData();
        });
        
        educationContainer.appendChild(eduEntry);
        
        // If this is a new entry, add to resumeData
        if (index === null) {
            resumeData.education.push({
                degree: '',
                school: '',
                startDate: '',
                endDate: '',
                description: ''
            });
        }
    }

    // Add skill
    function addSkill(skill = '', index = null) {
        if (!skill && newSkillInput.value.trim() === '') return;
        
        const skillText = skill || newSkillInput.value.trim();
        const skillId = index !== null ? index : resumeData.skills.length;
        
        const skillBadge = document.createElement('span');
        skillBadge.className = 'badge bg-primary skill-badge';
        skillBadge.innerHTML = `
            ${skillText}
            <span class="remove-skill" data-id="${skillId}">&times;</span>
        `;
        
        // Add remove event listener
        skillBadge.querySelector('.remove-skill').addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            resumeData.skills.splice(id, 1);
            populateFormFromResumeData();
        });
        
        skillsContainer.appendChild(skillBadge);
        
        // If this is a new skill, add to resumeData and clear input
        if (index === null) {
            resumeData.skills.push(skillText);
            newSkillInput.value = '';
        }
    }

    // Render resume preview
    function renderResumePreview() {
        if (!resumeData.personalInfo.firstName && !resumeData.personalInfo.lastName) {
            resumePreview.innerHTML = `
                <div class="text-center text-muted py-5">
                    <h4>Your resume will appear here</h4>
                    <p>Fill out the form to see a preview</p>
                </div>
            `;
            return;
        }

        let previewHTML = '';
        
        // Based on selected template
        switch (resumeData.selectedTemplate) {
            case 'template1':
                previewHTML = generateTemplate1();
                break;
            case 'template2':
                previewHTML = generateTemplate2();
                break;
            case 'template3':
                previewHTML = generateTemplate3();
                break;
            default:
                previewHTML = generateTemplate1();
        }
        
        resumePreview.innerHTML = previewHTML;
    }

    // Template 1: Professional
    function generateTemplate1() {
        return `
            <div class="resume-template">
                <div class="resume-header">
                    <div class="resume-name">${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}</div>
                    <div class="resume-contact">
                        ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.address}
                    </div>
                </div>
                
                ${resumeData.workExperience.length > 0 ? `
                <div class="resume-section">
                    <div class="section-title">WORK EXPERIENCE</div>
                    ${resumeData.workExperience.map(work => `
                        <div class="work-item">
                            <div class="work-title">${work.title}</div>
                            <div class="work-company">${work.company}</div>
                            <div class="work-duration">${work.startDate} - ${work.endDate || 'Present'}</div>
                            <div class="work-description">${work.description}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${resumeData.education.length > 0 ? `
                <div class="resume-section">
                    <div class="section-title">EDUCATION</div>
                    ${resumeData.education.map(edu => `
                        <div class="education-item">
                            <div class="education-degree">${edu.degree}</div>
                            <div class="education-school">${edu.school}</div>
                            <div class="education-duration">${edu.startDate} - ${edu.endDate || 'Present'}</div>
                            <div class="education-description">${edu.description}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${resumeData.skills.length > 0 ? `
                <div class="resume-section">
                    <div class="section-title">SKILLS</div>
                    <div class="skills-list">
                        ${resumeData.skills.map(skill => `
                            <div class="skill-item">${skill}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Template 2: Modern (similar structure with different styling)
    function generateTemplate2() {
        return `
            <div class="resume-template" style="font-family: 'Helvetica Neue', sans-serif;">
                <div class="resume-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <div>
                        <div style="font-size: 32px; font-weight: bold; color: #2c3e50;">${resumeData.personalInfo.firstName} <span style="color: #3498db;">${resumeData.personalInfo.lastName}</span></div>
                        <div style="font-size: 16px; color: #7f8c8d;">${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; color: #34495e;">${resumeData.personalInfo.address}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 30px;">
                    <div style="flex: 2;">
                        ${resumeData.workExperience.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <div style="font-size: 20px; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 15px;">EXPERIENCE</div>
                            ${resumeData.workExperience.map(work => `
                                <div style="margin-bottom: 20px;">
                                    <div style="font-weight: bold; font-size: 18px; color: #2c3e50;">${work.title}</div>
                                    <div style="font-style: italic; color: #3498db;">${work.company}</div>
                                    <div style="font-size: 14px; color: #7f8c8d; margin: 5px 0;">${work.startDate} - ${work.endDate || 'Present'}</div>
                                    <div style="font-size: 15px; line-height: 1.5;">${work.description}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        
                        ${resumeData.education.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <div style="font-size: 20px; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 15px;">EDUCATION</div>
                            ${resumeData.education.map(edu => `
                                <div style="margin-bottom: 20px;">
                                    <div style="font-weight: bold; font-size: 18px; color: #2c3e50;">${edu.degree}</div>
                                    <div style="font-style: italic; color: #3498db;">${edu.school}</div>
                                    <div style="font-size: 14px; color: #7f8c8d; margin: 5px 0;">${edu.startDate} - ${edu.endDate || 'Present'}</div>
                                    <div style="font-size: 15px; line-height: 1.5;">${edu.description}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${resumeData.skills.length > 0 ? `
                    <div style="flex: 1;">
                        <div style="font-size: 20px; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 15px;">SKILLS</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${resumeData.skills.map(skill => `
                                <div style="background-color: #3498db; color: white; padding: 5px 12px; border-radius: 15px; font-size: 14px;">${skill}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Template 3: Creative
    function generateTemplate3() {
        return `
            <div class="resume-template" style="background-color: white; padding: 30px; max-width: 800px; margin: 0 auto;">
                <div style="background-color: #6c5ce7; padding: 30px; color: white; margin-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 36px;">${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}</h1>
                    <div style="margin-top: 10px; font-size: 16px;">
                        ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.address}
                    </div>
                </div>
                
                <div style="display: flex; gap: 30px;">
                    <div style="flex: 2;">
                        ${resumeData.workExperience.length > 0 ? `
                        <div style="margin-bottom: 30px;">
                            <h2 style="color: #6c5ce7; border-bottom: 2px solid #6c5ce7; padding-bottom: 5px;">Experience</h2>
                            ${resumeData.workExperience.map(work => `
                                <div style="margin-bottom: 20px; position: relative; padding-left: 20px;">
                                    <div style="position: absolute; left: 0; top: 5px; width: 10px; height: 10px; background-color: #6c5ce7; border-radius: 50%;"></div>
                                    <h3 style="margin: 0 0 5px 0; color: #2d3436;">${work.title}</h3>
                                    <div style="font-style: italic; color: #6c5ce7; margin-bottom: 5px;">${work.company} | ${work.startDate} - ${work.endDate || 'Present'}</div>
                                    <p style="margin: 0; color: #636e72;">${work.description}</p>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        
                        ${resumeData.education.length > 0 ? `
                        <div style="margin-bottom: 30px;">
                            <h2 style="color: #6c5ce7; border-bottom: 2px solid #6c5ce7; padding-bottom: 5px;">Education</h2>
                            ${resumeData.education.map(edu => `
                                <div style="margin-bottom: 20px; position: relative; padding-left: 20px;">
                                    <div style="position: absolute; left: 0; top: 5px; width: 10px; height: 10px; background-color: #6c5ce7; border-radius: 50%;"></div>
                                    <h3 style="margin: 0 0 5px 0; color: #2d3436;">${edu.degree}</h3>
                                    <div style="font-style: italic; color: #6c5ce7; margin-bottom: 5px;">${edu.school} | ${edu.startDate} - ${edu.endDate || 'Present'}</div>
                                    <p style="margin: 0; color: #636e72;">${edu.description}</p>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${resumeData.skills.length > 0 ? `
                    <div style="flex: 1;">
                        <div style="background-color: #f5f6fa; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #6c5ce7; margin-top: 0;">Skills</h2>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${resumeData.skills.map(skill => `
                                    <li style="margin-bottom: 8px; color: #2d3436;">${skill}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Download as PDF
    function downloadAsPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get the resume preview HTML
        const resumeContent = document.getElementById('resume-preview');
        
        // Use html2canvas to capture the resume as an image
        html2canvas(resumeContent).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = doc.internal.pageSize.getWidth() - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            doc.save(`${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume.pdf`);
        });
    }

    // Download as DOCX
    function downloadAsDocx() {
        // This is a simplified version. In a real app, you'd use a more robust DOCX generator
        alert("In a complete implementation, this would generate a DOCX file. For now, please use the PDF export.");
    }

    // Initialize the app
    init();
});