/**
 * Smart Expense Tracker - Main Application Controller
 * Handles State, Navigation, CRUD, Figma Onboarding/PIN/Subscription, and Modals
 */

class SmartExpenseApp {
  constructor() {
    this.STORAGE_KEY = 'smart_expense_tracker_state_v1';
    this.state = this.loadState();
    this.isLoggedIn = false;
    this.currentTab = 'guide';
    this.currentTxType = 'expense';
    this.currentFilterType = 'all';
    this.currentPinInput = '';
    this.isDeviceFrameMode = false;
    this.privacyHidden = false;

    this.init();
  }

  /**
   * Load state from localStorage or initialize with demo data
   */
  loadState() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.profile) {
          if (parsed.profile.name === 'Lucas Scott' || parsed.profile.name === 'NongOm') {
            parsed.profile.name = 'Name';
            parsed.profile.handle = '';
          }
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored state:', e);
      }
    }
    const demo = getDemoInitialState();
    this.saveState(demo);
    return demo;
  }

  saveState(stateToSave = null) {
    if (stateToSave) this.state = stateToSave;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
  }

  /**
   * Initialize App UI and Event Listeners
   */
  init() {
    this.bindEvents();
    this.updateAuthUI();
    this.renderAll();
  }

  updateAuthUI() {
    const loginBtn = document.getElementById('btn-top-login');
    const regBtn = document.getElementById('btn-top-register');
    const quickAddBtn = document.getElementById('btn-quick-add');
    const profileBtn = document.getElementById('btn-top-profile');
    const logoutBtn = document.getElementById('btn-header-logout');

    if (loginBtn) loginBtn.style.display = this.isLoggedIn ? 'none' : 'inline-flex';
    if (regBtn) regBtn.style.display = this.isLoggedIn ? 'none' : 'inline-flex';
    if (quickAddBtn) quickAddBtn.style.display = this.isLoggedIn ? 'inline-flex' : 'none';
    if (profileBtn) profileBtn.style.display = this.isLoggedIn ? 'inline-flex' : 'none';
    if (logoutBtn) logoutBtn.style.display = this.isLoggedIn ? 'inline-flex' : 'none';
  }

  /**
   * Re-render entire view & refresh icons and charts
   */
  renderAll() {
    this.renderUserProfile();
    this.renderDashboard();
    this.renderTransactions();
    this.renderWallets();
    this.renderBudgets();
    this.renderSavingGoals();
    this.renderRecurringAndDebts();
    this.renderCategoryPills(this.currentTxType);
    this.populateWalletSelects();
    this.populateBudgetCategorySelect();

    // Render charts
    if (window.FinanceCharts) {
      FinanceCharts.updateCharts(this.state.transactions, this.state.categories, this.state.profile);
    }

    // Refresh Lucide SVG icons
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  /* ==========================================================================
     EVENT BINDINGS
     ========================================================================== */

  bindEvents() {
    // 1. Navigation Switching (Desktop & Mobile)
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Authentication Modal Triggers
    document.getElementById('btn-top-login')?.addEventListener('click', () => this.openAuthModal('login'));
    document.getElementById('btn-top-register')?.addEventListener('click', () => this.openAuthModal('register'));
    document.getElementById('btn-header-logout')?.addEventListener('click', () => this.openModal('modal-logout-confirm'));
    document.getElementById('btn-guide-start')?.addEventListener('click', () => this.openAuthModal('login'));
    document.getElementById('btn-guide-login')?.addEventListener('click', () => this.openAuthModal('login'));
    document.getElementById('btn-cta-start')?.addEventListener('click', () => this.openAuthModal('login'));
    document.getElementById('btn-close-auth-modal')?.addEventListener('click', () => this.closeAuthModal());

    // Auth Tab Switchers (Sign In / Register)
    document.getElementById('tab-auth-login')?.addEventListener('click', () => this.switchAuthTab('login'));
    document.getElementById('tab-auth-register')?.addEventListener('click', () => this.switchAuthTab('register'));

    // Toggle Password Visibility
    document.getElementById('btn-toggle-login-pw')?.addEventListener('click', () => {
      const pwInput = document.getElementById('login-password');
      if (pwInput) {
        pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
      }
    });

    // 1-Click Quick Demo Login
    document.getElementById('btn-demo-quick-login')?.addEventListener('click', () => {
      this.loginSuccess('NongOm', 'เข้าสู่ระบบด้วยบัญชีตัวอย่างสำเร็จ');
    });

    // Submit Sign In Form
    document.getElementById('form-auth-login')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username')?.value?.trim() || 'NongOm';
      const password = document.getElementById('login-password')?.value?.trim();
      const errorEl = document.getElementById('login-error-msg');

      if (!password) {
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.innerText = 'กรุณากรอกรหัสผ่าน';
        }
        return;
      }

      if (errorEl) errorEl.style.display = 'none';
      this.loginSuccess(username, `ยินดีต้อนรับคุณ ${username} เข้าสู่ระบบ`);
    });

    // Submit Register Form
    document.getElementById('form-auth-register')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name')?.value?.trim() || 'NongOm';
      const username = document.getElementById('reg-username')?.value?.trim();
      const password = document.getElementById('reg-password')?.value?.trim();
      const income = Number(document.getElementById('reg-income')?.value) || 65000;
      const errorEl = document.getElementById('reg-error-msg');

      if (!username || !password) {
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.innerText = 'กรุณากรอกข้อมูลให้ครบถ้วน';
        }
        return;
      }

      this.state.profile.name = name;
      this.state.profile.monthlyIncome = income;
      this.state.profile.onboardingCompleted = true;
      this.saveState();

      if (errorEl) errorEl.style.display = 'none';
      this.loginSuccess(name, `สร้างบัญชีและเข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ ${name} 🎉`);
    });

    // 2. Viewport Device Mode Switcher (Desktop toggle)
    const deviceToggleBtn = document.getElementById('btn-device-toggle');
    if (deviceToggleBtn) {
      deviceToggleBtn.addEventListener('click', () => {
        const wrapper = document.getElementById('viewport-wrapper');
        this.isDeviceFrameMode = !this.isDeviceFrameMode;
        if (this.isDeviceFrameMode) {
          wrapper.classList.add('device-frame-mode');
          this.showToast('สลับไปยังโหมดจำลองจอมือถือ (Mobile Frame)');
        } else {
          wrapper.classList.remove('device-frame-mode');
          this.showToast('สลับไปยังโหมดเต็มจอเดสก์ท็อป (Responsive)');
        }
      });
    }

    // 3. Eye Privacy Toggle
    const eyeToggleBtn = document.getElementById('btn-toggle-balance-privacy');
    if (eyeToggleBtn) {
      eyeToggleBtn.addEventListener('click', () => {
        this.privacyHidden = !this.privacyHidden;
        this.renderDashboard();
        const icon = document.getElementById('icon-balance-eye');
        if (icon) {
          icon.setAttribute('data-lucide', this.privacyHidden ? 'eye-off' : 'eye');
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    // 4. Quick Action Buttons on Dashboard
    document.getElementById('action-btn-income')?.addEventListener('click', () => this.openTransactionModal('income'));
    document.getElementById('action-btn-expense')?.addEventListener('click', () => this.openTransactionModal('expense'));
    document.getElementById('action-btn-transfer')?.addEventListener('click', () => this.openModal('modal-transfer'));
    document.getElementById('action-btn-scan')?.addEventListener('click', () => this.openModal('modal-ocr-scanner'));
    document.getElementById('btn-scan-slip-quick')?.addEventListener('click', () => this.openModal('modal-ocr-scanner'));

    // 5. FAB & Main Add Buttons
    document.getElementById('btn-quick-add')?.addEventListener('click', () => this.openTransactionModal('expense'));
    document.getElementById('btn-mobile-fab')?.addEventListener('click', () => this.openTransactionModal('expense'));
    document.getElementById('btn-add-tx-main')?.addEventListener('click', () => this.openTransactionModal('expense'));

    // 6. Transaction Form & Type Segment Controls
    document.querySelectorAll('.type-seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.type-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-tx-type');
        this.currentTxType = type;
        this.renderCategoryPills(type);

        // Adjust inputs for transfer vs expense/income
        const catGroup = document.getElementById('form-category-group');
        const targetWalletGroup = document.getElementById('form-target-wallet-group');
        const walletLabel = document.getElementById('tx-wallet-label');

        if (type === 'transfer') {
          if (catGroup) catGroup.style.display = 'none';
          if (targetWalletGroup) targetWalletGroup.style.display = 'block';
          if (walletLabel) walletLabel.innerText = 'จากบัญชีต้นทาง';
        } else {
          if (catGroup) catGroup.style.display = 'block';
          if (targetWalletGroup) targetWalletGroup.style.display = 'none';
          if (walletLabel) walletLabel.innerText = 'จากกระเป๋าเงิน';
        }
      });
    });

    // Handle Transaction Form Submit
    const txForm = document.getElementById('form-transaction');
    if (txForm) {
      txForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTransaction();
      });
    }

    // OCR Trigger within Transaction Modal
    document.getElementById('btn-ocr-trigger')?.addEventListener('click', () => {
      this.closeModal('modal-transaction');
      this.openModal('modal-ocr-scanner');
    });

    // Close Modals buttons
    document.getElementById('btn-close-tx-modal')?.addEventListener('click', () => this.closeModal('modal-transaction'));
    document.getElementById('btn-cancel-tx')?.addEventListener('click', () => this.closeModal('modal-transaction'));
    document.getElementById('btn-close-ocr-modal')?.addEventListener('click', () => this.closeModal('modal-ocr-scanner'));
    document.getElementById('btn-cancel-ocr')?.addEventListener('click', () => this.closeModal('modal-ocr-scanner'));
    document.getElementById('btn-close-sub-modal')?.addEventListener('click', () => this.closeModal('modal-subscription'));
    document.getElementById('btn-close-wallet-modal')?.addEventListener('click', () => this.closeModal('modal-wallet'));
    document.getElementById('btn-cancel-wallet')?.addEventListener('click', () => this.closeModal('modal-wallet'));
    document.getElementById('btn-close-transfer-modal')?.addEventListener('click', () => this.closeModal('modal-transfer'));
    document.getElementById('btn-cancel-transfer')?.addEventListener('click', () => this.closeModal('modal-transfer'));
    document.getElementById('btn-close-budget-modal')?.addEventListener('click', () => this.closeModal('modal-budget'));
    document.getElementById('btn-cancel-budget')?.addEventListener('click', () => this.closeModal('modal-budget'));
    document.getElementById('btn-close-saving-modal')?.addEventListener('click', () => this.closeModal('modal-saving-goal'));
    document.getElementById('btn-cancel-saving')?.addEventListener('click', () => this.closeModal('modal-saving-goal'));
    document.getElementById('btn-close-recurring-modal')?.addEventListener('click', () => this.closeModal('modal-recurring'));
    document.getElementById('btn-cancel-recurring')?.addEventListener('click', () => this.closeModal('modal-recurring'));
    document.getElementById('btn-close-debt-modal')?.addEventListener('click', () => this.closeModal('modal-debt'));
    document.getElementById('btn-cancel-debt')?.addEventListener('click', () => this.closeModal('modal-debt'));
    document.getElementById('btn-close-profile-modal')?.addEventListener('click', () => this.closeModal('modal-edit-profile'));
    document.getElementById('btn-cancel-profile')?.addEventListener('click', () => this.closeModal('modal-edit-profile'));
    document.getElementById('btn-close-export-modal')?.addEventListener('click', () => this.closeModal('modal-export'));
    document.getElementById('btn-cancel-logout')?.addEventListener('click', () => this.closeModal('modal-logout-confirm'));

    // Receipt upload inside transaction modal
    const receiptDropzone = document.getElementById('receipt-dropzone');
    const receiptFileInput = document.getElementById('receipt-file-input');
    if (receiptDropzone && receiptFileInput) {
      receiptFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const previewImg = document.getElementById('receipt-preview-img');
            const promptView = document.getElementById('upload-prompt-view');
            const previewView = document.getElementById('upload-preview-view');
            if (previewImg) previewImg.src = event.target.result;
            if (promptView) promptView.style.display = 'none';
            if (previewView) previewView.style.display = 'flex';
          };
          reader.readAsDataURL(file);
        }
      });

      document.getElementById('btn-remove-receipt')?.addEventListener('click', (e) => {
        e.stopPropagation();
        receiptFileInput.value = '';
        const promptView = document.getElementById('upload-prompt-view');
        const previewView = document.getElementById('upload-preview-view');
        if (promptView) promptView.style.display = 'flex';
        if (previewView) previewView.style.display = 'none';
      });
    }

    // 7. Slip OCR Dropzone & Processing
    const ocrDropzone = document.getElementById('ocr-dropzone');
    const ocrFileInput = document.getElementById('ocr-file-input');
    if (ocrDropzone && ocrFileInput) {
      ocrFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          await this.handleSlipOCR(file);
        }
      });
    }

    // 8. Recurring / Debts Segment Tabs
    document.querySelectorAll('.segment-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.segment-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.subview-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const subviewId = btn.getAttribute('data-subview');
        document.getElementById(`subview-${subviewId}`)?.classList.add('active');
      });
    });

    // 9. Wallets Management Modals
    document.getElementById('btn-add-wallet')?.addEventListener('click', () => {
      document.getElementById('wallet-edit-id').value = '';
      document.getElementById('wallet-name').value = '';
      document.getElementById('wallet-balance').value = '';
      this.openModal('modal-wallet');
    });

    document.getElementById('btn-open-transfer-modal')?.addEventListener('click', () => this.openModal('modal-transfer'));

    document.getElementById('form-wallet')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveWallet();
    });

    document.getElementById('form-transfer')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTransfer();
    });

    // 10. Budgets & Goals Modals
    document.getElementById('btn-add-budget')?.addEventListener('click', () => this.openModal('modal-budget'));
    document.getElementById('btn-add-saving-pot')?.addEventListener('click', () => this.openModal('modal-saving-goal'));
    document.getElementById('btn-manage-goals')?.addEventListener('click', () => this.openModal('modal-onboarding'));
    document.getElementById('btn-open-goal-wizard')?.addEventListener('click', () => this.openModal('modal-onboarding'));

    document.getElementById('form-budget')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBudget();
    });

    document.getElementById('form-saving-goal')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSavingGoal();
    });

    // 11. Recurring & Debt Modals
    document.getElementById('btn-add-recurring')?.addEventListener('click', () => this.openModal('modal-recurring'));
    document.getElementById('btn-add-debt')?.addEventListener('click', () => this.openModal('modal-debt'));

    document.getElementById('form-recurring')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveRecurringBill();
    });

    document.getElementById('form-debt')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveDebt();
    });

    // 12. Settings & Profile Actions
    document.getElementById('btn-open-edit-profile')?.addEventListener('click', () => {
      const nameInput = document.getElementById('edit-profile-name');
      if (nameInput) nameInput.value = this.state.profile.name || 'Name';
      this.openModal('modal-edit-profile');
    });

    document.getElementById('form-edit-profile')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('edit-profile-name')?.value || 'Name';
      this.state.profile.name = newName;
      this.state.profile.handle = '';
      this.saveState();
      this.closeModal('modal-edit-profile');
      this.renderAll();
      this.showToast('บันทึกชื่อโปรไฟล์เรียบร้อยแล้ว');
    });

    document.getElementById('btn-open-subscription')?.addEventListener('click', () => this.openModal('modal-subscription'));

    // Figma Subscription Plan Selection
    document.querySelectorAll('.sub-plan-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.sub-plan-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input');
        if (radio) radio.checked = true;
      });
    });

    document.getElementById('btn-confirm-subscribe')?.addEventListener('click', () => {
      this.closeModal('modal-subscription');
      if (window.confetti) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      this.showToast('🎉 อัปเกรดเป็น Pro Plan เรียบร้อยแล้ว (ทดลองใช้ฟรี 7 วัน)');
    });

    // Figma Log out modal trigger
    document.getElementById('btn-figma-logout')?.addEventListener('click', () => this.openModal('modal-logout-confirm'));
    document.getElementById('btn-confirm-logout')?.addEventListener('click', () => {
      this.closeModal('modal-logout-confirm');
      this.isLoggedIn = false;
      this.updateAuthUI();
      this.switchTab('guide');
      this.showToast('ออกจากระบบเรียบร้อยแล้ว');
    });

    // PIN toggle in Settings
    const togglePin = document.getElementById('toggle-pin-security');
    if (togglePin) {
      togglePin.checked = this.state.profile.pinEnabled;
      togglePin.addEventListener('change', (e) => {
        this.state.profile.pinEnabled = e.target.checked;
        this.saveState();
        const desc = document.getElementById('pin-status-desc');
        if (desc) desc.innerText = e.target.checked ? 'เปิดใช้งาน PIN 4 หลัก (รหัส: 1234)' : 'ปิดการล็อก PIN';
        this.showToast(e.target.checked ? 'เปิดระบบล็อก PIN เรียบร้อย' : 'ปิดระบบล็อก PIN แล้ว');
      });
    }

    // Demo Data & Reset Actions
    document.getElementById('btn-load-demo-data')?.addEventListener('click', () => {
      if (confirm('ต้องการโหลดข้อมูลตัวอย่างสำหรับทดสอบระบบใช่หรือไม่?')) {
        this.state = getDemoInitialState();
        this.saveState();
        this.renderAll();
        this.showToast('✨ โหลดชุดข้อมูลตัวอย่างสมจริงเรียบร้อยแล้ว');
      }
    });

    document.getElementById('btn-reset-all-data')?.addEventListener('click', () => {
      if (confirm('คำเตือน: คุณต้องการล้างข้อมูลทั้งหมดและเริ่มต้นใหม่ใช่หรือไม่?')) {
        localStorage.removeItem(this.STORAGE_KEY);
        this.state = getDemoInitialState();
        this.state.transactions = [];
        this.saveState();
        this.renderAll();
        this.showToast('ล้างข้อมูลเรียบร้อยแล้ว');
      }
    });

    // Export Options
    document.getElementById('btn-export-options-tx')?.addEventListener('click', () => this.openModal('modal-export'));
    document.getElementById('menu-export-data')?.addEventListener('click', () => this.openModal('modal-export'));
    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
      FinanceExporter.exportToExcel(this.state.transactions, this.state.categories, this.state.wallets, this.state.profile);
      this.closeModal('modal-export');
      this.showToast('ดาวน์โหลด Excel (.xlsx) สำเร็จ');
    });
    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      FinanceExporter.exportToCSV(this.state.transactions, this.state.categories, this.state.wallets);
      this.closeModal('modal-export');
      this.showToast('ดาวน์โหลด CSV สำเร็จ');
    });
    document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
      FinanceExporter.exportToPDF(this.state.transactions, this.state.categories, this.state.wallets, this.state.profile);
      this.closeModal('modal-export');
      this.showToast('ดาวน์โหลดรายงาน PDF สำเร็จ');
    });

    // Backup & Restore
    document.getElementById('menu-backup-restore')?.addEventListener('click', () => {
      const choice = prompt('พิมพ์ "backup" เพื่อดาวน์โหลดไฟล์สำรอง หรือเลือกไฟล์ JSON เพื่อกู้คืน:');
      if (choice && choice.toLowerCase() === 'backup') {
        FinanceExporter.backupJSON(this.state);
        this.showToast('ดาวน์โหลดไฟล์สำรองข้อมูล JSON สำเร็จ');
      }
    });

    // 13. Search & Filter Transactions
    document.getElementById('tx-search-input')?.addEventListener('input', (e) => {
      this.renderTransactions();
      const clearBtn = document.getElementById('btn-clear-search');
      if (clearBtn) clearBtn.style.display = e.target.value ? 'block' : 'none';
    });

    document.getElementById('btn-clear-search')?.addEventListener('click', () => {
      const searchInput = document.getElementById('tx-search-input');
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    });

    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFilterType = chip.getAttribute('data-filter-type');
        this.renderTransactions();
      });
    });

    document.getElementById('filter-wallet-select')?.addEventListener('change', () => this.renderTransactions());

    // 14. Figma Onboarding Flow Stepper
    this.bindOnboardingSteps();

    // 15. Figma PIN Numpad
    this.bindNumpadEvents();
  }

  /**
   * Bind Figma Onboarding Wizard Steps
   */
  bindOnboardingSteps() {
    const step1Next = document.getElementById('btn-onboarding-step1-next');
    const step2Next = document.getElementById('btn-onboarding-step2-next');
    const step2Prev = document.getElementById('btn-onboarding-step2-prev');
    const step3Prev = document.getElementById('btn-onboarding-step3-prev');
    const step3Finish = document.getElementById('btn-onboarding-finish');
    const stepBar = document.getElementById('onboarding-step-bar');

    step1Next?.addEventListener('click', () => {
      document.getElementById('onboarding-step-1').classList.remove('active');
      document.getElementById('onboarding-step-2').classList.add('active');
      if (stepBar) stepBar.style.width = '65%';
    });

    step2Prev?.addEventListener('click', () => {
      document.getElementById('onboarding-step-2').classList.remove('active');
      document.getElementById('onboarding-step-1').classList.add('active');
      if (stepBar) stepBar.style.width = '25%';
    });

    step2Next?.addEventListener('click', () => {
      const selectedGoal = document.querySelector('input[name="finance_goal"]:checked')?.value || 'rule_50_30_20';
      this.state.profile.activeGoal = selectedGoal;
      document.getElementById('onboarding-step-2').classList.remove('active');
      document.getElementById('onboarding-step-3').classList.add('active');
      if (stepBar) stepBar.style.width = '100%';
    });

    step3Prev?.addEventListener('click', () => {
      document.getElementById('onboarding-step-3').classList.remove('active');
      document.getElementById('onboarding-step-2').classList.add('active');
      if (stepBar) stepBar.style.width = '65%';
    });

    step3Finish?.addEventListener('click', () => {
      const name = document.getElementById('onboard-user-name')?.value || 'Name';
      const income = Number(document.getElementById('onboard-monthly-income')?.value) || 65000;
      const currency = document.getElementById('onboard-currency')?.value || 'THB';

      this.state.profile.name = name;
      this.state.profile.handle = '';
      this.state.profile.monthlyIncome = income;
      this.state.profile.currency = currency;
      this.state.profile.onboardingCompleted = true;
      this.saveState();

      this.closeModal('modal-onboarding');
      this.renderAll();
      if (window.confetti) confetti({ particleCount: 80, spread: 60 });
      this.showToast(`ยินดีต้อนรับคุณ ${name} เข้าสู่ SmartFinance 🎉`);
    });

    // Goal Cards selection state
    document.querySelectorAll('.figma-goal-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.figma-goal-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const input = card.querySelector('input');
        if (input) input.checked = true;
      });
    });
  }

  /**
   * Bind Figma PIN Numpad Click Handlers
   */
  bindNumpadEvents() {
    document.querySelectorAll('.numpad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        if (key === 'clear') {
          this.currentPinInput = this.currentPinInput.slice(0, -1);
        } else if (key && this.currentPinInput.length < 4) {
          this.currentPinInput += key;
        }
        this.updateOtpDisplay();

        // Auto submit if 4 digits
        if (this.currentPinInput.length === 4) {
          this.verifyPin();
        }
      });
    });

    document.getElementById('btn-unlock-pin')?.addEventListener('click', () => this.verifyPin());
  }

  updateOtpDisplay() {
    const boxes = document.querySelectorAll('#otp-boxes .otp-box');
    boxes.forEach((box, idx) => {
      if (idx < this.currentPinInput.length) {
        box.classList.add('filled');
        box.innerText = '•';
      } else {
        box.classList.remove('filled');
        box.innerText = '';
      }
    });
  }

  openAuthModal(mode = 'login') {
    this.switchAuthTab(mode);
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.add('active');
  }

  closeAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) modal.classList.remove('active');
    const loginError = document.getElementById('login-error-msg');
    const regError = document.getElementById('reg-error-msg');
    if (loginError) loginError.style.display = 'none';
    if (regError) regError.style.display = 'none';
  }

  switchAuthTab(mode) {
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const formLogin = document.getElementById('form-auth-login');
    const formRegister = document.getElementById('form-auth-register');

    if (mode === 'login') {
      tabLogin?.classList.add('active');
      tabRegister?.classList.remove('active');
      if (formLogin) { formLogin.style.display = 'block'; formLogin.classList.add('active'); }
      if (formRegister) { formRegister.style.display = 'none'; formRegister.classList.remove('active'); }
    } else {
      tabRegister?.classList.add('active');
      tabLogin?.classList.remove('active');
      if (formRegister) { formRegister.style.display = 'block'; formRegister.classList.add('active'); }
      if (formLogin) { formLogin.style.display = 'none'; formLogin.classList.remove('active'); }
    }
  }

  loginSuccess(userName, message) {
    this.isLoggedIn = true;
    this.closeAuthModal();
    this.updateAuthUI();
    this.switchTab('dashboard');
    if (window.confetti) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
    this.showToast(message || `🎉 เข้าสู่ระบบเรียบร้อยแล้ว ยินดีต้อนรับคุณ ${userName}`);
  }

  /* ==========================================================================
     TAB ROUTING & VIEW CONTROLLERS
     ========================================================================== */

  switchTab(tabId) {
    if (!this.isLoggedIn && tabId !== 'guide') {
      this.openAuthModal('login');
      return;
    }

    this.currentTab = tabId;

    // Update active state in navigation
    document.querySelectorAll('.desktop-nav .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.mobile-bottom-nav .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update Tab View Content
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active', view.id === `tab-${tabId}`);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh charts if entering analytics tab
    if (tabId === 'analytics' && window.FinanceCharts) {
      setTimeout(() => {
        FinanceCharts.updateCharts(this.state.transactions, this.state.categories, this.state.profile);
      }, 50);
    }
  }

  /* ==========================================================================
     RENDERING MODULES
     ========================================================================== */

  renderUserProfile() {
    const { name, handle, avatar, currencySymbol } = this.state.profile;

    document.querySelectorAll('#user-top-name, #user-greeting-name, #settings-name-display, #lock-user-name').forEach(el => {
      if (el) el.innerText = name || 'Name';
    });

    const handleEl = document.getElementById('settings-handle-display');
    if (handleEl) {
      handleEl.style.display = 'none';
    }

    document.querySelectorAll('.currency-symbol').forEach(sym => {
      if (sym) sym.innerText = currencySymbol || '฿';
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderDashboard() {
    let totalBalance = 0;
    this.state.wallets.forEach(w => { totalBalance += Number(w.balance); });

    let monthIncome = 0;
    let monthExpense = 0;
    this.state.transactions.forEach(t => {
      if (t.type === 'income') monthIncome += Number(t.amount);
      if (t.type === 'expense') monthExpense += Number(t.amount);
    });

    const balanceEl = document.getElementById('total-balance-display');
    const incEl = document.getElementById('month-income-display');
    const expEl = document.getElementById('month-expense-display');

    if (balanceEl) {
      balanceEl.innerText = this.privacyHidden ? '฿ ••••••' : `฿ ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (incEl) incEl.innerText = `฿ ${monthIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (expEl) expEl.innerText = `฿ ${monthExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    // Monthly Budget %
    const monthlyBudgetLimit = 40000;
    const budgetPct = Math.min(100, Math.round((monthExpense / monthlyBudgetLimit) * 100));
    const budgetPctEl = document.getElementById('month-budget-pct');
    const budgetBarEl = document.getElementById('month-budget-bar');
    if (budgetPctEl) budgetPctEl.innerText = `${budgetPct}%`;
    if (budgetBarEl) budgetBarEl.style.width = `${budgetPct}%`;

    // Render Mini Wallets List Carousel
    const miniWalletsContainer = document.getElementById('wallets-mini-list');
    if (miniWalletsContainer) {
      miniWalletsContainer.innerHTML = this.state.wallets.map(w => `
        <div class="wallet-mini-card" style="--wallet-theme: ${w.color || '#16a34a'};" data-tab="wallets">
          <div class="mini-card-head">
            <div class="mini-card-icon" style="background: ${w.color || '#16a34a'};">
              <i data-lucide="${w.icon || 'landmark'}"></i>
            </div>
            <span class="mini-card-name">${w.name}</span>
          </div>
          <div class="mini-card-balance">฿ ${Number(w.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      `).join('');
    }

    const walletCountEl = document.getElementById('wallet-count');
    if (walletCountEl) walletCountEl.innerText = this.state.wallets.length;

    // Render Recent Transactions (Top 5)
    const recentListContainer = document.getElementById('dashboard-recent-list');
    if (recentListContainer) {
      const top5 = this.state.transactions.slice(0, 5);
      if (top5.length === 0) {
        recentListContainer.innerHTML = `<div class="text-center py-6 text-muted">ยังไม่มีรายการบันทึก แตะ + เพื่อเริ่มบันทึกรายการแรก</div>`;
      } else {
        recentListContainer.innerHTML = top5.map(t => this.createTransactionCardHTML(t)).join('');
      }
    }
  }

  renderTransactions() {
    const listContainer = document.getElementById('full-transactions-list');
    if (!listContainer) return;

    const searchTerm = document.getElementById('tx-search-input')?.value.toLowerCase().trim() || '';
    const walletFilter = document.getElementById('filter-wallet-select')?.value || 'all';

    let filtered = this.state.transactions.filter(t => {
      // Filter Type
      if (this.currentFilterType !== 'all' && t.type !== this.currentFilterType) return false;
      // Filter Wallet
      if (walletFilter !== 'all' && t.walletId !== walletFilter) return false;
      // Search Term
      if (searchTerm) {
        const cat = this.getCategory(t.categoryId, t.type);
        const matchNote = (t.note || '').toLowerCase().includes(searchTerm);
        const matchCat = cat.name.toLowerCase().includes(searchTerm);
        const matchAmount = String(t.amount).includes(searchTerm);
        if (!matchNote && !matchCat && !matchAmount) return false;
      }
      return true;
    });

    // Update Filtered Summary Banner
    let sumInc = 0;
    let sumExp = 0;
    filtered.forEach(t => {
      if (t.type === 'income') sumInc += Number(t.amount);
      if (t.type === 'expense') sumExp += Number(t.amount);
    });

    const incEl = document.getElementById('tx-filtered-income');
    const expEl = document.getElementById('tx-filtered-expense');
    const netEl = document.getElementById('tx-filtered-net');
    if (incEl) incEl.innerText = `฿${sumInc.toLocaleString()}`;
    if (expEl) expEl.innerText = `฿${sumExp.toLocaleString()}`;
    if (netEl) netEl.innerText = `฿${(sumInc - sumExp).toLocaleString()}`;

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 text-muted">
          <i data-lucide="inbox" style="width: 48px; height: 48px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p>ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      `;
      return;
    }

    // Group by Date
    const groups = {};
    filtered.forEach(t => {
      const d = t.date || 'ไม่ระบุวันที่';
      if (!groups[d]) groups[d] = [];
      groups[d].push(t);
    });

    let html = '';
    Object.keys(groups).forEach(dateStr => {
      const formattedDate = this.formatDateTitle(dateStr);
      html += `
        <div class="timeline-group">
          <h4 class="timeline-group-date">${formattedDate}</h4>
          <div class="transaction-list">
            ${groups[dateStr].map(t => this.createTransactionCardHTML(t)).join('')}
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
  }

  createTransactionCardHTML(tx) {
    const cat = this.getCategory(tx.categoryId, tx.type);
    const wallet = this.getWallet(tx.walletId);
    const isExp = tx.type === 'expense';
    const isInc = tx.type === 'income';

    const sign = isExp ? '-' : (isInc ? '+' : '↔');
    const amountClass = isExp ? 'expense' : (isInc ? 'income' : 'transfer');

    return `
      <div class="tx-item-card" onclick="app.editTransaction('${tx.id}')">
        <div class="tx-left">
          <div class="tx-cat-icon" style="background: ${cat.color}15; color: ${cat.color};">
            ${cat.icon}
          </div>
          <div class="tx-details">
            <span class="tx-name">${tx.note || cat.name}</span>
            <div class="tx-meta">
              <span class="tx-wallet-tag">${wallet.name}</span>
              ${tx.note ? `<span class="text-muted">• ${cat.name}</span>` : ''}
              ${tx.receipt ? `<i data-lucide="paperclip" class="text-emerald" style="width: 13px; height: 13px;"></i>` : ''}
            </div>
          </div>
        </div>
        <div class="tx-right">
          <span class="tx-amount ${amountClass}">${sign} ฿ ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span class="tx-time">${tx.time || tx.date}</span>
        </div>
      </div>
    `;
  }

  renderWallets() {
    let totalNet = 0;
    this.state.wallets.forEach(w => { totalNet += Number(w.balance); });

    const totalEl = document.getElementById('wallets-total-networth');
    if (totalEl) totalEl.innerText = `฿ ${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const grid = document.getElementById('wallets-full-grid');
    if (grid) {
      grid.innerHTML = this.state.wallets.map(w => `
        <div class="wallet-card-lg" style="--wallet-theme: ${w.color || '#16a34a'};">
          <div class="wallet-card-top">
            <div class="mini-card-head">
              <div class="mini-card-icon" style="background: ${w.color || '#16a34a'};">
                <i data-lucide="${w.icon || 'landmark'}"></i>
              </div>
              <div>
                <h4 style="font-size: 1rem; font-weight: 700;">${w.name}</h4>
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">${w.type}</span>
              </div>
            </div>
            <button class="btn-icon-subtle" onclick="app.editWallet('${w.id}')"><i data-lucide="edit-3"></i></button>
          </div>
          <div class="wallet-card-balance">฿ ${Number(w.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div class="wallet-card-actions">
            <button class="btn-secondary-light" style="flex: 1;" onclick="app.quickAddForWallet('${w.id}')">+ บันทึกรายการ</button>
          </div>
        </div>
      `).join('');
    }
  }

  renderBudgets() {
    let totalSpent = 0;
    const catExpenses = {};

    this.state.transactions.filter(t => t.type === 'expense').forEach(t => {
      totalSpent += Number(t.amount);
      catExpenses[t.categoryId] = (catExpenses[t.categoryId] || 0) + Number(t.amount);
    });

    const masterLimit = 40000;
    const masterRemain = Math.max(0, masterLimit - totalSpent);
    const masterPct = Math.min(100, Math.round((totalSpent / masterLimit) * 100));

    const totalEl = document.getElementById('budget-master-total');
    const spentEl = document.getElementById('budget-master-spent');
    const remainEl = document.getElementById('budget-master-remain');
    const barEl = document.getElementById('budget-master-bar');
    const statusEl = document.getElementById('budget-master-status');

    if (totalEl) totalEl.innerText = `฿ ${masterLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (spentEl) spentEl.innerText = `฿ ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (remainEl) remainEl.innerText = `฿ ${masterRemain.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (barEl) barEl.style.width = `${masterPct}%`;

    if (statusEl) {
      if (masterPct >= 100) {
        statusEl.style.background = 'var(--color-expense-light)';
        statusEl.style.color = 'var(--color-expense)';
        statusEl.innerText = `เกินงบแล้ว (${masterPct}%) ⚠️`;
      } else if (masterPct >= 80) {
        statusEl.style.background = 'var(--color-amber-light)';
        statusEl.style.color = 'var(--color-amber)';
        statusEl.innerText = `ใกล้เต็มงบ (${masterPct}%) ⚠️`;
      } else {
        statusEl.style.background = 'var(--primary-100)';
        statusEl.style.color = 'var(--primary-800)';
        statusEl.innerText = `ปลอดภัย (ใช้ไป ${masterPct}%)`;
      }
    }

    // Render Category Budgets
    const listContainer = document.getElementById('category-budgets-list');
    if (listContainer) {
      listContainer.innerHTML = this.state.budgets.map(b => {
        const cat = this.getCategory(b.categoryId, 'expense');
        const spent = catExpenses[b.categoryId] || 0;
        const pct = Math.min(100, Math.round((spent / b.limit) * 100));
        const colorClass = pct >= 100 ? 'rose' : (pct >= 80 ? 'blue' : 'emerald');

        return `
          <div class="budget-cat-card">
            <div class="budget-cat-head">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${cat.icon}</span>
                <strong style="font-size: 0.9rem;">${cat.name}</strong>
              </div>
              <span style="font-size: 0.8rem; font-weight: 700;">${pct}%</span>
            </div>
            <div class="progress-track sm">
              <div class="progress-fill ${colorClass}" style="width: ${pct}%;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-top: 0.4rem; color: var(--text-muted);">
              <span>ใช้ไป: ฿${spent.toLocaleString()}</span>
              <span>งบ: ฿${b.limit.toLocaleString()}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  renderSavingGoals() {
    const grid = document.getElementById('saving-goals-list');
    if (!grid) return;

    grid.innerHTML = this.state.savingGoals.map(g => {
      const pct = Math.min(100, Math.round((g.current / g.target) * 100));
      return `
        <div class="saving-goal-card">
          <div class="goal-card-top">
            <h4 class="goal-card-title">${g.name}</h4>
            <span class="badge-pill-green">${pct}%</span>
          </div>
          <div class="progress-track lg">
            <div class="progress-fill emerald" style="width: ${pct}%;"></div>
          </div>
          <div class="goal-numbers">
            <span>เก็บได้: <strong class="text-emerald">฿${g.current.toLocaleString()}</strong></span>
            <span>เป้าหมาย: <strong>฿${g.target.toLocaleString()}</strong></span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-secondary-light" style="flex: 1;" onclick="app.depositToGoal('${g.id}')">+ หยอดกระปุก</button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderRecurringAndDebts() {
    // Recurring Bills
    const recContainer = document.getElementById('recurring-bills-list');
    if (recContainer) {
      recContainer.innerHTML = this.state.recurringBills.map(r => `
        <div class="recurring-card">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div class="action-icon ${r.type === 'income' ? 'bg-emerald-light text-emerald' : 'bg-rose-light text-rose'}">
              <i data-lucide="${r.icon || 'receipt'}"></i>
            </div>
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700;">${r.name}</h4>
              <span style="font-size: 0.75rem; color: var(--text-muted);">กำหนดถัดไป: ${r.nextDate} (${r.frequency})</span>
            </div>
          </div>
          <div style="text-align: right;">
            <strong class="${r.type === 'income' ? 'text-emerald' : 'text-rose'}" style="font-size: 1.05rem;">
              ${r.type === 'income' ? '+' : '-'} ฿${Number(r.amount).toLocaleString()}
            </strong>
          </div>
        </div>
      `).join('');
    }

    // Debts & Loans
    const debtContainer = document.getElementById('debts-loans-list');
    if (debtContainer) {
      debtContainer.innerHTML = this.state.debts.map(d => {
        const isLend = d.type === 'lend';
        return `
          <div class="debt-card">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div class="action-icon ${isLend ? 'bg-emerald-light text-emerald' : 'bg-rose-light text-rose'}">
                <i data-lucide="${isLend ? 'arrow-up-right' : 'arrow-down-left'}"></i>
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700;">${d.person}</h4>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${isLend ? 'เขาติดเรา' : 'เราติดเขา'} • กำหนด: ${d.dueDate || 'ไม่ระบุ'}</span>
              </div>
            </div>
            <div style="text-align: right; display: flex; align-items: center; gap: 0.75rem;">
              <strong class="${isLend ? 'text-emerald' : 'text-rose'}">฿${Number(d.amount).toLocaleString()}</strong>
              <button class="btn-xs-primary" onclick="app.settleDebt('${d.id}')">ปิดยอด</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  /* ==========================================================================
     TRANSACTION CRUD & MODAL OPERATIONS
     ========================================================================== */

  openTransactionModal(type = 'expense', editData = null) {
    this.currentTxType = type;
    const modal = document.getElementById('modal-transaction');
    const form = document.getElementById('form-transaction');
    form.reset();

    document.querySelectorAll('.type-seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tx-type') === type);
    });

    const today = new Date();
    document.getElementById('tx-date').value = today.toISOString().split('T')[0];
    document.getElementById('tx-time').value = today.toTimeString().slice(0, 5);
    document.getElementById('tx-edit-id').value = editData ? editData.id : '';

    if (editData) {
      document.getElementById('tx-amount').value = editData.amount;
      document.getElementById('tx-date').value = editData.date;
      document.getElementById('tx-time').value = editData.time || '';
      document.getElementById('tx-note').value = editData.note || '';
      document.getElementById('tx-category').value = editData.categoryId || 'food';
      document.getElementById('tx-wallet').value = editData.walletId || this.state.wallets[0].id;
    }

    this.renderCategoryPills(type);
    this.openModal('modal-transaction');
  }

  renderCategoryPills(type) {
    const container = document.getElementById('tx-category-picker');
    if (!container) return;

    const list = (type === 'income' ? this.state.categories.income : this.state.categories.expense) || [];
    const currentSelected = document.getElementById('tx-category')?.value || list[0]?.id;

    container.innerHTML = list.map(c => `
      <div class="cat-pill ${c.id === currentSelected ? 'active' : ''}" onclick="app.selectCategory('${c.id}')">
        <span class="icon">${c.icon}</span>
        <span class="label">${c.name}</span>
      </div>
    `).join('');
  }

  selectCategory(catId) {
    document.getElementById('tx-category').value = catId;
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    this.renderCategoryPills(this.currentTxType);
  }

  saveTransaction() {
    const editId = document.getElementById('tx-edit-id').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const categoryId = document.getElementById('tx-category').value;
    const walletId = document.getElementById('tx-wallet').value;
    const date = document.getElementById('tx-date').value;
    const time = document.getElementById('tx-time').value;
    const note = document.getElementById('tx-note').value;
    const receiptImg = document.getElementById('receipt-preview-img')?.src || null;

    if (isNaN(amount) || amount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    const tx = {
      id: editId || 'tx-' + Date.now(),
      type: this.currentTxType,
      amount: amount,
      categoryId: categoryId,
      walletId: walletId,
      date: date,
      time: time,
      note: note,
      receipt: receiptImg && receiptImg.startsWith('data:') ? receiptImg : null
    };

    if (editId) {
      const idx = this.state.transactions.findIndex(t => t.id === editId);
      if (idx !== -1) this.state.transactions[idx] = tx;
    } else {
      this.state.transactions.unshift(tx);

      // Adjust wallet balance
      const wallet = this.state.wallets.find(w => w.id === walletId);
      if (wallet) {
        if (this.currentTxType === 'expense') wallet.balance -= amount;
        else if (this.currentTxType === 'income') wallet.balance += amount;
      }
    }

    this.saveState();
    this.closeModal('modal-transaction');
    this.renderAll();
    this.showToast('บันทึกรายการสำเร็จแล้ว ✨');
  }

  editTransaction(txId) {
    const tx = this.state.transactions.find(t => t.id === txId);
    if (!tx) return;
    this.openTransactionModal(tx.type, tx);
  }

  /* ==========================================================================
     SLIP OCR SCANNER CONTROLLER
     ========================================================================== */

  async handleSlipOCR(file) {
    const promptView = document.getElementById('ocr-upload-prompt');
    const processingView = document.getElementById('ocr-processing');
    const resultPreview = document.getElementById('ocr-result-preview');
    const statusText = document.getElementById('ocr-status-text');
    const detectedCard = document.getElementById('ocr-detected-card');
    const useResultBtn = document.getElementById('btn-use-ocr-result');

    promptView.style.display = 'none';
    processingView.style.display = 'flex';
    detectedCard.style.display = 'none';
    useResultBtn.style.display = 'none';

    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('ocr-preview-image').src = e.target.result;
      resultPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Call OCR Slip engine
    const result = await SlipOCR.processSlip(file, (msg) => {
      if (statusText) statusText.innerText = msg;
    });

    processingView.style.display = 'none';

    if (result && result.data) {
      const { amount, date, receiver, suggestedCategory, note } = result.data;
      document.getElementById('ocr-res-amount').innerText = `฿ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      document.getElementById('ocr-res-date').innerText = date;
      document.getElementById('ocr-res-receiver').innerText = receiver;
      document.getElementById('ocr-res-category').innerText = this.getCategory(suggestedCategory, 'expense').name;

      detectedCard.style.display = 'block';
      useResultBtn.style.display = 'block';

      useResultBtn.onclick = () => {
        this.closeModal('modal-ocr-scanner');
        this.openTransactionModal('expense');
        document.getElementById('tx-amount').value = amount;
        document.getElementById('tx-note').value = note;
        document.getElementById('tx-category').value = suggestedCategory;
        this.renderCategoryPills('expense');
        this.showToast('กรอกข้อมูลจากสลิปให้อัตโนมัติแล้ว');
      };
    }
  }

  /* ==========================================================================
     SAVINGS GOALS & DEBT ACTIONS
     ========================================================================== */

  saveWallet() {
    const editId = document.getElementById('wallet-edit-id')?.value;
    const name = document.getElementById('wallet-name')?.value;
    const type = document.getElementById('wallet-type')?.value;
    const balance = parseFloat(document.getElementById('wallet-balance')?.value) || 0;
    const color = document.querySelector('input[name="wallet_color"]:checked')?.value || '#16a34a';

    if (!name) return;

    if (editId) {
      const w = this.state.wallets.find(x => x.id === editId);
      if (w) {
        w.name = name;
        w.type = type;
        w.balance = balance;
        w.color = color;
      }
    } else {
      this.state.wallets.push({
        id: 'w-' + Date.now(),
        name,
        type,
        balance,
        color,
        icon: type === 'cash' ? 'banknote' : (type === 'ewallet' ? 'smartphone' : 'landmark')
      });
    }

    this.saveState();
    this.closeModal('modal-wallet');
    this.renderAll();
    this.showToast('บันทึกข้อมูลบัญชีเรียบร้อยแล้ว');
  }

  editWallet(walletId) {
    const w = this.state.wallets.find(x => x.id === walletId);
    if (!w) return;
    document.getElementById('wallet-edit-id').value = w.id;
    document.getElementById('wallet-name').value = w.name;
    document.getElementById('wallet-type').value = w.type;
    document.getElementById('wallet-balance').value = w.balance;
    this.openModal('modal-wallet');
  }

  quickAddForWallet(walletId) {
    this.openTransactionModal('expense');
    const select = document.getElementById('tx-wallet');
    if (select) select.value = walletId;
  }

  saveTransfer() {
    const amount = parseFloat(document.getElementById('transfer-amount')?.value);
    const fromId = document.getElementById('transfer-from-wallet')?.value;
    const toId = document.getElementById('transfer-to-wallet')?.value;
    const note = document.getElementById('transfer-note')?.value || 'โอนเงินระหว่างบัญชี';

    if (isNaN(amount) || amount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    if (fromId === toId) {
      alert('บัญชีต้นทางและปลายทางต้องไม่ซ้ำกัน');
      return;
    }

    const fromWallet = this.state.wallets.find(w => w.id === fromId);
    const toWallet = this.state.wallets.find(w => w.id === toId);

    if (fromWallet && toWallet) {
      fromWallet.balance -= amount;
      toWallet.balance += amount;

      const today = new Date();
      this.state.transactions.unshift({
        id: 'tx-' + Date.now(),
        type: 'transfer',
        amount: amount,
        categoryId: 'other_exp',
        walletId: fromId,
        targetWalletId: toId,
        date: today.toISOString().split('T')[0],
        time: today.toTimeString().slice(0, 5),
        note: `${note} (${fromWallet.name} ➔ ${toWallet.name})`,
        receipt: null
      });

      this.saveState();
      this.closeModal('modal-transfer');
      this.renderAll();
      this.showToast(`โอนเงิน ฿${amount.toLocaleString()} สำเร็จแล้ว`);
    }
  }

  saveBudget() {
    const categoryId = document.getElementById('budget-category-select')?.value;
    const limit = parseFloat(document.getElementById('budget-limit-amount')?.value);

    if (isNaN(limit) || limit <= 0) {
      alert('กรุณาระบุวงเงินงบประมาณที่ถูกต้อง');
      return;
    }

    const existing = this.state.budgets.find(b => b.categoryId === categoryId);
    if (existing) {
      existing.limit = limit;
    } else {
      this.state.budgets.push({ categoryId, limit });
    }

    this.saveState();
    this.closeModal('modal-budget');
    this.renderAll();
    this.showToast('ตั้งงบประมาณเรียบร้อยแล้ว');
  }

  saveSavingGoal() {
    const name = document.getElementById('goal-name')?.value;
    const target = parseFloat(document.getElementById('goal-target-amount')?.value);
    const current = parseFloat(document.getElementById('goal-current-amount')?.value) || 0;
    const targetDate = document.getElementById('goal-target-date')?.value || '';

    if (!name || isNaN(target) || target <= 0) {
      alert('กรุณากรอกข้อมูลเป้าหมายให้ครบถ้วน');
      return;
    }

    this.state.savingGoals.push({
      id: 'sg-' + Date.now(),
      name,
      target,
      current,
      targetDate,
      icon: 'target'
    });

    this.saveState();
    this.closeModal('modal-saving-goal');
    this.renderSavingGoals();
    this.showToast('สร้างเป้าหมายการออมเรียบร้อยแล้ว 🎯');
  }

  saveRecurringBill() {
    const name = document.getElementById('rec-name')?.value;
    const type = document.getElementById('rec-type')?.value;
    const amount = parseFloat(document.getElementById('rec-amount')?.value);
    const frequency = document.getElementById('rec-frequency')?.value;
    const nextDate = document.getElementById('rec-next-date')?.value;

    if (!name || isNaN(amount) || amount <= 0 || !nextDate) {
      alert('กรุณากรอกข้อมูลรายการประจำให้ครบถ้วน');
      return;
    }

    this.state.recurringBills.push({
      id: 'rc-' + Date.now(),
      name,
      type,
      amount,
      frequency,
      nextDate,
      icon: type === 'income' ? 'wallet' : 'receipt'
    });

    this.saveState();
    this.closeModal('modal-recurring');
    this.renderRecurringAndDebts();
    this.showToast('บันทึกรายการประจำเรียบร้อยแล้ว');
  }

  saveDebt() {
    const type = document.getElementById('debt-type')?.value;
    const person = document.getElementById('debt-person')?.value;
    const amount = parseFloat(document.getElementById('debt-amount')?.value);
    const dueDate = document.getElementById('debt-due-date')?.value || '';

    if (!person || isNaN(amount) || amount <= 0) {
      alert('กรุณากรอกข้อมูลหนี้สินให้ถูกต้อง');
      return;
    }

    this.state.debts.push({
      id: 'db-' + Date.now(),
      type,
      person,
      amount,
      dueDate,
      status: 'pending'
    });

    this.saveState();
    this.closeModal('modal-debt');
    this.renderRecurringAndDebts();
    this.showToast('บันทึกรายการยืมคืนเรียบร้อยแล้ว');
  }

  depositToGoal(goalId) {
    const goal = this.state.savingGoals.find(g => g.id === goalId);
    if (!goal) return;

    const amountStr = prompt(`ยอดเงินที่ต้องการหยอดกระปุก "${goal.name}" (บาท):`, '500');
    const amount = parseFloat(amountStr);
    if (amount > 0) {
      goal.current += amount;
      this.saveState();
      this.renderSavingGoals();

      if (goal.current >= goal.target && window.confetti) {
        confetti({ particleCount: 150, spread: 80 });
        this.showToast(`🎉 ยินดีด้วย! คุณบรรลุเป้าหมาย "${goal.name}" แล้ว!`);
      } else {
        this.showToast(`หยอดกระปุก ฿${amount.toLocaleString()} สำเร็จแล้ว`);
      }
    }
  }

  settleDebt(debtId) {
    this.state.debts = this.state.debts.filter(d => d.id !== debtId);
    this.saveState();
    this.renderRecurringAndDebts();
    this.showToast('ปิดยอดหนี้สินเรียบร้อยแล้ว');
  }

  /* ==========================================================================
     HELPERS & POPULATORS
     ========================================================================== */

  populateWalletSelects() {
    const selects = ['tx-wallet', 'tx-target-wallet', 'transfer-from-wallet', 'transfer-to-wallet', 'filter-wallet-select'];
    selects.forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;

      const isFilter = id === 'filter-wallet-select';
      let html = isFilter ? '<option value="all">ทุกกระเป๋าเงิน</option>' : '';
      html += this.state.wallets.map(w => `<option value="${w.id}">${w.name} (฿${Number(w.balance).toLocaleString()})</option>`).join('');
      select.innerHTML = html;
    });
  }

  populateBudgetCategorySelect() {
    const select = document.getElementById('budget-category-select');
    if (!select) return;
    select.innerHTML = this.state.categories.expense.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  }

  getCategory(catId, type = 'expense') {
    const list = type === 'income' ? this.state.categories.income : this.state.categories.expense;
    return list.find(c => c.id === catId) || { name: 'อื่นๆ', icon: '📦', color: '#64748b' };
  }

  getWallet(walletId) {
    return this.state.wallets.find(w => w.id === walletId) || { name: 'บัญชีหลัก', color: '#16a34a' };
  }

  formatDateTitle(dateStr) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    if (toast && msgEl) {
      msgEl.innerText = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    }
  }
}

// Global App Instance
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new SmartExpenseApp();
});
