(function() {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let courses = [];
  const DEFAULT_START = 420, DEFAULT_END = 600, INTERVAL = 30;
  const grid = document.getElementById("scheduleGrid");
  const wrapper = document.getElementById("scheduleWrapper");
  const nameInput = document.getElementById("courseName");
  const profInput = document.getElementById("profName");
  const roomInput = document.getElementById("roomName");
  const buildingInput = document.getElementById("buildingName");
  const dayCbs = document.querySelectorAll(".day-cb");
  const startInput = document.getElementById("startTime");
  const endInput = document.getElementById("endTime");
  const addBtn = document.getElementById("addBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importInput");
  const imageBtn = document.getElementById("imageBtn");
  const titleInput = document.getElementById("scheduleTitle");
  const beginnerTip = document.getElementById("beginnerTip");
  const splashScreen = document.getElementById("splashScreen");
  
  const bgImage1 = document.getElementById("bgImage1");
  const bgImage2 = document.getElementById("bgImage2");
  const bgImage3 = document.getElementById("bgImage3");
  const bgImage4 = document.getElementById("bgImage4");
  const bgImage5 = document.getElementById("bgImage5");
  const bgImageSelectors = [bgImage1, bgImage2, bgImage3, bgImage4, bgImage5];

  function generateId() { return Date.now() + "-" + Math.random().toString(36).substring(2,6); }

  function getSelectedDays() {
    const selected = [];
    dayCbs.forEach(cb => { if (cb.checked) selected.push(cb.value); });
    return selected;
  }
  function getTimeValue(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }
  function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }
  function getScheduleTitle() { return titleInput.value.trim() || "My Class Schedule"; }

  function getBackgroundImages() {
    const images = [];
    const positions = ['top-right', 'top-left', 'center', 'bottom-right', 'bottom-left'];
    bgImageSelectors.forEach((selector, index) => {
      const value = selector.value;
      if (value !== 'none') {
        images.push({ src: value, position: positions[index] });
      }
    });
    return images;
  }

  // REMOVE ALL EXISTING IMAGES FIRST
  function clearAllImages() {
    document.querySelectorAll('.user-deco-img').forEach(el => el.remove());
  }

  function renderUserImages() {
    clearAllImages(); // Clear first
    const images = getBackgroundImages();
    images.forEach(imgData => {
      const img = document.createElement('img');
      img.src = imgData.src;
      img.className = 'user-deco-img';
      img.style.position = 'absolute';
      img.style.pointerEvents = 'none';
      img.style.zIndex = '5';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '12px';
      img.style.opacity = '0.25';
      img.style.maxWidth = '150px';
      img.style.maxHeight = '150px';
      
      const pos = imgData.position;
      switch(pos) {
        case 'top-right':
          img.style.top = '10px';
          img.style.right = '10px';
          img.style.left = 'auto';
          img.style.bottom = 'auto';
          break;
        case 'top-left':
          img.style.top = '10px';
          img.style.left = '10px';
          img.style.right = 'auto';
          img.style.bottom = 'auto';
          break;
        case 'bottom-right':
          img.style.bottom = '10px';
          img.style.right = '10px';
          img.style.top = 'auto';
          img.style.left = 'auto';
          break;
        case 'bottom-left':
          img.style.bottom = '10px';
          img.style.left = '10px';
          img.style.top = 'auto';
          img.style.right = 'auto';
          break;
        case 'center':
          img.style.top = '50%';
          img.style.left = '50%';
          img.style.transform = 'translate(-50%,-50%)';
          img.style.opacity = '0.15';
          img.style.maxWidth = '200px';
          img.style.maxHeight = '200px';
          break;
      }
      wrapper.appendChild(img);
    });
  }

  function render() {
    const title = getScheduleTitle();
    if (courses.length > 0) beginnerTip.style.display = "none";
    else beginnerTip.style.display = "flex";

    let startTime = DEFAULT_START, endTime = DEFAULT_END;
    if (courses.length > 0) {
      let minTime = Infinity, maxTime = -Infinity;
      courses.forEach(c => {
        const s = getTimeValue(c.start), e = getTimeValue(c.end);
        if (s < minTime) minTime = s;
        if (e > maxTime) maxTime = e;
      });
      startTime = Math.min(DEFAULT_START, minTime - 30);
      endTime = Math.max(DEFAULT_END, maxTime + 30);
      startTime = Math.floor(startTime / 30) * 30;
      endTime = Math.ceil(endTime / 30) * 30;
    }
    const timeSlots = [];
    for (let t = startTime; t <= endTime; t += INTERVAL) timeSlots.push(t);

    let html = `<div class="schedule-title-bar"><span class="title-text">${title}</span></div>`;
    html += '<div class="grid-header"></div>';
    DAYS.forEach(d => html += `<div class="grid-header">${d}</div>`);
    html += "</div>";

    timeSlots.forEach(timeMin => {
      const timeLabel = formatTime(timeMin);
      html += `<div class="grid-cell time-label">${timeLabel}</div>`;
      DAYS.forEach(day => {
        const cellCourses = courses.filter(c => c.days.includes(day) && getTimeValue(c.start) <= timeMin && getTimeValue(c.end) > timeMin);
        let cellHtml = "";
        if (cellCourses.length > 0) {
          cellCourses.forEach(c => {
            const profPart = c.prof ? `<span class="prof-name">${c.prof}</span>` : "";
            const roomPart = c.room ? `<span class="room-name">Room ${c.room}</span>` : "";
            const buildingPart = c.building ? `<span class="building-name">Building ${c.building}</span>` : "";
            cellHtml += `<div class="course-block">${c.name}<span class="del" data-id="${c.id}">×</span>${profPart}${roomPart}${buildingPart}</div>`;
          });
        } else {
          cellHtml = `<div class="empty-hint">·</div>`;
        }
        html += `<div class="grid-cell">${cellHtml}</div>`;
      });
    });

    grid.innerHTML = html;
    document.querySelectorAll(".course-block .del").forEach(el => {
      el.addEventListener("click", function(e) {
        e.stopPropagation();
        const id = this.dataset.id;
        courses = courses.filter(c => c.id !== id);
        render();
      });
    });

    renderUserImages();
  }

  function addCourseFromForm() {
    const name = nameInput.value.trim();
    if (!name) { alert("Please enter a course name."); nameInput.focus(); return; }
    const days = getSelectedDays();
    if (days.length === 0) { alert("Please select at least one day."); return; }
    const start = startInput.value, end = endInput.value;
    if (!start || !end) { alert("Please set both start and end time."); return; }
    if (getTimeValue(start) >= getTimeValue(end)) { alert("Start time must be before end time."); return; }
    const prof = profInput.value.trim() || "";
    const room = roomInput.value.trim() || "";
    const building = buildingInput.value.trim() || "";
    courses.push({ id: generateId(), name, prof, room, building, days, start, end });
    render();
    nameInput.value = "";
    profInput.value = "";
    roomInput.value = "";
    buildingInput.value = "";
    dayCbs.forEach(cb => cb.checked = false);
    startInput.value = "08:00";
    endInput.value = "09:00";
    nameInput.focus();
  }

  function clearAll() {
    if (courses.length === 0) return;
    if (confirm("Delete all courses from your schedule?")) { courses = []; render(); }
  }

  function exportSchedule() {
    if (courses.length === 0) { alert("Add some courses first before exporting."); return; }
    const data = JSON.stringify({ title: getScheduleTitle(), courses }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule-" + new Date().toISOString().slice(0,10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSchedule(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        let importedCourses, importedTitle;
        if (imported.courses && Array.isArray(imported.courses)) {
          importedCourses = imported.courses;
          importedTitle = imported.title || "My Class Schedule";
        } else if (Array.isArray(imported)) {
          importedCourses = imported;
        } else throw new Error("Invalid format");
        const valid = importedCourses.every(c => c.name && c.days && c.start && c.end);
        if (!valid) throw new Error("Missing fields in imported data.");
        if (importedCourses.length === 0) { alert("Imported file is empty."); return; }
        courses = importedCourses.map(c => ({ ...c, id: generateId() }));
        if (importedTitle) titleInput.value = importedTitle;
        render();
        alert(`Imported ${courses.length} courses successfully.`);
      } catch (err) {
        alert("Failed to import: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function showThankYouNotif() {
    const existing = document.querySelector('.custom-notif-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'custom-notif-overlay';
    overlay.innerHTML = `
      <div class="custom-notif-box">
        <div class="notif-emoji">🌸</div>
        <div class="notif-msg">
          Salamat sa pag gamit hehe^^<br>
          sana nagustuhan mo yung simple<br>
          class sched maker mo na itech nhak
        </div>
        <button class="notif-close" id="notifCloseBtn">✕</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('notifCloseBtn').addEventListener('click', function() {
      overlay.remove();
      showGifPopup();
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
        showGifPopup();
      }
    });
  }

  function showGifPopup() {
    const existingGif = document.querySelector('.gif-popup-overlay');
    if (existingGif) existingGif.remove();
    const gifOverlay = document.createElement('div');
    gifOverlay.className = 'gif-popup-overlay';
    gifOverlay.innerHTML = `
      <div class="gif-popup-box">
        <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2czbm5tenYyMHBncDFubXhtbmZ6bDMzaWZxaW5tZ2xudXE3ZDFwcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TF9z8Id4LJru8/giphy.gif" alt="Happy GIF" />
      </div>
    `;
    document.body.appendChild(gifOverlay);
    setTimeout(function() {
      if (gifOverlay.parentNode) gifOverlay.remove();
    }, 2500);
  }

  function saveAsImage() {
    if (courses.length === 0) { 
      alert("Add some courses first before saving as image.");
      return; 
    }
    
    // Hide delete buttons
    document.querySelectorAll(".course-block .del").forEach(el => el.style.display = "none");
    
    // FIRST: Remove ALL existing images from wrapper
    clearAllImages();
    
    // Get images to add
    const images = getBackgroundImages();
    const imageElements = [];
    
    // Add images to wrapper for screenshot (ONLY ONCE)
    images.forEach(imgData => {
      const img = document.createElement('img');
      img.src = imgData.src;
      img.style.position = 'absolute';
      img.style.pointerEvents = 'none';
      img.style.zIndex = '5';
      img.style.objectFit = 'contain';
      img.style.borderRadius = '12px';
      img.style.opacity = '0.2';
      img.style.maxWidth = '150px';
      img.style.maxHeight = '150px';
      
      const pos = imgData.position;
      switch(pos) {
        case "top-right":
          img.style.top = "15px";
          img.style.right = "20px";
          img.style.left = "auto";
          img.style.bottom = "auto";
          break;
        case "top-left":
          img.style.top = "15px";
          img.style.left = "20px";
          img.style.right = "auto";
          img.style.bottom = "auto";
          break;
        case "bottom-right":
          img.style.bottom = "15px";
          img.style.right = "20px";
          img.style.top = "auto";
          img.style.left = "auto";
          break;
        case "bottom-left":
          img.style.bottom = "15px";
          img.style.left = "20px";
          img.style.top = "auto";
          img.style.right = "auto";
          break;
        case "center":
          img.style.top = "50%";
          img.style.left = "50%";
          img.style.transform = "translate(-50%,-50%)";
          img.style.maxWidth = "250px";
          img.style.maxHeight = "250px";
          img.style.opacity = "0.1";
          break;
      }
      wrapper.appendChild(img);
      imageElements.push(img);
    });

    // Wait a moment for images to render
    setTimeout(function() {
      html2canvas(wrapper, {
        scale: 3,
        backgroundColor: "#ffffff",
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: wrapper.scrollWidth,
        height: wrapper.scrollHeight,
        windowWidth: wrapper.scrollWidth,
        windowHeight: wrapper.scrollHeight,
        onclone: function(clonedDoc) {
          clonedDoc.querySelectorAll(".course-block .del").forEach(el => el.style.display = "none");
          const clonedWrapper = clonedDoc.getElementById("scheduleWrapper");
          if (clonedWrapper) { 
            clonedWrapper.style.overflow = "visible"; 
            clonedWrapper.style.width = clonedWrapper.scrollWidth + "px";
          }
        }
      }).then(canvas => {
        // Remove temporary images
        imageElements.forEach(img => img.remove());
        // Restore original images
        renderUserImages();
        document.querySelectorAll(".course-block .del").forEach(el => el.style.display = "");
        
        const link = document.createElement("a");
        const title = getScheduleTitle().replace(/[^a-zA-Z0-9]/g, "_");
        link.download = title + "_" + new Date().toISOString().slice(0,10) + ".png";
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
        showThankYouNotif();
      }).catch(err => {
        imageElements.forEach(img => img.remove());
        renderUserImages();
        document.querySelectorAll(".course-block .del").forEach(el => el.style.display = "");
        alert("Failed to generate image: " + err.message);
      });
    }, 300);
  }

  addBtn.addEventListener("click", addCourseFromForm);
  clearAllBtn.addEventListener("click", clearAll);
  exportBtn.addEventListener("click", exportSchedule);
  importInput.addEventListener("change", function(e) {
    if (this.files && this.files.length > 0) { importSchedule(this.files[0]); this.value = ""; }
  });
  imageBtn.addEventListener("click", saveAsImage);
  titleInput.addEventListener("input", render);
  
  bgImageSelectors.forEach(selector => {
    selector.addEventListener('change', render);
  });

  nameInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); const hasSelected = Array.from(dayCbs).some(cb => cb.checked); if (!hasSelected) document.querySelector('.day-check input[value="Mon"]').checked = true; addCourseFromForm(); }
  });
  profInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); const hasSelected = Array.from(dayCbs).some(cb => cb.checked); if (!hasSelected) document.querySelector('.day-check input[value="Mon"]').checked = true; addCourseFromForm(); }
  });
  roomInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); const hasSelected = Array.from(dayCbs).some(cb => cb.checked); if (!hasSelected) document.querySelector('.day-check input[value="Mon"]').checked = true; addCourseFromForm(); }
  });
  buildingInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); const hasSelected = Array.from(dayCbs).some(cb => cb.checked); if (!hasSelected) document.querySelector('.day-check input[value="Mon"]').checked = true; addCourseFromForm(); }
  });
  startInput.addEventListener("keydown", function(e) { if (e.key === "Enter") addCourseFromForm(); });
  endInput.addEventListener("keydown", function(e) { if (e.key === "Enter") addCourseFromForm(); });

  courses = [];
  render();
  setTimeout(function() { splashScreen.style.display = "none"; }, 3000);
})();
