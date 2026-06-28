// PORTFOLIO LOGIC & INTERACTION ENGINE
// Dynamically reads from portfolioConfig and binds browser events

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. STATE & GLOBAL CONFIGURATION
  // ==========================================
  let localConfig = { ...portfolioConfig }; // local copy we can modify dynamically
  let currentSlideIndex = 0;
  let carouselIntervalId = null;
  
  // Typing Animation Roles
  const typingRoles = ["Video Editor", "Colorist", "Visual Storyteller", "Music Composer"];
  
  // ==========================================
  // 2. INITIALIZATION & RENDERING
  // ==========================================
  function init() {
    renderProfile();
    renderHeroCarousel();
    renderVideos('all');
    renderPhotos('all');
    renderSocialLinks();
    
    // Setup Lucide icons after rendering
    lucide.createIcons();
    
    // Start typing animation
    startTypingAnimation();
    
    // Setup viewport scroll fade-in transitions
    setupScrollAnimations();

    // Set up carousel controls event listeners
    const prevSlideBtn = document.getElementById('hero-carousel-prev');
    const nextSlideBtn = document.getElementById('hero-carousel-next');
    if (prevSlideBtn) {
      prevSlideBtn.addEventListener('click', () => {
        showSlide(currentSlideIndex - 1);
        resetCarouselAutoplay();
      });
    }
    if (nextSlideBtn) {
      nextSlideBtn.addEventListener('click', () => {
        showSlide(currentSlideIndex + 1);
        resetCarouselAutoplay();
      });
    }
  }

  // Render Profile details
  function renderProfile() {
    document.getElementById('hero-name').innerHTML = localConfig.profile.name;
    document.getElementById('hero-title-role').textContent = localConfig.profile.title;
    
    document.getElementById('about-profile-img').src = localConfig.profile.profileImage;
    document.getElementById('about-profile-img').alt = localConfig.profile.name;
    document.getElementById('about-bio-text').textContent = localConfig.profile.aboutText;
    
    document.getElementById('stat-exp').textContent = localConfig.profile.experienceYears;
    document.getElementById('stat-projects').textContent = localConfig.profile.projectsCompleted;
    document.getElementById('stat-clients').textContent = localConfig.profile.happyClients;
    
    // Skills tags
    const skillsList = document.getElementById('skills-badge-list');
    skillsList.innerHTML = '';
    localConfig.profile.skills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      skillsList.appendChild(tag);
    });
    
    // Resume button
    const resumeBtn = document.getElementById('resume-download-btn');
    if (localConfig.profile.resumeUrl && localConfig.profile.resumeUrl !== '#') {
      resumeBtn.href = localConfig.profile.resumeUrl;
      resumeBtn.style.display = 'inline-flex';
    } else {
      resumeBtn.style.display = 'none';
    }
    
    // Footer Year update
    document.getElementById('footer-year').textContent = new Date().getFullYear();
  }

  // Render Hero Carousel
  function renderHeroCarousel() {
    const track = document.getElementById('hero-carousel-track');
    const dotsContainer = document.getElementById('hero-carousel-dots');
    
    if (!track || !dotsContainer) return;
    
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    const slides = localConfig.carousel || [];
    
    if (slides.length === 0) {
      track.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-muted);">No slides configured.</div>`;
      return;
    }
    
    slides.forEach((slide, idx) => {
      // Create slide element
      const slideDiv = document.createElement('div');
      slideDiv.className = `hero-slide ${idx === 0 ? 'active' : ''}`;
      slideDiv.innerHTML = `<img src="${slide.imageUrl}" alt="${slide.title}" loading="lazy">`;
      track.appendChild(slideDiv);
      
      // Create dot element
      const dotSpan = document.createElement('span');
      dotSpan.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dotSpan.addEventListener('click', () => {
        showSlide(idx);
        resetCarouselAutoplay();
      });
      dotsContainer.appendChild(dotSpan);
    });
    
    // Initialize first slide caption
    currentSlideIndex = 0;
    updateSlideCaption(0);
    
    // Start autoplay
    startCarouselAutoplay();
  }

  function showSlide(idx) {
    const slides = localConfig.carousel || [];
    if (slides.length === 0) return;
    
    // Handle wrap-around
    if (idx >= slides.length) idx = 0;
    if (idx < 0) idx = slides.length - 1;
    
    currentSlideIndex = idx;
    
    // Update active class on slides
    const slideElements = document.querySelectorAll('.hero-slide');
    slideElements.forEach((s, i) => {
      if (i === idx) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
    
    // Update active class on dots
    const dotElements = document.querySelectorAll('.carousel-dot');
    dotElements.forEach((d, i) => {
      if (i === idx) {
        d.classList.add('active');
      } else {
        d.classList.remove('active');
      }
    });
    
    // Update caption details
    updateSlideCaption(idx);
  }

  function updateSlideCaption(idx) {
    const slides = localConfig.carousel || [];
    const titleEl = document.getElementById('carousel-slide-title');
    const subtitleEl = document.getElementById('carousel-slide-subtitle');
    
    if (slides[idx]) {
      if (titleEl) titleEl.textContent = slides[idx].title;
      if (subtitleEl) subtitleEl.textContent = slides[idx].subtitle;
    }
  }

  function startCarouselAutoplay() {
    // Clear existing interval just in case
    if (carouselIntervalId) clearInterval(carouselIntervalId);
    
    carouselIntervalId = setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, 5000); // Auto-rotation time: 5 seconds
  }

  function resetCarouselAutoplay() {
    startCarouselAutoplay();
  }

  // Render Videos with filters
  function renderVideos(filter) {
    const grid = document.getElementById('video-cards-grid');
    grid.innerHTML = '';
    
    const filteredVideos = filter === 'all' 
      ? localConfig.videos 
      : localConfig.videos.filter(v => v.category === filter);
      
    if (filteredVideos.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 40px;">No videos found in this category.</div>`;
      return;
    }
    
    filteredVideos.forEach(vid => {
      const card = document.createElement('div');
      card.className = 'video-card glass-card';
      card.innerHTML = `
        <div class="video-thumb-wrap" data-url="${vid.videoUrl}">
          <img src="${vid.thumbnail}" alt="${vid.title}" class="video-thumb" loading="lazy">
          <div class="video-overlay">
            <div class="play-icon-btn">
              <i data-lucide="play"></i>
            </div>
          </div>
        </div>
        <div class="video-info">
          <div>
            <div class="video-category">${vid.category.replace('-', ' ')}</div>
            <h3 class="video-card-title">${vid.title}</h3>
            <p class="video-card-desc">${vid.description}</p>
          </div>
        </div>
      `;
      
      // Open video lightbox event
      card.querySelector('.video-thumb-wrap').addEventListener('click', () => {
        openVideoModal(vid.videoUrl);
      });
      
      grid.appendChild(card);
    });
    lucide.createIcons();
  }

  // Render Photos with filters
  function renderPhotos(filter) {
    const grid = document.getElementById('photo-cards-grid');
    grid.innerHTML = '';
    
    const filteredPhotos = filter === 'all' 
      ? localConfig.photos 
      : localConfig.photos.filter(p => p.category === filter);
      
    if (filteredPhotos.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 40px;">No photos found in this category.</div>`;
      return;
    }
    
    filteredPhotos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'photo-card glass-card';
      card.innerHTML = `
        <img src="${photo.imageUrl}" alt="${photo.title}" class="photo-img" loading="lazy">
        <div class="photo-info-overlay">
          <span class="photo-tag">${photo.category}</span>
          <h3 class="photo-title">${photo.title}</h3>
          <p class="photo-desc">${photo.description || ''}</p>
        </div>
      `;
      
      // Open Lightbox Event
      card.addEventListener('click', () => {
        openPhotoLightbox(photo.imageUrl, photo.title, photo.description || '');
      });
      
      grid.appendChild(card);
    });
  }



  // Render Social link buttons
  function renderSocialLinks() {
    const socialContainer = document.getElementById('social-icons-list');
    socialContainer.innerHTML = '';
    
    const socials = localConfig.contact.socials;
    const phone = localConfig.contact.phone;
    const email = localConfig.contact.email;
    const address = localConfig.contact.address;
    
    // Update contact card links
    document.getElementById('contact-phone-link').textContent = phone;
    document.getElementById('contact-phone-link').href = `tel:${phone.replace(/\s+/g, '')}`;
    document.getElementById('contact-email-link').textContent = email;
    document.getElementById('contact-email-link').href = `mailto:${email}`;
    document.getElementById('contact-location-text').textContent = address;
    
    // Map socials icon key name
    const iconMap = {
      youtube: 'youtube',
      instagram: 'instagram',
      whatsapp: 'phone-call',
      behance: 'briefcase',
      twitter: 'twitter'
    };
    
    Object.keys(socials).forEach(key => {
      const url = socials[key];
      if (url && url !== '#') {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.className = 'social-icon-btn';
        a.ariaLabel = `Visit ${key}`;
        a.innerHTML = `<i data-lucide="${iconMap[key] || 'external-link'}"></i>`;
        socialContainer.appendChild(a);
      }
    });
    lucide.createIcons();
  }

  // ==========================================
  // 3. TYPING EFFECT
  // ==========================================
  function startTypingAnimation() {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.getElementById('typing-text-field');
    
    function typeEffect() {
      const currentWord = typingRoles[wordIndex];
      
      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }
      
      let speed = isDeleting ? 40 : 80;
      
      if (!isDeleting && charIndex === currentWord.length) {
        speed = 2200; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % typingRoles.length;
        speed = 500; // Pause before typing next word
      }
      
      setTimeout(typeEffect, speed);
    }
    
    typeEffect();
  }

  // ==========================================
  // 4. HEADER & MOBILE NAVIGATION
  // ==========================================
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Active link highlighting on scroll
    updateActiveNavLinks();
  });

  function updateActiveNavLinks() {
    const sections = document.querySelectorAll('section');
    const navA = document.querySelectorAll('.nav-links a');
    let currentId = 'hero';
    
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });
    
    navA.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${currentId}`) {
        a.classList.add('active');
      }
    });
  }

  // Mobile Menu toggles
  const menuBtn = document.getElementById('menu-toggle-btn');
  const navLinks = document.getElementById('nav-links');
  
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isOpen = navLinks.classList.contains('active');
    menuBtn.innerHTML = isOpen ? `<i data-lucide="x"></i>` : `<i data-lucide="menu"></i>`;
    lucide.createIcons();
  });

  // Close mobile nav when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.innerHTML = `<i data-lucide="menu"></i>`;
      lucide.createIcons();
    });
  });



  // ==========================================
  // 6. FILTERING GALLERIES
  // ==========================================
  
  // Video filter tabs click
  const videoTabs = document.querySelectorAll('#video-filter-tabs .filter-btn');
  videoTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      videoTabs.forEach(tb => tb.classList.remove('active'));
      e.target.classList.add('active');
      renderVideos(e.target.getAttribute('data-filter'));
    });
  });

  // Photo filter tabs click
  const photoTabs = document.querySelectorAll('#photo-filter-tabs .filter-btn');
  photoTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      photoTabs.forEach(tb => tb.classList.remove('active'));
      e.target.classList.add('active');
      renderPhotos(e.target.getAttribute('data-filter'));
    });
  });

  // ==========================================
  // 7. LIGHTBOX MODAL PLAYERS
  // ==========================================
  const vidModal = document.getElementById('video-player-modal');
  const vidIframe = document.getElementById('modal-video-iframe');
  const closeVidBtn = document.getElementById('close-video-modal-btn');
  
  const photoModal = document.getElementById('photo-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img-element');
  const lightboxCap = document.getElementById('lightbox-caption-text');
  const closePhotoBtn = document.getElementById('close-photo-modal-btn');

  function openVideoModal(url) {
    const isMp4 = url.toLowerCase().endsWith('.mp4');
    const vidElement = document.getElementById('modal-video-element');
    
    if (isMp4) {
      vidIframe.style.display = 'none';
      vidIframe.src = '';
      if (vidElement) {
        vidElement.src = url;
        vidElement.style.display = 'block';
      }
    } else {
      if (vidElement) {
        vidElement.style.display = 'none';
        vidElement.src = '';
      }
      const parsedUrl = getYouTubeEmbedUrl(url);
      vidIframe.src = parsedUrl;
      vidIframe.style.display = 'block';
    }
    
    vidModal.style.display = 'flex';
    
    // Pause background song if playing
    if (isPlaying) {
      pauseTrack();
    }
  }

  function closeVideoModal() {
    vidModal.style.display = 'none';
    vidIframe.src = '';
    const vidElement = document.getElementById('modal-video-element');
    if (vidElement) {
      vidElement.src = '';
      vidElement.style.display = 'none';
    }
  }

  closeVidBtn.addEventListener('click', closeVideoModal);
  
  function openPhotoLightbox(src, title, desc) {
    lightboxImg.src = src;
    lightboxCap.innerHTML = `<strong>${title}</strong>${desc ? ' — ' + desc : ''}`;
    photoModal.style.display = 'flex';
  }

  function closePhotoLightbox() {
    photoModal.style.display = 'none';
    lightboxImg.src = '';
  }

  closePhotoBtn.addEventListener('click', closePhotoLightbox);
  
  // Click outside to close modals
  window.addEventListener('click', (e) => {
    if (e.target === vidModal) closeVideoModal();
    if (e.target === photoModal) closePhotoLightbox();
    if (e.target === adminModal) closeAdminModal();
  });

  // Helper to structure raw YouTube links to embed format with autoplay
  function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      try {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
      } catch (err) {
        console.error("Invalid URL format:", url);
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url; // fallback standard URL
  }

  // ==========================================
  // 8. CONTACT FORM SIMULATION
  // ==========================================
  const contactForm = document.getElementById('portfolio-contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const msg = document.getElementById('form-message').value;
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    
    const sheetUrl = localConfig.contact.googleSheetUrl;
    if (sheetUrl && sheetUrl.startsWith('http')) {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader"></i> Sending...';
        lucide.createIcons();
      }
      
      fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: new Date().toLocaleString(),
          name: name,
          email: email,
          message: msg
        })
      })
      .then(() => {
        alert(`Thank you, ${name}! Your message has been saved to the spreadsheet successfully. Sasi will contact you at ${email} shortly.`);
        contactForm.reset();
      })
      .catch(err => {
        console.error("Form submission failed:", err);
        alert("Oops! There was a network issue saving your message. Please try again or contact directly.");
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="send"></i> Send Message';
          lucide.createIcons();
        }
      });
    } else {
      alert(`Thank you, ${name}! Your message has been sent successfully. Sasi will contact you at ${email} shortly.`);
      contactForm.reset();
    }
  });

  // ==========================================
  // 9. VISUAL ADMIN PANEL CONTROLLER
  // ==========================================
  const adminModal = document.getElementById('admin-settings-modal');
  const triggerAdminBtn = document.getElementById('admin-trigger-btn');
  const closeAdminBtn = document.getElementById('close-admin-modal-btn');
  const cancelAdminBtn = document.getElementById('admin-cancel-btn');
  
  // Working temporary configuration config state
  let tempConfig = {};

  // Open Admin Dashboard
  triggerAdminBtn.addEventListener('click', () => {
    // deep clone current configuration
    tempConfig = JSON.parse(JSON.stringify(localConfig));
    populateAdminForm();
    adminModal.style.display = 'block';
  });

  function closeAdminModal() {
    adminModal.style.display = 'none';
  }

  closeAdminBtn.addEventListener('click', closeAdminModal);
  cancelAdminBtn.addEventListener('click', closeAdminModal);

  // Tab switching logic inside panel
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      e.target.classList.add('active');
      const targetId = e.target.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Populate Admin Inputs from State
  function populateAdminForm() {
    // Profile settings
    document.getElementById('admin-name').value = tempConfig.profile.name;
    document.getElementById('admin-title').value = tempConfig.profile.title;
    document.getElementById('admin-subtitle').value = tempConfig.profile.subtitle;
    document.getElementById('admin-profile-img').value = tempConfig.profile.profileImage;
    document.getElementById('admin-about').value = tempConfig.profile.aboutText;
    document.getElementById('admin-stat-exp').value = tempConfig.profile.experienceYears;
    document.getElementById('admin-stat-projects').value = tempConfig.profile.projectsCompleted;
    document.getElementById('admin-stat-clients').value = tempConfig.profile.happyClients;
    document.getElementById('admin-resume-url').value = tempConfig.profile.resumeUrl || '';
    
    // Skills & Socials
    document.getElementById('admin-skills').value = tempConfig.profile.skills.join(', ');
    document.getElementById('admin-phone').value = tempConfig.contact.phone;
    document.getElementById('admin-email').value = tempConfig.contact.email;
    document.getElementById('admin-location').value = tempConfig.contact.address;
    document.getElementById('admin-google-sheet-url').value = tempConfig.contact.googleSheetUrl || '';
    
    document.getElementById('admin-social-instagram').value = tempConfig.contact.socials.instagram || '';
    document.getElementById('admin-social-whatsapp').value = tempConfig.contact.socials.whatsapp || '';
    document.getElementById('admin-social-behance').value = tempConfig.contact.socials.behance || '';
    document.getElementById('admin-social-twitter').value = tempConfig.contact.socials.twitter || '';
    
    // Render list editor arrays
    renderAdminVideosList();
    renderAdminPhotosList();
    renderAdminCarouselList();
  }

  // Videos List Editor
  function renderAdminVideosList() {
    const list = document.getElementById('admin-videos-list-container');
    list.innerHTML = '';
    
    tempConfig.videos.forEach((vid, index) => {
      const card = document.createElement('div');
      card.className = 'admin-list-item-card';
      card.innerHTML = `
        <div class="admin-list-item-inputs">
          <div class="admin-field-row" style="margin-bottom:8px;">
            <input type="text" class="form-control admin-vid-title" value="${vid.title}" placeholder="Video Title" required>
            <select class="form-control admin-vid-cat" style="padding:10px;">
              <option value="event-videos" ${vid.category === 'event-videos' ? 'selected' : ''}>Event Video</option>
              <option value="event-reels" ${vid.category === 'event-reels' ? 'selected' : ''}>Event Reel</option>
              <option value="shorts" ${vid.category === 'shorts' ? 'selected' : ''}>Short/Reel</option>
            </select>
          </div>
          <div class="admin-field-row" style="margin-bottom:8px;">
            <input type="text" class="form-control admin-vid-url" value="${vid.videoUrl}" placeholder="Video URL (YouTube link)" required>
            <input type="text" class="form-control admin-vid-thumb" value="${vid.thumbnail}" placeholder="Thumbnail Image URL" required>
          </div>
          <input type="text" class="form-control admin-vid-desc" value="${vid.description}" placeholder="Description">
        </div>
        <button type="button" class="btn-delete" data-index="${index}" aria-label="Delete Video">
          <i data-lucide="trash-2"></i>
        </button>
      `;
      
      // Delete Video track event listener
      card.querySelector('.btn-delete').addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        tempConfig.videos.splice(idx, 1);
        renderAdminVideosList();
      });
      
      list.appendChild(card);
    });
    lucide.createIcons();
  }

  document.getElementById('admin-add-video-btn').addEventListener('click', () => {
    tempConfig.videos.push({
      id: 'vid-' + Date.now(),
      title: 'New Video Title',
      description: 'Describe your visual edit details here.',
      category: 'event-videos',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800'
    });
    renderAdminVideosList();
  });

  // Photos List Editor
  function renderAdminPhotosList() {
    const list = document.getElementById('admin-photos-list-container');
    list.innerHTML = '';
    
    tempConfig.photos.forEach((photo, index) => {
      const card = document.createElement('div');
      card.className = 'admin-list-item-card';
      card.innerHTML = `
        <div class="admin-list-item-inputs">
          <div class="admin-field-row" style="margin-bottom:8px;">
            <input type="text" class="form-control admin-photo-title" value="${photo.title}" placeholder="Photo Title" required>
            <select class="form-control admin-photo-cat" style="padding:10px;">
              <option value="portraits" ${photo.category === 'portraits' ? 'selected' : ''}>Portrait</option>
            </select>
          </div>
          <div class="admin-field-row" style="margin-bottom:8px;">
            <input type="text" class="form-control admin-photo-img" value="${photo.imageUrl}" placeholder="Image Link Path" required>
            <input type="text" class="form-control admin-photo-desc" value="${photo.description || ''}" placeholder="Image Captions/Description">
          </div>
        </div>
        <button type="button" class="btn-delete" data-index="${index}" aria-label="Delete Photo">
          <i data-lucide="trash-2"></i>
        </button>
      `;
      
      card.querySelector('.btn-delete').addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        tempConfig.photos.splice(idx, 1);
        renderAdminPhotosList();
      });
      
      list.appendChild(card);
    });
    lucide.createIcons();
  }

  document.getElementById('admin-add-photo-btn').addEventListener('click', () => {
    tempConfig.photos.push({
      id: 'photo-' + Date.now(),
      title: 'New Snapshot',
      category: 'portraits',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
      description: 'Short photograph description details.'
    });
    renderAdminPhotosList();
  });



  // Carousel Slides Admin List Editor
  function renderAdminCarouselList() {
    const list = document.getElementById('admin-carousel-list-container');
    if (!list) return;
    list.innerHTML = '';
    
    const slides = tempConfig.carousel || [];
    
    slides.forEach((slide, index) => {
      const card = document.createElement('div');
      card.className = 'admin-list-item-card';
      card.innerHTML = `
        <div class="admin-list-item-inputs">
          <div class="admin-field-row" style="margin-bottom:8px;">
            <input type="text" class="form-control admin-slide-title" value="${slide.title}" placeholder="Slide Title" required>
            <input type="text" class="form-control admin-slide-sub" value="${slide.subtitle}" placeholder="Slide Subtitle (e.g. DaVinci Resolve)" required>
          </div>
          <div class="form-group">
            <input type="text" class="form-control admin-slide-img" value="${slide.imageUrl}" placeholder="Image Link Path (Unsplash URL)" required>
          </div>
        </div>
        <button type="button" class="btn-delete" data-index="${index}" aria-label="Delete Slide">
          <i data-lucide="trash-2"></i>
        </button>
      `;
      
      card.querySelector('.btn-delete').addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        tempConfig.carousel.splice(idx, 1);
        renderAdminCarouselList();
      });
      
      list.appendChild(card);
    });
    lucide.createIcons();
  }

  document.getElementById('admin-add-slide-btn').addEventListener('click', () => {
    if (!tempConfig.carousel) tempConfig.carousel = [];
    tempConfig.carousel.push({
      id: 'slide-' + Date.now(),
      title: 'New Slide Title',
      subtitle: 'Slide Subtitle / Tool',
      imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1000'
    });
    renderAdminCarouselList();
  });

  // Pull inputs from form array items to update state
  function syncFormToTempConfig() {
    tempConfig.profile.name = document.getElementById('admin-name').value;
    tempConfig.profile.title = document.getElementById('admin-title').value;
    tempConfig.profile.subtitle = document.getElementById('admin-subtitle').value;
    tempConfig.profile.profileImage = document.getElementById('admin-profile-img').value;
    tempConfig.profile.aboutText = document.getElementById('admin-about').value;
    tempConfig.profile.experienceYears = document.getElementById('admin-stat-exp').value;
    tempConfig.profile.projectsCompleted = document.getElementById('admin-stat-projects').value;
    tempConfig.profile.happyClients = document.getElementById('admin-stat-clients').value;
    tempConfig.profile.resumeUrl = document.getElementById('admin-resume-url').value;
    
    // Skills
    const skillsVal = document.getElementById('admin-skills').value;
    tempConfig.profile.skills = skillsVal.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    // Contact Info
    tempConfig.contact.phone = document.getElementById('admin-phone').value;
    tempConfig.contact.email = document.getElementById('admin-email').value;
    tempConfig.contact.address = document.getElementById('admin-location').value;
    tempConfig.contact.googleSheetUrl = document.getElementById('admin-google-sheet-url').value;
    
    tempConfig.contact.socials.instagram = document.getElementById('admin-social-instagram').value;
    tempConfig.contact.socials.whatsapp = document.getElementById('admin-social-whatsapp').value;
    tempConfig.contact.socials.behance = document.getElementById('admin-social-behance').value;
    tempConfig.contact.socials.twitter = document.getElementById('admin-social-twitter').value;
    
    // Pull Video lists inputs
    const videoCards = document.querySelectorAll('#admin-videos-list-container .admin-list-item-card');
    tempConfig.videos = [];
    videoCards.forEach(card => {
      tempConfig.videos.push({
        id: 'vid-' + Math.random(),
        title: card.querySelector('.admin-vid-title').value,
        category: card.querySelector('.admin-vid-cat').value,
        videoUrl: card.querySelector('.admin-vid-url').value,
        thumbnail: card.querySelector('.admin-vid-thumb').value,
        description: card.querySelector('.admin-vid-desc').value
      });
    });

    // Pull Photo lists inputs
    const photoCards = document.querySelectorAll('#admin-photos-list-container .admin-list-item-card');
    tempConfig.photos = [];
    photoCards.forEach(card => {
      tempConfig.photos.push({
        id: 'photo-' + Math.random(),
        title: card.querySelector('.admin-photo-title').value,
        category: card.querySelector('.admin-photo-cat').value,
        imageUrl: card.querySelector('.admin-photo-img').value,
        description: card.querySelector('.admin-photo-desc').value
      });
    });



    // Pull Carousel list inputs
    const slideCards = document.querySelectorAll('#admin-carousel-list-container .admin-list-item-card');
    tempConfig.carousel = [];
    slideCards.forEach(card => {
      tempConfig.carousel.push({
        id: 'slide-' + Math.random(),
        title: card.querySelector('.admin-slide-title').value,
        subtitle: card.querySelector('.admin-slide-sub').value,
        imageUrl: card.querySelector('.admin-slide-img').value
      });
    });
  }

  // Handle Save changes LIVE
  const configForm = document.getElementById('admin-config-form');
  configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    syncFormToTempConfig();
    
    // Save to global localConfig
    localConfig = JSON.parse(JSON.stringify(tempConfig));
    
    // Re-render site sections with updated configurations
    renderProfile();
    renderHeroCarousel();
    
    // Reset video filter to All
    const activeVidFilter = document.querySelector('#video-filter-tabs .filter-btn.active');
    renderVideos(activeVidFilter ? activeVidFilter.getAttribute('data-filter') : 'all');
    
    // Reset photo filter to All
    const activePhotoFilter = document.querySelector('#photo-filter-tabs .filter-btn.active');
    renderPhotos(activePhotoFilter ? activePhotoFilter.getAttribute('data-filter') : 'all');
    

    
    renderSocialLinks();
    closeAdminModal();
    
    alert("Changes saved live! Don't forget to click 'Export config.js' to download your changes, then replace the original config.js file in your folder to save them permanently.");
  });

  // Compile the actual JavaScript structure code string
  function compileConfigString() {
    syncFormToTempConfig();
    return `// PORTFOLIO CONFIGURATION DATA
