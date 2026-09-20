/**
 * ÉLIXIR ATELIER — COMPREHENSIVE INTERACTIVE APPLICATION ENGINE
 * 
 * Includes:
 * 1. State Management & Persistent LocalStorage Bookings Database
 * 2. Before & After Transformation Slider (Touch + Mouse Draggable)
 * 3. Service Menu Filter Tabs
 * 4. Hair Diagnostic Concierge AI Engine & Recommendation Flow
 * 5. Live Package Customizer & Price/Duration Estimator
 * 6. 4-Step Interactive Booking Wizard with Add-Ons Calculation
 * 7. Calendar Sync (.ICS Blob generator & Google Calendar web link)
 * 8. Lookbook Lightbox Modal with Formula Specs & Direct Booking
 * 9. Client Portal Lookup & Staff Atelier Admin Dashboard (PIN: 1234, CSV Export)
 * 10. Reviews Filter & Testimonial Submission Modal
 * 11. Parisian Atelier Ambient Soundscape (Web Audio API) & UI Haptic Audio
 * 12. Periodic Live Social Proof Reservation Toasts
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. STATE MANAGEMENT & LOCAL STORAGE INITIALIZATION
     ========================================================================== */
  
  const DEFAULT_SAMPLE_BOOKINGS = [
    {
      id: 'ELX-2026-8942',
      clientName: 'Lady Victoria Sterling',
      clientPhone: '+1 (212) 555-0198',
      service: 'Caramel Honey Balayage & Glaze',
      addOns: ['Botanical High-Gloss Glaze'],
      stylist: 'Camille Laurent',
      date: '2026-09-22',
      time: '11:00 AM',
      duration: '180 mins',
      totalPrice: '$285',
      status: 'confirmed',
      notes: 'Prefers oat milk cappuccino. Inspo: French editorial subtle ribbon tones.'
    },
    {
      id: 'ELX-2026-5120',
      clientName: 'Maya Adeleke',
      clientPhone: '+1 (646) 555-7391',
      service: 'Bohemian Goddess Knotless Braids',
      addOns: ['Rosewater Aromatherapy Head Massage'],
      stylist: 'Amara Vance',
      date: '2026-09-23',
      time: '09:30 AM',
      duration: '225 mins',
      totalPrice: '$305',
      status: 'confirmed',
      notes: '24k gold filigree cuffs requested.'
    },
    {
      id: 'ELX-2026-3841',
      clientName: 'Elena Lin',
      clientPhone: '+1 (917) 555-4022',
      service: 'Liquid Glass Silk Press Ritual',
      addOns: ['Split-End Micro Dusting', 'Scalp Detox Micro-Steam Spa'],
      stylist: 'Julian Rey',
      date: '2026-09-24',
      time: '01:15 PM',
      duration: '155 mins',
      totalPrice: '$220',
      status: 'confirmed',
      notes: 'Humidity-resistant diamond gloss finish.'
    }
  ];

  const getStoredBookings = () => {
    try {
      const stored = localStorage.getItem('elixir_atelier_bookings');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }
    return DEFAULT_SAMPLE_BOOKINGS;
  };

  const saveBookings = (bookings) => {
    try {
      localStorage.setItem('elixir_atelier_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.warn('LocalStorage write warning:', e);
    }
  };

  let atelierBookings = getStoredBookings();

  // Active Booking Wizard State
  const bookingState = {
    service: 'Caramel Honey Balayage & Glaze',
    basePrice: 240,
    baseDuration: 160,
    selectedAddOns: [],
    stylist: 'First Available Master',
    date: '',
    time: '09:30 AM',
    clientName: '',
    clientPhone: '',
    clientNotes: '',
    totalInvestment: 240,
    totalDuration: 160,
    currentStep: 1,
    totalSteps: 4,
    generatedRef: ''
  };

  // Set default appointment date to tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split('T')[0];
  const datePicker = document.getElementById('booking-date');
  if (datePicker) {
    datePicker.value = formattedTomorrow;
    datePicker.min = today.toISOString().split('T')[0];
    bookingState.date = formattedTomorrow;
  }

  /* ==========================================================================
     2. BEFORE & AFTER TRANSFORMATION SLIDER (Touch + Mouse Draggable)
     ========================================================================== */
  const baViewport = document.getElementById('ba-viewport');
  const baAfterWrapper = document.getElementById('ba-after-wrapper');
  const baHandle = document.getElementById('ba-handle');

  if (baViewport && baAfterWrapper && baHandle) {
    let isDragging = false;

    const syncInnerImageWidth = () => {
      const containerWidth = baViewport.clientWidth;
      const innerImage = baAfterWrapper.querySelector('.ba-image');
      if (innerImage) {
        innerImage.style.width = `${containerWidth}px`;
        innerImage.style.maxWidth = `${containerWidth}px`;
      }
    };

    const updateSliderPosition = (clientX) => {
      const rect = baViewport.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      let percentage = (offsetX / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage));

      baAfterWrapper.style.width = `${percentage}%`;
      baHandle.style.left = `${percentage}%`;
    };

    baViewport.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSliderPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    baViewport.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches && e.touches[0]) {
        updateSliderPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) {
        updateSliderPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('resize', syncInnerImageWidth);
    syncInnerImageWidth();
    window.addEventListener('load', syncInnerImageWidth);
  }

  /* ==========================================================================
     3. SERVICE MENU CATEGORY FILTERING
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.dataset.category;

      serviceCards.forEach(card => {
        if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
      playUiClickSound();
    });
  });

  /* ==========================================================================
     4. MOBILE OFF-CANVAS DRAWER
     ========================================================================== */
  const mobileMenuOpenBtn = document.getElementById('mobile-menu-open');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const openDrawer = () => {
    mobileDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (mobileMenuOpenBtn) mobileMenuOpenBtn.addEventListener('click', openDrawer);
  if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ==========================================================================
     5. THE ÉLIXIR HAIR DIAGNOSTIC CONCIERGE ENGINE
     ========================================================================== */
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizPanes = [
    document.getElementById('quiz-pane-1'),
    document.getElementById('quiz-pane-2'),
    document.getElementById('quiz-pane-3'),
    document.getElementById('quiz-pane-4')
  ];
  const quizResultCard = document.getElementById('quiz-result-card');
  const quizPrevBtn = document.getElementById('quiz-prev-btn');
  const quizNextBtn = document.getElementById('quiz-next-btn');
  const quizNavFooter = document.getElementById('quiz-nav-footer');

  const quizState = {
    step: 1,
    texture: 'straight-wavy',
    condition: 'colored',
    goal: 'balayage',
    maintenance: 'medium'
  };

  // Option selection inside quiz
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.addEventListener('click', () => {
      const name = option.dataset.name;
      const value = option.dataset.value;
      quizState[name] = value;

      const siblingOptions = option.parentElement.querySelectorAll('.quiz-option');
      siblingOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      playUiClickSound();
    });
  });

  const showQuizStep = (step) => {
    quizState.step = step;

    quizSteps.forEach((s, idx) => {
      if (idx + 1 === step) s.classList.add('active');
      else s.classList.remove('active');
    });

    quizPanes.forEach((pane, idx) => {
      if (idx + 1 === step) pane.classList.add('active');
      else pane.classList.remove('active');
    });

    quizResultCard.style.display = 'none';
    quizNavFooter.style.display = 'flex';

    if (step === 1) {
      quizPrevBtn.style.visibility = 'hidden';
      quizNextBtn.innerHTML = `<span>Next Question</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    } else if (step > 1 && step < 4) {
      quizPrevBtn.style.visibility = 'visible';
      quizNextBtn.innerHTML = `<span>Next Question</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    } else if (step === 4) {
      quizPrevBtn.style.visibility = 'visible';
      quizNextBtn.innerHTML = `<span>Generate Atelier Prescription</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    }
  };

  if (quizPrevBtn) {
    quizPrevBtn.addEventListener('click', () => {
      if (quizState.step > 1) {
        showQuizStep(quizState.step - 1);
      }
    });
  }

  const generatePrescription = () => {
    let regimenTitle = 'Caramel Honey Balayage & Glaze';
    let regimenDesc = 'French free-hand dimensional painting paired with gloss glaze, botanical scalp wash, and runway blowout.';
    let stylistName = 'Camille Laurent';
    let stylistTitle = 'Creative Color Director';
    let addonName = 'Botanical Gloss Glaze';
    let duration = '160 Minutes';
    let price = '$240';
    let targetService = 'Caramel Honey Balayage & Glaze';

    if (quizState.goal === 'silkpress' || quizState.texture === 'coily' && quizState.goal !== 'braids') {
      regimenTitle = 'Liquid Glass Silk Press Ritual & Bond Therapy';
      regimenDesc = 'High-shine botanical steam hydration, diamond thermal shield, split-end micro dusting, and precision silk press.';
      stylistName = 'Julian Rey';
      stylistTitle = 'Lead Hair Architect';
      addonName = 'Scalp Detox Micro-Steam Spa';
      duration = '140 Minutes';
      price = '$185';
      targetService = 'Liquid Glass Silk Press Ritual';
    } else if (quizState.goal === 'braids' || quizState.texture === 'coily') {
      regimenTitle = 'Bohemian Goddess Knotless Braids';
      regimenDesc = 'Zero-tension parting with 100% human hair curls, rosewater soothing scalp spritz, and 24k gold filigree cuffs.';
      stylistName = 'Amara Vance';
      stylistTitle = 'Texture & Protective Artist';
      addonName = 'Rosewater Aromatherapy Head Massage';
      duration = '225 Minutes';
      price = '$305';
      targetService = 'Bohemian Goddess Knotless Braids';
    } else if (quizState.goal === 'cut-repair' || quizState.condition === 'damaged') {
      regimenTitle = 'Architectural Haircut + K18 Molecular Bond Revival';
      regimenDesc = 'Face-framing silhouette sculpting matched with deep molecular polypeptide repair and voluminous blowout.';
      stylistName = 'Julian Rey';
      stylistTitle = 'Lead Hair Architect';
      addonName = 'Olaplex No.1/No.2 Molecular Bond Shield';
      duration = '165 Minutes';
      price = '$205';
      targetService = 'Architectural Precision Haircut';
    }

    document.getElementById('result-regimen-title').textContent = regimenTitle;
    document.getElementById('result-regimen-desc').textContent = regimenDesc;
    document.getElementById('result-stylist-name').textContent = stylistName;
    document.getElementById('result-stylist-title').textContent = stylistTitle;
    document.getElementById('result-addon-name').textContent = addonName;
    document.getElementById('result-duration').textContent = duration;
    document.getElementById('result-price').textContent = price;

    quizPanes.forEach(pane => pane.classList.remove('active'));
    quizNavFooter.style.display = 'none';
    quizResultCard.style.display = 'block';

    const bookPrescriptionBtn = document.getElementById('book-quiz-prescription-btn');
    if (bookPrescriptionBtn) {
      bookPrescriptionBtn.onclick = () => {
        openModal({
          service: targetService,
          price: price,
          stylist: stylistName,
          duration: duration
        });
      };
    }
  };

  if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
      if (quizState.step < 4) {
        showQuizStep(quizState.step + 1);
      } else {
        generatePrescription();
      }
      playUiClickSound();
    });
  }

  const retakeQuizBtn = document.getElementById('retake-quiz-btn');
  if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener('click', () => {
      showQuizStep(1);
    });
  }

  /* ==========================================================================
     6. BESPOKE PACKAGE CUSTOMIZER & LIVE ESTIMATOR
     ========================================================================== */
  const customizerBaseSelect = document.getElementById('customizer-base-select');
  const customizerAddons = document.querySelectorAll('.customizer-addon');
  const calcBaseName = document.getElementById('calc-base-name');
  const calcBasePrice = document.getElementById('calc-base-price');
  const calcAddonsContainer = document.getElementById('calc-addons-container');
  const calcTotalTime = document.getElementById('calc-total-time');
  const calcTotalPrice = document.getElementById('calc-total-price');
  const customizerBookNowBtn = document.getElementById('customizer-book-now-btn');

  const updateCustomizerCalculation = () => {
    if (!customizerBaseSelect) return;

    const selectedOption = customizerBaseSelect.options[customizerBaseSelect.selectedIndex];
    const baseName = selectedOption.dataset.name;
    const basePrice = parseInt(selectedOption.dataset.price, 10);
    const baseTime = parseInt(selectedOption.dataset.time, 10);

    let totalPrice = basePrice;
    let totalTime = baseTime;
    let selectedAddonList = [];

    calcBaseName.textContent = baseName;
    calcBasePrice.textContent = `$${basePrice}`;

    if (calcAddonsContainer) calcAddonsContainer.innerHTML = '';

    customizerAddons.forEach(addon => {
      if (addon.checked) {
        const addonName = addon.dataset.name;
        const addonPrice = parseInt(addon.dataset.price, 10);
        const addonTime = parseInt(addon.dataset.time, 10);

        totalPrice += addonPrice;
        totalTime += addonTime;
        selectedAddonList.push({ name: addonName, price: addonPrice, time: addonTime });

        if (calcAddonsContainer) {
          const row = document.createElement('div');
          row.className = 'calc-row';
          row.innerHTML = `<span>+ ${addonName}</span> <span class="calc-val">$${addonPrice}</span>`;
          calcAddonsContainer.appendChild(row);
        }
      }
    });

    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;
    const durationString = hours > 0 ? `${totalTime} mins (${hours}h ${minutes > 0 ? minutes + 'm' : ''})` : `${totalTime} mins`;

    calcTotalTime.textContent = durationString;
    calcTotalPrice.textContent = `$${totalPrice}`;

    if (customizerBookNowBtn) {
      customizerBookNowBtn.onclick = () => {
        openModal({
          service: baseName,
          price: `$${totalPrice}`,
          duration: `${totalTime} mins`,
          addOns: selectedAddonList
        });
      };
    }
  };

  if (customizerBaseSelect) {
    customizerBaseSelect.addEventListener('change', updateCustomizerCalculation);
  }
  customizerAddons.forEach(addon => {
    addon.addEventListener('change', () => {
      updateCustomizerCalculation();
      playUiClickSound();
    });
  });
  updateCustomizerCalculation();

  /* ==========================================================================
     7. 4-STEP INTERACTIVE BOOKING WIZARD MODAL
     ========================================================================== */
  const modalBackdrop = document.getElementById('booking-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const openBookingBtns = document.querySelectorAll('.open-booking-btn');

  const wizardPrevBtn = document.getElementById('wizard-prev-btn');
  const wizardNextBtn = document.getElementById('wizard-next-btn');
  const modalFooterNav = document.getElementById('modal-footer-nav');

  const stepNodes = [
    document.getElementById('node-1'),
    document.getElementById('node-2'),
    document.getElementById('node-3'),
    document.getElementById('node-4')
  ];

  const stepContents = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4'),
    document.getElementById('step-success')
  ];

  const wizardAddonChecks = document.querySelectorAll('.wizard-addon-check');

  const syncWizardPriceAndDuration = () => {
    let totalP = bookingState.basePrice;
    let totalD = bookingState.baseDuration;
    bookingState.selectedAddOns = [];

    wizardAddonChecks.forEach(chk => {
      if (chk.checked) {
        const p = parseInt(chk.dataset.price, 10);
        const t = parseInt(chk.dataset.time, 10);
        totalP += p;
        totalD += t;
        bookingState.selectedAddOns.push(chk.dataset.name);
      }
    });

    bookingState.totalInvestment = totalP;
    bookingState.totalDuration = totalD;
  };

  wizardAddonChecks.forEach(chk => {
    chk.addEventListener('change', () => {
      syncWizardPriceAndDuration();
      playUiClickSound();
    });
  });

  const openModal = (initialData = {}) => {
    if (initialData.service) {
      bookingState.service = initialData.service;
      highlightSelectedService(initialData.service);
    }
    if (initialData.stylist) {
      bookingState.stylist = initialData.stylist;
      highlightSelectedStylist(initialData.stylist);
    }
    if (initialData.addOns && Array.isArray(initialData.addOns)) {
      wizardAddonChecks.forEach(chk => {
        const isSelected = initialData.addOns.some(a => (typeof a === 'string' ? a : a.name).includes(chk.dataset.name));
        chk.checked = isSelected;
      });
    }

    syncWizardPriceAndDuration();
    goToStep(1);
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeDrawer();
  };

  const closeModal = () => {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  openBookingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const service = btn.dataset.service;
      const price = btn.dataset.price;
      const stylist = btn.dataset.stylist;
      const duration = btn.dataset.duration;
      openModal({ service, price, stylist, duration });
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  const goToStep = (stepNumber) => {
    bookingState.currentStep = stepNumber;

    stepContents.forEach((content, index) => {
      if (content) {
        if (index + 1 === stepNumber) content.classList.add('active');
        else content.classList.remove('active');
      }
    });

    stepNodes.forEach((node, index) => {
      if (node) {
        node.classList.remove('active', 'completed');
        if (index + 1 === stepNumber) node.classList.add('active');
        else if (index + 1 < stepNumber) node.classList.add('completed');
      }
    });

    if (stepNumber === 1) {
      wizardPrevBtn.style.visibility = 'hidden';
      wizardNextBtn.innerHTML = `<span>Select Stylist</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      modalFooterNav.style.display = 'flex';
    } else if (stepNumber === 2) {
      wizardPrevBtn.style.visibility = 'visible';
      wizardNextBtn.innerHTML = `<span>Select Date & Time</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      modalFooterNav.style.display = 'flex';
    } else if (stepNumber === 3) {
      wizardPrevBtn.style.visibility = 'visible';
      wizardNextBtn.innerHTML = `<span>Review & Details</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      modalFooterNav.style.display = 'flex';
    } else if (stepNumber === 4) {
      wizardPrevBtn.style.visibility = 'visible';
      wizardNextBtn.innerHTML = `<span>Confirm Reservation</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      modalFooterNav.style.display = 'flex';
      updateSummaryCard();
    } else if (stepNumber === 5) {
      modalFooterNav.style.display = 'none';
    }
  };

  // Step 1: Select Service Item
  const servicePickItems = document.querySelectorAll('.service-pick-item');
  const highlightSelectedService = (serviceName) => {
    servicePickItems.forEach(item => {
      if (item.dataset.service.trim().toLowerCase() === serviceName.trim().toLowerCase()) {
        item.classList.add('selected');
        bookingState.service = item.dataset.service;
        bookingState.basePrice = parseInt(item.dataset.price.replace('$', ''), 10);
        bookingState.baseDuration = parseInt(item.dataset.duration.replace(' mins', ''), 10);
      } else {
        item.classList.remove('selected');
      }
    });
    syncWizardPriceAndDuration();
  };

  servicePickItems.forEach(item => {
    item.addEventListener('click', () => {
      servicePickItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      bookingState.service = item.dataset.service;
      bookingState.basePrice = parseInt(item.dataset.price.replace('$', ''), 10);
      bookingState.baseDuration = parseInt(item.dataset.duration.replace(' mins', ''), 10);
      syncWizardPriceAndDuration();
      playUiClickSound();
    });
  });

  // Step 2: Select Stylist Card
  const stylistPickCards = document.querySelectorAll('.stylist-pick-card');
  const highlightSelectedStylist = (stylistName) => {
    stylistPickCards.forEach(card => {
      if (card.dataset.stylist.trim().toLowerCase() === stylistName.trim().toLowerCase()) {
        card.classList.add('selected');
        bookingState.stylist = card.dataset.stylist;
      } else {
        card.classList.remove('selected');
      }
    });
  };

  stylistPickCards.forEach(card => {
    card.addEventListener('click', () => {
      stylistPickCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      bookingState.stylist = card.dataset.stylist;
      playUiClickSound();
    });
  });

  // Step 3: Date & Time Picker
  if (datePicker) {
    datePicker.addEventListener('change', (e) => {
      bookingState.date = e.target.value;
    });
  }

  const timeSlotBtns = document.querySelectorAll('.time-slot-btn');
  timeSlotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeSlotBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      bookingState.time = btn.dataset.time;
      playUiClickSound();
    });
  });

  // Step 4: Summary Card Update
  const updateSummaryCard = () => {
    const summaryService = document.getElementById('summary-service');
    const summaryAddonsRow = document.getElementById('summary-addons-row');
    const summaryAddonsVal = document.getElementById('summary-addons-val');
    const summaryStylist = document.getElementById('summary-stylist');
    const summaryDateTime = document.getElementById('summary-datetime');
    const summaryDuration = document.getElementById('summary-duration');
    const summaryPrice = document.getElementById('summary-price');

    if (summaryService) summaryService.textContent = bookingState.service;

    if (summaryAddonsRow && summaryAddonsVal) {
      if (bookingState.selectedAddOns.length > 0) {
        summaryAddonsRow.style.display = 'flex';
        summaryAddonsVal.textContent = bookingState.selectedAddOns.join(', ');
      } else {
        summaryAddonsRow.style.display = 'none';
      }
    }

    if (summaryStylist) summaryStylist.textContent = bookingState.stylist;
    if (summaryDateTime) {
      const dateDisplay = bookingState.date ? bookingState.date : 'Selected Date';
      summaryDateTime.textContent = `${dateDisplay} at ${bookingState.time}`;
    }
    if (summaryDuration) summaryDuration.textContent = `${bookingState.totalDuration} mins`;
    if (summaryPrice) summaryPrice.textContent = `$${bookingState.totalInvestment}`;
  };

  // Wizard Navigation Clicks
  wizardPrevBtn.addEventListener('click', () => {
    if (bookingState.currentStep > 1) {
      goToStep(bookingState.currentStep - 1);
      playUiClickSound();
    }
  });

  wizardNextBtn.addEventListener('click', () => {
    if (bookingState.currentStep === 1) {
      goToStep(2);
    } else if (bookingState.currentStep === 2) {
      goToStep(3);
    } else if (bookingState.currentStep === 3) {
      if (!bookingState.date) {
        alert('Please pick your appointment date.');
        return;
      }
      goToStep(4);
    } else if (bookingState.currentStep === 4) {
      // Validate inputs
      const clientNameInput = document.getElementById('client-name');
      const clientPhoneInput = document.getElementById('client-phone');
      const clientNotesInput = document.getElementById('client-notes');

      if (!clientNameInput.value.trim()) {
        alert('Please enter your full name.');
        clientNameInput.focus();
        return;
      }

      if (!clientPhoneInput.value.trim()) {
        alert('Please enter your phone number.');
        clientPhoneInput.focus();
        return;
      }

      bookingState.clientName = clientNameInput.value.trim();
      bookingState.clientPhone = clientPhoneInput.value.trim();
      bookingState.clientNotes = clientNotesInput ? clientNotesInput.value.trim() : '';

      // Generate Luxury Reference Number
      const randomRef = 'ELX-2026-' + Math.floor(1000 + Math.random() * 9000);
      bookingState.generatedRef = randomRef;
      const refBadge = document.getElementById('confirmed-ref-badge');
      if (refBadge) refBadge.textContent = `#${randomRef}`;

      // Save to database
      const newBookingRecord = {
        id: randomRef,
        clientName: bookingState.clientName,
        clientPhone: bookingState.clientPhone,
        service: bookingState.service,
        addOns: [...bookingState.selectedAddOns],
        stylist: bookingState.stylist,
        date: bookingState.date,
        time: bookingState.time,
        duration: `${bookingState.totalDuration} mins`,
        totalPrice: `$${bookingState.totalInvestment}`,
        status: 'confirmed',
        notes: bookingState.clientNotes || 'Online Concierge Booking'
      };

      atelierBookings.unshift(newBookingRecord);
      saveBookings(atelierBookings);
      renderAdminTable();

      // Build WhatsApp Dispatch Link
      const messageText = `✨ *ÉLIXIR ATELIER RESERVATION REQUEST* ✨\n\n` +
        `• *Ref ID*: #${randomRef}\n` +
        `• *Client*: ${bookingState.clientName}\n` +
        `• *Phone*: ${bookingState.clientPhone}\n` +
        `• *Experience*: ${bookingState.service}\n` +
        (bookingState.selectedAddOns.length > 0 ? `• *Add-Ons*: ${bookingState.selectedAddOns.join(', ')}\n` : '') +
        `• *Stylist*: ${bookingState.stylist}\n` +
        `• *Date & Time*: ${bookingState.date} at ${bookingState.time}\n` +
        `• *Estimated Total*: $${bookingState.totalInvestment}\n` +
        (bookingState.clientNotes ? `• *Notes*: ${bookingState.clientNotes}\n\n` : `\n`) +
        `Please confirm my atelier booking reservation. Thank you!`;

      const whatsappLink = document.getElementById('whatsapp-dispatch-link');
      if (whatsappLink) {
        whatsappLink.href = `https://wa.me/12125550198?text=${encodeURIComponent(messageText)}`;
      }

      // Configure Google Calendar Link
      setupGoogleCalendarLink(newBookingRecord);

      // Configure .ICS Download button
      const downloadIcsBtn = document.getElementById('download-ics-btn');
      if (downloadIcsBtn) {
        downloadIcsBtn.onclick = () => downloadIcsFile(newBookingRecord);
      }

      goToStep(5);
    }
    playUiClickSound();
  });

  const finishBookingBtn = document.getElementById('finish-booking-btn');
  if (finishBookingBtn) {
    finishBookingBtn.addEventListener('click', closeModal);
  }

  /* ==========================================================================
     8. CALENDAR INTEGRATIONS (Google Calendar & .ICS Blob Exporter)
     ========================================================================== */
  
  function formatIsoForCalendar(dateStr, timeStr) {
    // Converts "2026-09-22" and "11:00 AM" to "20260922T110000"
    const [year, month, day] = dateStr.split('-');
    let [timePart, meridiem] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours, 10);
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const pad = (n) => String(n).padStart(2, '0');
    const startIso = `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;
    
    // Add 2 hours default
    let endHours = hours + 2;
    let endDay = day;
    if (endHours >= 24) {
      endHours -= 24;
      endDay = pad(parseInt(day, 10) + 1);
    }
    const endIso = `${year}${month}${endDay}T${pad(endHours)}${pad(minutes)}00`;

    return { startIso, endIso };
  }

  function setupGoogleCalendarLink(booking) {
    const googleBtn = document.getElementById('google-calendar-btn');
    if (!googleBtn) return;

    const { startIso, endIso } = formatIsoForCalendar(booking.date, booking.time);
    const title = encodeURIComponent(`Élixir Atelier: ${booking.service} with ${booking.stylist}`);
    const details = encodeURIComponent(`Reservation Ref #${booking.id}\nClient: ${booking.clientName}\nService: ${booking.service}\nStylist: ${booking.stylist}\nInvestment: ${booking.totalPrice}\n\nLocation: Élixir Atelier, 450 Madison Ave, 4th Floor, New York, NY 10022`);
    const location = encodeURIComponent('Élixir Atelier, 450 Madison Ave, New York, NY 10022');

    googleBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  }

  function downloadIcsFile(booking) {
    const { startIso, endIso } = formatIsoForCalendar(booking.date, booking.time);
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Elixir Atelier//Luxury Coiffure System//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${booking.id}@elixiratelier.com`,
      `DTSTAMP:${startIso}Z`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:Élixir Atelier Hair Reservation: ${booking.service}`,
      `DESCRIPTION:Reservation Reference: #${booking.id}\\nClient: ${booking.clientName}\\nStylist: ${booking.stylist}\\nInvestment: ${booking.totalPrice}\\n\\nConcierge: +1 (212) 555-0198`,
      'LOCATION:450 Madison Avenue\\, 4th Floor\\, New York\\, NY 10022',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Your Élixir Atelier Hair Appointment is in 2 hours',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Elixir_Atelier_Appointment_${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ==========================================================================
     9. LOOKBOOK LIGHTBOX MODAL WITH FORMULA DETAILS
     ========================================================================== */
  const lookbookModalBackdrop = document.getElementById('lookbook-modal-backdrop');
  const lookbookCloseBtn = document.getElementById('lookbook-close-btn');
  const lookbookCards = document.querySelectorAll('.lookbook-card');

  const lbImg = document.getElementById('lb-modal-img');
  const lbStylist = document.getElementById('lb-modal-stylist');
  const lbTitle = document.getElementById('lb-modal-title');
  const lbFormula = document.getElementById('lb-modal-formula');
  const lbService = document.getElementById('lb-modal-service');
  const lbDuration = document.getElementById('lb-modal-duration');
  const lbPrice = document.getElementById('lb-modal-price');
  const lbMaint = document.getElementById('lb-modal-maint');
  const lbBookBtn = document.getElementById('lb-modal-book-btn');

  lookbookCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.dataset.title;
      const stylist = card.dataset.stylist;
      const service = card.dataset.service;
      const price = card.dataset.price;
      const duration = card.dataset.duration;
      const img = card.dataset.img;
      const formula = card.dataset.formula;
      const maint = card.dataset.maintenance;

      lbImg.src = img;
      lbStylist.textContent = `Master Stylist: ${stylist}`;
      lbTitle.textContent = title;
      lbFormula.textContent = formula;
      lbService.textContent = service;
      lbDuration.textContent = duration;
      lbPrice.textContent = price;
      lbMaint.textContent = maint;

      lbBookBtn.onclick = () => {
        lookbookModalBackdrop.classList.remove('open');
        openModal({ service, price, stylist, duration });
      };

      lookbookModalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      playUiClickSound();
    });
  });

  if (lookbookCloseBtn) {
    lookbookCloseBtn.addEventListener('click', () => {
      lookbookModalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (lookbookModalBackdrop) {
    lookbookModalBackdrop.addEventListener('click', (e) => {
      if (e.target === lookbookModalBackdrop) {
        lookbookModalBackdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================================
     10. CLIENT LOOKUP & STAFF ATELIER ADMIN PORTAL
     ========================================================================== */
  const portalModalBackdrop = document.getElementById('portal-modal-backdrop');
  const portalOpenBtn = document.getElementById('portal-open-btn');
  const mobilePortalLink = document.getElementById('mobile-portal-link');
  const portalCloseBtn = document.getElementById('portal-close-btn');
  const portalTabBtns = document.querySelectorAll('.portal-tab-btn');
  const portalPanes = document.querySelectorAll('.portal-pane');

  const openPortal = (tab = 'client') => {
    portalModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchPortalTab(tab);
    closeDrawer();
  };

  const closePortal = () => {
    portalModalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (portalOpenBtn) portalOpenBtn.addEventListener('click', () => openPortal('client'));
  if (mobilePortalLink) mobilePortalLink.addEventListener('click', () => openPortal('client'));
  if (portalCloseBtn) portalCloseBtn.addEventListener('click', closePortal);
  if (portalModalBackdrop) {
    portalModalBackdrop.addEventListener('click', (e) => {
      if (e.target === portalModalBackdrop) closePortal();
    });
  }

  const switchPortalTab = (tabName) => {
    portalTabBtns.forEach(btn => {
      if (btn.dataset.tab === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    portalPanes.forEach(pane => {
      if (pane.id === `portal-${tabName}-pane`) pane.classList.add('active');
      else pane.classList.remove('active');
    });
  };

  portalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchPortalTab(btn.dataset.tab);
      playUiClickSound();
    });
  });

  // Client Lookup Flow
  const clientLookupForm = document.getElementById('client-lookup-form');
  const lookupQueryInput = document.getElementById('lookup-query');
  const lookupResultContainer = document.getElementById('lookup-result-container');

  if (clientLookupForm) {
    clientLookupForm.addEventListener('submit', () => {
      const q = lookupQueryInput.value.trim().toLowerCase().replace('#', '');
      if (!q) return;

      const found = atelierBookings.find(b => 
        b.id.toLowerCase().includes(q) || 
        b.clientPhone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        b.clientName.toLowerCase().includes(q)
      );

      if (found) {
        lookupResultContainer.innerHTML = `
          <div class="booking-summary-box" style="animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
              <span class="badge-tag">#${found.id}</span>
              <span class="status-badge ${found.status}">${found.status.toUpperCase()}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Client Name:</span>
              <span class="summary-val">${found.clientName}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Experience:</span>
              <span class="summary-val">${found.service}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Master Stylist:</span>
              <span class="summary-val">${found.stylist}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Scheduled Date:</span>
              <span class="summary-val">${found.date} at ${found.time}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Estimated Investment:</span>
              <span class="summary-val gold">${found.totalPrice}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline btn-sm" id="client-download-ics">🍏 Download Calendar Pass (.ICS)</button>
              <a href="https://wa.me/12125550198?text=Hello%20Concierge,%20I%20would%20like%20to%20reschedule%20reservation%20%23${found.id}" target="_blank" class="btn btn-primary btn-sm">Reschedule via Concierge</a>
            </div>
          </div>
        `;
        document.getElementById('client-download-ics').onclick = () => downloadIcsFile(found);
      } else {
        lookupResultContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <p>No active atelier reservation found for "<strong>${lookupQueryInput.value}</strong>".</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">Please check your Reference ID or contact our concierge at +1 (212) 555-0198.</p>
          </div>
        `;
      }
    });
  }

  // Staff Admin Flow (PIN Protected: 1234)
  const adminPinForm = document.getElementById('admin-pin-form');
  const adminPinInput = document.getElementById('admin-pin-input');
  const adminPinGate = document.getElementById('admin-pin-gate');
  const adminDashboardView = document.getElementById('admin-dashboard-view');
  const adminTableBody = document.getElementById('admin-table-body');
  const adminTotalCount = document.getElementById('admin-total-count');
  const adminRevenueEst = document.getElementById('admin-revenue-est');
  const adminStylistFilter = document.getElementById('admin-stylist-filter');
  const adminSearchInput = document.getElementById('admin-search-input');
  const adminExportCsvBtn = document.getElementById('admin-export-csv-btn');
  const adminAddWalkinBtn = document.getElementById('admin-add-walkin-btn');

  if (adminPinForm) {
    adminPinForm.addEventListener('submit', () => {
      if (adminPinInput.value.trim() === '1234') {
        adminPinGate.style.display = 'none';
        adminDashboardView.style.display = 'block';
        renderAdminTable();
      } else {
        alert('Invalid Staff PIN. Please try again.');
        adminPinInput.value = '';
        adminPinInput.focus();
      }
    });
  }

  const renderAdminTable = () => {
    if (!adminTableBody) return;

    const filterStylist = adminStylistFilter ? adminStylistFilter.value : 'all';
    const query = adminSearchInput ? adminSearchInput.value.trim().toLowerCase() : '';

    const filtered = atelierBookings.filter(b => {
      const matchStylist = filterStylist === 'all' || b.stylist === filterStylist;
      const matchQuery = !query || b.clientName.toLowerCase().includes(query) || b.id.toLowerCase().includes(query);
      return matchStylist && matchQuery;
    });

    adminTableBody.innerHTML = '';

    let revenue = 0;
    atelierBookings.forEach(b => {
      const num = parseInt(b.totalPrice.replace('$', ''), 10) || 0;
      revenue += num;
    });

    if (adminTotalCount) adminTotalCount.textContent = atelierBookings.length;
    if (adminRevenueEst) adminRevenueEst.textContent = `$${revenue}`;

    if (filtered.length === 0) {
      adminTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No matching bookings found.</td></tr>`;
      return;
    }

    filtered.forEach((b, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: var(--gold-300);">#${b.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${b.clientName}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${b.clientPhone}</div>
        </td>
        <td>
          <div>${b.service}</div>
          <div style="font-size: 0.72rem; color: var(--gold-400);">Artisan: ${b.stylist}</div>
        </td>
        <td>
          <div>${b.date}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${b.time} (${b.duration})</div>
        </td>
        <td>
          <span class="status-badge ${b.status}" style="cursor: pointer;" title="Click to cycle status" data-index="${index}">
            ${b.status}
          </span>
        </td>
        <td>
          <button type="button" class="btn btn-outline btn-sm delete-booking-btn" data-id="${b.id}" style="padding: 0.2rem 0.6rem; font-size: 0.72rem; color: #ff6b81;">
            ✕
          </button>
        </td>
      `;
      adminTableBody.appendChild(tr);
    });

    // Cycle status on click
    document.querySelectorAll('.status-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        const id = e.target.closest('tr').querySelector('strong').textContent.replace('#', '');
        const item = atelierBookings.find(x => x.id === id);
        if (item) {
          if (item.status === 'confirmed') item.status = 'completed';
          else if (item.status === 'completed') item.status = 'cancelled';
          else item.status = 'confirmed';
          saveBookings(atelierBookings);
          renderAdminTable();
        }
      });
    });

    // Delete handler
    document.querySelectorAll('.delete-booking-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm(`Remove reservation #${id}?`)) {
          atelierBookings = atelierBookings.filter(x => x.id !== id);
          saveBookings(atelierBookings);
          renderAdminTable();
        }
      });
    });
  };

  if (adminStylistFilter) adminStylistFilter.addEventListener('change', renderAdminTable);
  if (adminSearchInput) adminSearchInput.addEventListener('input', renderAdminTable);

  if (adminAddWalkinBtn) {
    adminAddWalkinBtn.addEventListener('click', () => {
      const walkinName = prompt('Enter Walk-In Client Full Name:');
      if (!walkinName) return;

      const randomRef = 'ELX-2026-' + Math.floor(1000 + Math.random() * 9000);
      atelierBookings.unshift({
        id: randomRef,
        clientName: walkinName,
        clientPhone: '+1 (212) Atelier Walk-In',
        service: 'Architectural Precision Haircut',
        addOns: ['Botanical High-Gloss Glaze'],
        stylist: 'First Available Master',
        date: formattedTomorrow,
        time: '02:00 PM',
        duration: '90 mins',
        totalPrice: '$155',
        status: 'confirmed',
        notes: 'Walk-In client registered by concierge.'
      });
      saveBookings(atelierBookings);
      renderAdminTable();
    });
  }

  // Export CSV
  if (adminExportCsvBtn) {
    adminExportCsvBtn.addEventListener('click', () => {
      let csv = 'Reference,Client Name,Phone,Service,Stylist,Date,Time,Duration,Total Price,Status,Notes\n';
      atelierBookings.forEach(b => {
        csv += `"${b.id}","${b.clientName}","${b.clientPhone}","${b.service}","${b.stylist}","${b.date}","${b.time}","${b.duration}","${b.totalPrice}","${b.status}","${b.notes.replace(/"/g, '""')}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Elixir_Atelier_Reservations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  /* ==========================================================================
     11. REVIEWS FILTERING & SUBMISSION MODAL
     ========================================================================== */
  const reviewPillBtns = document.querySelectorAll('.review-pill-btn');
  const reviewCards = document.querySelectorAll('.review-card');
  const reviewsContainer = document.getElementById('reviews-container');

  reviewPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      reviewPillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.reviewFilter;
      reviewCards.forEach(card => {
        if (filter === 'all' || card.dataset.reviewCategory === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
      playUiClickSound();
    });
  });

  const writeReviewOpenBtn = document.getElementById('write-review-open-btn');
  const reviewModalBackdrop = document.getElementById('review-modal-backdrop');
  const reviewModalCloseBtn = document.getElementById('review-modal-close-btn');
  const submitReviewForm = document.getElementById('submit-review-form');
  const starItems = document.querySelectorAll('.star-item');

  let selectedStarRating = 5;

  starItems.forEach(star => {
    star.addEventListener('click', () => {
      selectedStarRating = parseInt(star.dataset.stars, 10);
      starItems.forEach(s => {
        if (parseInt(s.dataset.stars, 10) <= selectedStarRating) s.classList.add('active');
        else s.classList.remove('active');
      });
    });
  });

  if (writeReviewOpenBtn) {
    writeReviewOpenBtn.addEventListener('click', () => {
      reviewModalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (reviewModalCloseBtn) {
    reviewModalCloseBtn.addEventListener('click', () => {
      reviewModalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (submitReviewForm) {
    submitReviewForm.addEventListener('submit', () => {
      const author = document.getElementById('rev-author').value.trim();
      const serviceSelect = document.getElementById('rev-service-select');
      const serviceCategory = serviceSelect.value;
      const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
      const text = document.getElementById('rev-text').value.trim();

      const initials = author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CL';
      const starStr = '★'.repeat(selectedStarRating);

      const newCard = document.createElement('div');
      newCard.className = 'review-card';
      newCard.dataset.reviewCategory = serviceCategory;
      newCard.innerHTML = `
        <div class="stars">${starStr}</div>
        <p class="review-quote">"${text}"</p>
        <div class="reviewer-meta">
          <div class="reviewer-avatar">${initials}</div>
          <div class="reviewer-info">
            <h5>${author}</h5>
            <span>Verified Client • ${serviceName}</span>
          </div>
        </div>
      `;

      if (reviewsContainer) {
        reviewsContainer.prepend(newCard);
      }

      alert('Thank you for your feedback! Your verified review has been published.');
      reviewModalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
      submitReviewForm.reset();
    });
  }

  /* ==========================================================================
     12. PARISIAN ATELIER AMBIENT SOUNDSCAPE (Web Audio API Synthesizer)
     ========================================================================== */
  let audioCtx = null;
  let isSoundPlaying = false;
  let synthNodes = [];

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
  }

  function startAmbientSoundscape() {
    initAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Pentatonic calm harmony frequencies (F minor 9th / Parisian Lounge warmth)
    const baseFreqs = [174.61, 220.00, 261.63, 329.63, 392.00];

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 3);

    // Warm Low-pass filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);

    baseFreqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Subtle detune chorus
      osc.detune.setValueAtTime((i - 2) * 4, audioCtx.currentTime);

      oscGain.gain.setValueAtTime(0.3 / baseFreqs.length, audioCtx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      synthNodes.push(osc);
    });

    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);
    synthNodes.push(masterGain);

    isSoundPlaying = true;
    updateSoundscapeButtons(true);
  }

  function stopAmbientSoundscape() {
    if (!audioCtx) return;
    synthNodes.forEach(node => {
      try {
        if (node.gain) {
          node.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
        } else if (node.stop) {
          setTimeout(() => node.stop(), 1000);
        }
      } catch (e) {}
    });
    synthNodes = [];
    isSoundPlaying = false;
    updateSoundscapeButtons(false);
  }

  function toggleSoundscape() {
    if (isSoundPlaying) {
      stopAmbientSoundscape();
    } else {
      startAmbientSoundscape();
    }
  }

  function updateSoundscapeButtons(isPlaying) {
    document.querySelectorAll('.soundscape-toggle-btn').forEach(btn => {
      if (isPlaying) {
        btn.classList.add('playing', 'active');
      } else {
        btn.classList.remove('playing', 'active');
      }
    });
  }

  document.querySelectorAll('.soundscape-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleSoundscape);
  });

  function playUiClickSound() {
    try {
      initAudioContext();
      if (!audioCtx || audioCtx.state === 'suspended') return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {}
  }

  /* ==========================================================================
     13. PERIODIC LIVE SOCIAL PROOF RESERVATION TOASTS
     ========================================================================== */
  const toastContainer = document.getElementById('live-toast-container');
  const sampleSocialToasts = [
    { client: 'Victoria S.', action: 'reserved Caramel Honey Balayage', location: 'Upper East Side', mins: '2m ago' },
    { client: 'Elena L.', action: 'reserved Liquid Glass Silk Press', location: 'SoHo, Manhattan', mins: '4m ago' },
    { client: 'Maya A.', action: 'reserved Bohemian Goddess Braids', location: 'Brooklyn Heights', mins: 'Just now' },
    { client: 'Chloe V.', action: 'booked with Camille Laurent', location: 'Tribeca', mins: '7m ago' },
    { client: 'Genevieve T.', action: 'reserved Precision Cut & Blowout', location: 'Chelsea', mins: '12m ago' }
  ];

  let toastIndex = 0;
  function showLiveToast() {
    if (!toastContainer) return;

    const data = sampleSocialToasts[toastIndex % sampleSocialToasts.length];
    toastIndex++;

    const toast = document.createElement('div');
    toast.className = 'live-toast';
    toast.innerHTML = `
      <div class="toast-avatar">✦</div>
      <div class="toast-content">
        <strong>${data.client} ${data.action}</strong>
        <span>📍 ${data.location} • ${data.mins}</span>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 500);
    }, 4500);
  }

  // Initial toast after 4s, recurring every 18s
  setTimeout(showLiveToast, 4000);
  setInterval(showLiveToast, 18000);

  /* ==========================================================================
     14. NAVBAR ELEVATION ON SCROLL
     ========================================================================== */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.style.background = 'rgba(10, 11, 14, 0.95)';
      header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4)';
    } else {
      header.style.background = 'rgba(10, 11, 14, 0.75)';
      header.style.boxShadow = 'none';
    }
  });

});
