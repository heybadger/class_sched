(function() {
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let courses = [];
    const DEFAULT_START = 420, DEFAULT_END = 600, INTERVAL = 30;
    const grid = document.getElementById("scheduleGrid");
    const wrapper = document.getElementById("scheduleWrapper");
    const nameInput = document.getElementById("courseName");
    const profInput = document.getElementById("profName");
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
    const decoStyle = document.getElementById("decoStyle");
    const decoPosition = document.getElementById("decoPosition");
    const customDeco = document.getElementById("customDeco");
    const decoPreview = document.getElementById("decoPreview");
    const splashScreen = document.getElementById("splashScreen");
  
    const userImageInput = document.getElementById("userImageInput");
    const userImagePosition = document.getElementById("userImagePosition");
    const addUserImageBtn1 = document.getElementById("addUserImageBtn1");
    const addUserImageBtn2 = document.getElementById("addUserImageBtn2");
    const addUserImageBtn3 = document.getElementById("addUserImageBtn3");
    const clearUserImageBtn = document.getElementById("clearUserImageBtn");
  
    let userImages = [];
  
    customDeco.addEventListener("input", function() {
      decoPreview.textContent = this.value || decoStyle.value;
    });
    decoStyle.addEventListener("change", function() {
      decoPreview.textContent = this.value;
      customDeco.value = "";
    });
  
    function getDecoration() { return customDeco.value.trim() || decoStyle.value; }
    function getDecoPosition() { return decoPosition.value; }
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
  
    function renderUserImages() {
      document.querySelectorAll('.user-deco-img').forEach(el => el.remove());
      userImages.forEach(imgData => {
        const img = document.createElement('img');
        img.src = imgData.src;
        img.className = 'user-deco-img';
        img.dataset.id = imgData.id;
        const pos = imgData.position || 'top-left';
        switch(pos) {
          case 'top-right': img.style.top = '10px'; img.style.right = '10px'; img.style.left = 'auto'; img.style.bottom = 'auto'; break;
          case 'top-left': img.style.top = '10px'; img.style.left = '10px'; img.style.right = 'auto'; img.style.bottom = 'auto'; break;
          case 'bottom-right': img.style.bottom = '10px'; img.style.right = '10px'; img.style.top = 'auto'; img.style.left = 'auto'; break;
          case 'bottom-left': img.style.bottom = '10px'; img.style.left = '10px'; img.style.top = 'auto'; img.style.right = 'auto'; break;
          case 'center': img.style.top = '50%'; img.style.left = '50%'; img.style.transform = 'translate(-50%,-50%)'; img.style.opacity = '0.15'; break;
          default: img.style.top = '10px'; img.style.left = '10px';
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
              cellHtml += `<div class="course-block">${c.name}<span class="del" data-id="${c.id}">×</span>${profPart}</div>`;
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
      courses.push({ id: generateId(), name, prof, days, start, end });
      render();
      nameInput.value = "";
      profInput.value = "";
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
  
    // ----- NOTIFICATION + GIF (2.5 seconds) -----
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
  
      // 2.5 seconds delay (2500ms)
      setTimeout(function() {
        if (gifOverlay.parentNode) gifOverlay.remove();
      }, 2500);
    }
  
    // ----- save as image -----
    function saveAsImage() {
      if (courses.length === 0) { 
        alert("Add some courses first before saving as image.");
        return; 
      }
      const deco = getDecoration(), position = getDecoPosition();
      document.querySelectorAll(".course-block .del").forEach(el => el.style.display = "none");
      let decoElement = null;
      if (deco && deco !== "none") {
        decoElement = document.createElement("div");
        decoElement.textContent = deco;
        decoElement.style.cssText = `position:absolute; font-size:4rem; opacity:0.15; pointer-events:none; z-index:10; font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;`;
        switch(position) {
          case "top-right": decoElement.style.top = "15px"; decoElement.style.right = "20px"; break;
          case "top-left": decoElement.style.top = "15px"; decoElement.style.left = "20px"; break;
          case "bottom-right": decoElement.style.bottom = "15px"; decoElement.style.right = "20px"; break;
          case "bottom-left": decoElement.style.bottom = "15px"; decoElement.style.left = "20px"; break;
          case "center": decoElement.style.top = "50%"; decoElement.style.left = "50%"; decoElement.style.transform = "translate(-50%,-50%)"; decoElement.style.fontSize = "8rem"; decoElement.style.opacity = "0.08"; break;
        }
        wrapper.style.position = "relative";
        wrapper.appendChild(decoElement);
      }
      html2canvas(wrapper, {
        scale: 2,
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
          if (clonedWrapper) { clonedWrapper.style.overflow = "visible"; clonedWrapper.style.width = clonedWrapper.scrollWidth + "px"; }
        }
      }).then(canvas => {
        if (decoElement) decoElement.remove();
        document.querySelectorAll(".course-block .del").forEach(el => el.style.display = "");
        const link = document.createElement("a");
        const title = getScheduleTitle().replace(/[^a-zA-Z0-9]/g, "_");
        link.download = title + "_" + new Date().toISOString().slice(0,10) + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        showThankYouNotif();
      }).catch(err => {
        if (decoElement) decoElement.remove();
        document.querySelectorAll(".course-block .del").forEach(el => el.style.display = "");
        alert("Failed to generate image: " + err.message);
      });
    }
  
    // ----- user image helpers -----
    function addUserImage() {
      const file = userImageInput.files[0];
      if (!file) { alert("Please select an image file first."); return; }
      const reader = new FileReader();
      reader.onload = function(e) {
        const src = e.target.result;
        const pos = userImagePosition.value;
        userImages.push({ src, position: pos, id: generateId() });
        renderUserImages();
        userImageInput.value = '';
      };
      reader.readAsDataURL(file);
    }
  
    function clearUserImages() {
      if (userImages.length === 0) return;
      userImages = [];
      renderUserImages();
    }
  
    addUserImageBtn1.addEventListener('click', addUserImage);
    addUserImageBtn2.addEventListener('click', addUserImage);
    addUserImageBtn3.addEventListener('click', addUserImage);
    clearUserImageBtn.addEventListener('click', clearUserImages);
  
    // ----- main event listeners -----
    addBtn.addEventListener("click", addCourseFromForm);
    clearAllBtn.addEventListener("click", clearAll);
    exportBtn.addEventListener("click", exportSchedule);
    importInput.addEventListener("change", function(e) {
      if (this.files && this.files.length > 0) { importSchedule(this.files[0]); this.value = ""; }
    });
    imageBtn.addEventListener("click", saveAsImage);
    titleInput.addEventListener("input", render);
  
    nameInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") { e.preventDefault(); const hasSelected = Array.from(dayCbs).some(cb => cb.checked); if (!hasSelected) document.querySelector('.day-check input[value="Mon"]').checked = true; addCourseFromForm(); }
    });
    profInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") { e.preventDefault(); const hasSelected = Array.from(dayCbs).some(cb => cb.checked); if (!hasSelected) document.querySelector('.day-check input[value="Mon"]').checked = true; addCourseFromForm(); }
    });
    startInput.addEventListener("keydown", function(e) { if (e.key === "Enter") addCourseFromForm(); });
    endInput.addEventListener("keydown", function(e) { if (e.key === "Enter") addCourseFromForm(); });
  
    courses = [];
    render();
  
    setTimeout(function() { splashScreen.style.display = "none"; }, 3000);
  })();