// This file contains all the content displayed on your website.
// You can edit this directly or use the visual Admin Dashboard on your website to update it!

const portfolioConfig = ${JSON.stringify(tempConfig, null, 2)};
`;
  }

  // Copy configuration code to Clipboard
  document.getElementById('admin-copy-config-btn').addEventListener('click', () => {
    const configStr = compileConfigString();
    
    navigator.clipboard.writeText(configStr)
      .then(() => alert("Configuration code copied to clipboard! You can paste this to overwrite your config.js file."))
      .catch(err => {
        console.error("Clipboard copy failed:", err);
        // Fallback alert with raw textarea if copy permission issues exist
        alert("Could not copy automatically. Export as file instead!");
      });
  });

  // Export to downloadable config.js file
  document.getElementById('admin-export-file-btn').addEventListener('click', () => {
    const configStr = compileConfigString();
    const blob = new Blob([configStr], { type: 'application/javascript;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "config.js");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("config.js has been generated! Check your browser downloads, copy this file, and paste it into your portfolio project folder to overwrite the old one.");
  });

  // Viewport scroll fade-in transitions
  function setupScrollAnimations() {
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
      sec.classList.add('fade-in-section');
    });
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15
    });
    
    sections.forEach(sec => {
      observer.observe(sec);
    });
  }

  // ==========================================
  // 10. RUN TRIGGER
  // ==========================================
  init();

});
