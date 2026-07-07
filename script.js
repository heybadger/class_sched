(function() {
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let courses = [];
    
    const DEFAULT_START = 420;
    const DEFAULT_END = 600;
    const INTERVAL = 30;

    const grid = document.getElementById('scheduleGrid');
    const wrapper = document.getElementById('scheduleWrapper');
    const nameInput = document.getElementById('courseName');
    const dayCbs = document.querySelectorAll('.day-cb');
    const startInput = document.getElementById('startTime');
    const endInput = document.getElementById('endTime');
    const addBtn = document.getElementById('addBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importInput = document.getElementById('importInput');
    const printBtn = document.getElementById('printBtn');
    const imageBtn = document.getElementById('imageBtn');
    const titleInput = document.getElementById('scheduleTitle');
    const beginnerTip = document.getElementById('beginnerTip');
    
    const decoStyle = document.getElementById('decoStyle');
    const decoPosition = document.getElementById('decoPosition');
    const customDeco = document.getElementById('customDeco');
    const decoPreview = document.getElementById('decoPreview');

    const splashScreen = document.getElementById('splashScreen');

    customDeco.addEventListener('input', function() {
        decoPreview.textContent = this.value || decoStyle.value;
    });
    decoStyle.addEventListener('change', function() {
        decoPreview.textContent = this.value;
        customDeco.value = '';
    });

    function getDecoration() {
        return customDeco.value.trim() || decoStyle.value;
    }

    function getDecoPosition() {
        return decoPosition.value;
    }

    function generateId() { return Date.now() + '-' + Math.random().toString(36).substring(2, 6); }

    function getSelectedDays() {
        const selected = [];
        dayCbs.forEach(cb => { if (cb.checked) selected.push(cb.value); });
        return selected;
    }

    function getTimeValue(timeStr) {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    function formatTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    function getScheduleTitle() {
        const title = titleInput.value.trim();
        return title || 'My Class Schedule';
    }

    function render() {
        const title = getScheduleTitle();
        
        if (courses.length > 0) {
            beginnerTip.style.display = 'none';
        } else {
            beginnerTip.style.display = 'flex';
        }
        
        let startTime = DEFAULT_START;
        let endTime = DEFAULT_END;
        
        if (courses.length > 0) {
            let minTime = Infinity;
            let maxTime = -Infinity;
            courses.forEach(c => {
                const s = getTimeValue(c.start);
                const e = getTimeValue(c.end);
                if (s < minTime) minTime = s;
                if (e > maxTime) maxTime = e;
            });
            startTime = Math.min(DEFAULT_START, minTime - 30);
            endTime = Math.max(DEFAULT_END, maxTime + 30);
            startTime = Math.floor(startTime / 30) * 30;
            endTime = Math.ceil(endTime / 30) * 30;
        }
        
        const timeSlots = [];
        for (let t = startTime; t <= endTime; t += INTERVAL) {
            timeSlots.push(t);
        }
        
        let html = `
            <div class="schedule-title-bar">
                <span class="title-text">${title}</span>
            </div>
        `;
        
        html += '<div class="grid-header"></div>';
        DAYS.forEach(d => html += `<div class="grid-header">${d}</div>`);
        html += '</div>';

        timeSlots.forEach(timeMin => {
            const timeLabel = formatTime(timeMin);
            html += `<div class="grid-cell time-label">${timeLabel}</div>`;
            DAYS.forEach(day => {
                const cellCourses = courses.filter(c => 
                    c.days.includes(day) && 
                    getTimeValue(c.start) <= timeMin && 
                    getTimeValue(c.end) > timeMin
                );
                
                let cellHtml = '';
                if (cellCourses.length > 0) {
                    cellCourses.forEach(c => {
                        cellHtml += `<div class="course-block">
                            ${c.name}
                            <span class="del" data-id="${c.id}">×</span>
                        </div>`;
                    });
                } else {
                    cellHtml = `<div class="empty-hint">·</div>`;
                }
                html += `<div class="grid-cell">${cellHtml}</div>`;
            });
        });

        grid.innerHTML = html;

        document.querySelectorAll('.course-block .del').forEach(el => {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.id;
                courses = courses.filter(c => c.id !== id);
                render();
            });
        });
    }

    function addCourseFromForm() {
        const name = nameInput.value.trim();
        if (!name) { 
            alert('Please enter a course name.');
            nameInput.focus();
            return; 
        }
        const days = getSelectedDays();
        if (days.length === 0) { 
            alert('Please select at least one day.');
            return; 
        }
        const start = startInput.value;
        const end = endInput.value;
        if (!start || !end) { 
            alert('Please set both start and end time.');
            return; 
        }
        if (getTimeValue(start) >= getTimeValue(end)) {
            alert('Start time must be before end time.');
            return;
        }
        
        courses.push({
            id: generateId(),
            name: name,
            days: days,
            start: start,
            end: end
        });
        render();
        
        nameInput.value = '';
        dayCbs.forEach(cb => cb.checked = false);
        startInput.value = '08:00';
        endInput.value = '09:00';
        nameInput.focus();
    }

    function clearAll() {
        if (courses.length === 0) return;
        if (confirm('Delete all courses from your schedule?')) {
            courses = [];
            render();
        }
    }

    function exportSchedule() {
        if (courses.length === 0) { 
            alert('Add some courses first before exporting.');
            return; 
        }
        const data = JSON.stringify({
            title: getScheduleTitle(),
            courses: courses
        }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schedule-' + new Date().toISOString().slice(0,10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function importSchedule(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const imported = JSON.parse(e.target.result);
                let importedCourses;
                let importedTitle;
                
                if (imported.courses && Array.isArray(imported.courses)) {
                    importedCourses = imported.courses;
                    importedTitle = imported.title || 'My Class Schedule';
                } else if (Array.isArray(imported)) {
                    importedCourses = imported;
                } else {
                    throw new Error('Invalid format');
                }
                
                const valid = importedCourses.every(c => c.name && c.days && c.start && c.end);
                if (!valid) throw new Error('Missing fields in imported data.');
                if (importedCourses.length === 0) { 
                    alert('Imported file is empty.'); 
                    return; 
                }
                
                courses = importedCourses.map(c => ({ ...c, id: generateId() }));
                if (importedTitle) {
                    titleInput.value = importedTitle;
                }
                render();
                alert(`Imported ${courses.length} courses successfully.`);
            } catch(err) {
                alert('Failed to import: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    function saveAsImage() {
        if (courses.length === 0) {
            alert('Add some courses first before saving as image.');
            return;
        }
        
        const deco = getDecoration();
        const position = getDecoPosition();
        
        document.querySelectorAll('.course-block .del').forEach(el => {
            el.style.display = 'none';
        });
        
        let decoElement = null;
        if (deco && deco !== 'none') {
            decoElement = document.createElement('div');
            decoElement.textContent = deco;
            decoElement.style.cssText = `
                position: absolute;
                font-size: 4rem;
                opacity: 0.15;
                pointer-events: none;
                z-index: 10;
                font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            `;
            
            switch(position) {
                case 'top-right':
                    decoElement.style.top = '15px';
                    decoElement.style.right = '20px';
                    break;
                case 'top-left':
                    decoElement.style.top = '15px';
                    decoElement.style.left = '20px';
                    break;
                case 'bottom-right':
                    decoElement.style.bottom = '15px';
                    decoElement.style.right = '20px';
                    break;
                case 'bottom-left':
                    decoElement.style.bottom = '15px';
                    decoElement.style.left = '20px';
                    break;
                case 'center':
                    decoElement.style.top = '50%';
                    decoElement.style.left = '50%';
                    decoElement.style.transform = 'translate(-50%, -50%)';
                    decoElement.style.fontSize = '8rem';
                    decoElement.style.opacity = '0.08';
                    break;
            }
            wrapper.style.position = 'relative';
            wrapper.appendChild(decoElement);
        }
        
        html2canvas(wrapper, {
            scale: 2,
            backgroundColor: '#ffffff',
            allowTaint: false,
            useCORS: true,
            logging: false,
            onclone: function(clonedDoc) {
                clonedDoc.querySelectorAll('.course-block .del').forEach(el => {
                    el.style.display = 'none';
                });
            }
        }).then(canvas => {
            if (decoElement) {
                decoElement.remove();
            }
            document.querySelectorAll('.course-block .del').forEach(el => {
                el.style.display = '';
            });
            
            const link = document.createElement('a');
            const title = getScheduleTitle().replace(/[^a-zA-Z0-9]/g, '_');
            link.download = title + '_' + new Date().toISOString().slice(0,10) + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            if (decoElement) {
                decoElement.remove();
            }
            document.querySelectorAll('.course-block .del').forEach(el => {
                el.style.display = '';
            });
            alert('Failed to generate image: ' + err.message);
        });
    }

    function printSchedule() {
        if (courses.length === 0) {
            alert('Add some courses first before printing.');
            return;
        }
        window.print();
    }

    addBtn.addEventListener('click', addCourseFromForm);
    clearAllBtn.addEventListener('click', clearAll);
    exportBtn.addEventListener('click', exportSchedule);
    importInput.addEventListener('change', function(e) {
        if (this.files && this.files.length > 0) {
            importSchedule(this.files[0]);
            this.value = '';
        }
    });
    printBtn.addEventListener('click', printSchedule);
    imageBtn.addEventListener('click', saveAsImage);
    titleInput.addEventListener('input', render);

    nameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const hasSelected = Array.from(dayCbs).some(cb => cb.checked);
            if (!hasSelected) {
                document.querySelector('.day-check input[value="Mon"]').checked = true;
            }
            addCourseFromForm();
        }
    });
    startInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') addCourseFromForm();
    });
    endInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') addCourseFromForm();
    });

    courses = [];
    render();

    setTimeout(function() {
        splashScreen.style.display = 'none';
    }, 3000);
})();