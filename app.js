document.addEventListener('DOMContentLoaded', () => {
    
    // --- Draggable Scroll for Research Tabs ---
    const slider = document.getElementById('dragContainer');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast multiplier
        slider.scrollLeft = scrollLeft - walk;
    });

    // Touch support for mobile dragging
    slider.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('touchend', () => {
        isDown = false;
    });

    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });


    // --- Tab Switching Logic ---
    const tabItems = document.querySelectorAll('.tab-item');
    const researchPanes = document.querySelectorAll('.research-pane');

    // Prevent click event if dragging
    let isDragging = false;
    slider.addEventListener('mousemove', (e) => {
        if (isDown) {
            isDragging = true;
        }
    });
    slider.addEventListener('mousedown', () => {
        isDragging = false;
    });

    tabItems.forEach(tab => {
        tab.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                return;
            }

            // Remove active class from all tabs
            tabItems.forEach(item => item.classList.remove('active'));
            // Remove active class from all panes
            researchPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Add active class to corresponding pane
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                if (this.classList.contains('nav-link')) {
                    this.classList.add('active');
                }
            }
        });
    });

    // --- VISUAL EDIT MODE LOGIC ---
    const toggleEditBtn = document.getElementById('toggle-edit-btn');
    const saveHtmlBtn = document.getElementById('save-html-btn');
    const imageUploadInput = document.getElementById('image-upload-input');
    let currentTargetPane = null;

    if (toggleEditBtn) {
        toggleEditBtn.addEventListener('click', () => {
            const isEditing = document.body.classList.toggle('edit-mode-active');
            
            // Toggle contenteditable on text elements
            const textElements = document.querySelectorAll('h1, h2, h3:not(.tab-item), p, .pane-highlights li');
            textElements.forEach(el => {
                if (isEditing) {
                    el.setAttribute('contenteditable', 'true');
                } else {
                    el.removeAttribute('contenteditable');
                }
            });

            if (isEditing) {
                toggleEditBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Disable Edit Mode';
                saveHtmlBtn.style.display = 'inline-flex';
                injectInsertImageButtons();
            } else {
                toggleEditBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Enable Edit Mode';
                saveHtmlBtn.style.display = 'none';
            }
        });
    }

    function injectInsertImageButtons() {
        const panes = document.querySelectorAll('.research-pane');
        panes.forEach(pane => {
            if (!pane.querySelector('.insert-img-btn')) {
                const btn = document.createElement('div');
                btn.className = 'insert-img-btn';
                btn.innerHTML = '<i class="fa-solid fa-image"></i> Insert Figure Here';
                btn.addEventListener('click', () => {
                    currentTargetPane = pane;
                    imageUploadInput.click();
                });
                // Insert after the first paragraph
                const firstP = pane.querySelector('p');
                if (firstP) {
                    firstP.after(btn);
                } else {
                    pane.appendChild(btn);
                }
            }
        });
    }

    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file && currentTargetPane) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.className = 'editable-img-wrapper';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result; // Base64 so it saves inline
                    img.className = 'editable-img img-align-center'; // Default
                    
                    const toolbar = document.createElement('div');
                    toolbar.className = 'img-toolbar';
                    toolbar.innerHTML = `
                        <button class="img-tool-btn" title="Align Left"><i class="fa-solid fa-align-left"></i></button>
                        <button class="img-tool-btn" title="Center"><i class="fa-solid fa-align-center"></i></button>
                        <button class="img-tool-btn" title="Align Right"><i class="fa-solid fa-align-right"></i></button>
                        <button class="img-tool-btn" title="Full Width"><i class="fa-solid fa-maximize"></i></button>
                        <button class="img-tool-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    `;
                    
                    // Toolbar logic
                    const btns = toolbar.querySelectorAll('.img-tool-btn');
                    btns[0].onclick = () => img.className = 'editable-img img-align-left';
                    btns[1].onclick = () => img.className = 'editable-img img-align-center';
                    btns[2].onclick = () => img.className = 'editable-img img-align-right';
                    btns[3].onclick = () => img.className = 'editable-img img-align-full';
                    btns[4].onclick = () => imgWrapper.remove();
                    
                    imgWrapper.appendChild(img);
                    imgWrapper.appendChild(toolbar);
                    
                    // Insert right before the insert button
                    const insertBtn = currentTargetPane.querySelector('.insert-img-btn');
                    currentTargetPane.insertBefore(imgWrapper, insertBtn);
                };
                reader.readAsDataURL(file);
            }
            this.value = ''; // Reset input
        });
    }

    if (saveHtmlBtn) {
        saveHtmlBtn.addEventListener('click', () => {
            // Temporarily disable edit mode to clean up DOM for saving
            document.body.classList.remove('edit-mode-active');
            document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                el.removeAttribute('contenteditable');
            });
            toggleEditBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Enable Edit Mode';
            saveHtmlBtn.style.display = 'none';

            // Clone document to manipulate
            const htmlCopy = document.documentElement.cloneNode(true);
            
            // Clean up UI elements from the saved version
            const insertBtns = htmlCopy.querySelectorAll('.insert-img-btn');
            insertBtns.forEach(btn => btn.remove());
            
            // Add DOCTYPE
            const finalHtml = '<!DOCTYPE html>\n' + htmlCopy.outerHTML;
            
            // Trigger download
            const blob = new Blob([finalHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'index.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Your updated index.html has been downloaded! Replace the old one in your academic-portfolio folder with this new one, and drop it into Netlify.');
        });
    }

});
