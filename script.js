document.addEventListener("DOMContentLoaded", () => {
  // --- Global DOM Elements from js1 ---
  const donationAmountInput = document.getElementById("donationAmount");
  const amountError = document.getElementById("amountError");
  const payButton = document.getElementById("payButton");
  const buttonText = document.getElementById("buttonText");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const quickAmountButtonsContainer =
    document.getElementById("quickAmountButtons");
  const quickAmountButtons = document.querySelectorAll(".quick-amount-button");

  const paymentMethodsContainer = document.getElementById(
    "paymentMethodsContainer"
  );
  const paymentMethodCards = document.querySelectorAll(".payment-method-card");
  const paymentDetails = document.getElementById("paymentDetails");

  const paymentModal = document.getElementById("paymentModal");
  const closeModalButton = document.getElementById("closeModal");
  const modalOkButton = document.getElementById("modalOkButton");
  const modalSecondaryButton = document.getElementById("modalSecondaryButton");
  const modalIcon = document.getElementById("modalIcon");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");

  const copyToast = document.getElementById("copyToast");
  const copyToastMessage = document.getElementById("copyToastMessage");

  // --- Persistence (Local Storage) from js1 ---
  const LOCAL_STORAGE_AMOUNT_KEY = "donate4khmer_amount";
  const LOCAL_STORAGE_METHOD_KEY = "donate4khmer_method";
  let selectedPaymentMethod = "credit_card"; // Default selected method

  /**
   * Loads saved amount and method from local storage on page load.
   */
  function loadPreferences() {
    const savedAmount = localStorage.getItem(LOCAL_STORAGE_AMOUNT_KEY);
    const savedMethod = localStorage.getItem(LOCAL_STORAGE_METHOD_KEY);

    if (savedAmount) {
      donationAmountInput.value = savedAmount;
      updateQuickAmountButtonState(parseFloat(savedAmount));
    }
    if (savedMethod) {
      // Activate the corresponding payment method card
      selectPaymentMethod(savedMethod);
    } else {
      // Ensure default card is active if no method is saved
      selectPaymentMethod("credit_card");
    }
  }

  /**
   * Saves current amount and method to local storage.
   */
  function savePreferences() {
    localStorage.setItem(LOCAL_STORAGE_AMOUNT_KEY, donationAmountInput.value);
    localStorage.setItem(LOCAL_STORAGE_METHOD_KEY, selectedPaymentMethod);
  }

  // --- Quick Amount Buttons Logic from js1 ---
  /**
   * Updates the active state of quick amount buttons based on the input value.
   * @param {number} currentAmount - The current value of the donation amount input.
   */
  function updateQuickAmountButtonState(currentAmount) {
    quickAmountButtons.forEach((button) => {
      const buttonAmount = parseFloat(button.dataset.amount);
      if (buttonAmount === currentAmount) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  // Event listener for quick amount buttons
  quickAmountButtonsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("quick-amount-button")) {
      const amount = parseFloat(event.target.dataset.amount);
      donationAmountInput.value = amount;
      updateQuickAmountButtonState(amount);
      validateAmountInput(); // Re-validate input after setting amount
      savePreferences(); // Save preference when a quick amount is clicked
    }
  });

  // Event listener for manual input change to update quick button state
  donationAmountInput.addEventListener("input", () => {
    const currentAmount = parseFloat(donationAmountInput.value);
    updateQuickAmountButtonState(currentAmount);
    validateAmountInput(); // Validate on input change
    savePreferences(); // Save preference when manual input changes
  });

  // --- Input Validation from js1 ---
  /**
   * Validates the donation amount input field.
   * Adds/removes error styling and returns true if valid, false otherwise.
   */
  function validateAmountInput() {
    const amount = parseFloat(donationAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
      donationAmountInput.classList.add("border-red-500", "focus:ring-red-500");
      donationAmountInput.classList.remove(
        "border-gray-300",
        "focus:ring-blue-500"
      );
      amountError.classList.remove("hidden"); // Show error message
      return false;
    } else {
      donationAmountInput.classList.remove(
        "border-red-500",
        "focus:ring-red-500"
      );
      donationAmountInput.classList.add(
        "border-gray-300",
        "focus:ring-blue-500"
      );
      amountError.classList.add("hidden"); // Hide error message
      return true;
    }
  }

  // --- Payment Method Selection Logic from js1 ---
  /**
   * Updates the active payment method card and displays relevant details.
   * @param {string} method - The selected payment method (e.g., 'credit_card', 'aba_pay').
   */
  function selectPaymentMethod(method) {
    // Remove active class from all cards
    paymentMethodCards.forEach((card) => card.classList.remove("active"));

    // Add active class to the corresponding card
    const activeCard = document.querySelector(
      `.payment-method-card[data-method="${method}"]`
    );
    if (activeCard) {
      activeCard.classList.add("active");
      selectedPaymentMethod = method; // Update the global variable
      updatePaymentDetailsDisplay(method);
    }
  }

  /**
   * Updates the content of the payment details section based on the selected method.
   * Also adds a 'Copy Details' button for bank transfer method.
   * @param {string} method - The selected payment method.
   */
  function updatePaymentDetailsDisplay(method) {
    paymentDetails.classList.remove("hidden"); // Ensure the section is visible

    let content = "";
    switch (method) {
      case "credit_card":
        content = `
                                    <h4 class="text-2xl font-bold text-gray-800 mb-3">ព័ត៌មានកាតឥណទាន</h4>
                                    <p class="text-gray-700 text-base mb-4">សូមបញ្ចូលព័ត៌មានកាតរបស់អ្នកនៅជំហានបន្ទាប់។</p>
                                    <div class="flex justify-center mt-4 gap-3">
                                        <img src="https://placehold.co/60x35/0000FF/FFFFFF?text=VISA" alt="Visa" class="rounded-md shadow-sm">
                                        <img src="https://placehold.co/60x35/FFCC00/000000?text=MC" alt="MasterCard" class="rounded-md shadow-sm">
                                        <img src="https://placehold.co/60x35/666666/FFFFFF?text=AmEx" alt="American Express" class="rounded-md shadow-sm">
                                    </div>
                                `;
        break;
      case "aba_pay":
        content = `
                                    <h4 class="text-2xl font-bold text-gray-800 mb-3">ស្កេនដើម្បីបរិច្ចាគតាម ABA Pay</h4>
                                    <img src="https://placehold.co/220x220/0000FF/FFFFFF?text=ABA+QR" alt="ABA Pay QR Code" class="mx-auto my-5 border-4 border-blue-400 rounded-lg shadow-md">
                                    <p class="text-gray-700 text-sm">ប្រើកម្មវិធី ABA Mobile ដើម្បីស្កេនលេខកូដ QR នេះ។</p>
                                    <p class="text-red-500 text-xs mt-2 font-medium">**នេះគឺជាលេខកូដ QR សម្រាប់ក្លែងបន្លំប៉ុណ្ណោះ។**</p>
                                `;
        break;
      case "wing_money":
        content = `
                                    <h4 class="text-2xl font-bold text-gray-800 mb-3">ស្កេនដើម្បីបរិច្ចាគតាម Wing Money</h4>
                                    <img src="https://placehold.co/220x220/FF0000/FFFFFF?text=WING+QR" alt="Wing Money QR Code" class="mx-auto my-5 border-4 border-red-400 rounded-lg shadow-md">
                                    <p class="text-gray-700 text-sm">ប្រើកម្មវិធី Wing Money ដើម្បីស្កេនលេខកូដ QR នេះ។</p>
                                    <p class="text-red-500 text-xs mt-2 font-medium">**នេះគឺជាលេខកូដ QR សម្រាប់ក្លែងបន្លំប៉ុណ្ណោះ។**</p>
                                `;
        break;
      case "bank_transfer":
        content = `
                                    <h4 class="text-2xl font-bold text-gray-800 mb-3">ព័ត៌មានផ្ទេរប្រាក់តាមធនាគារ</h4>
                                    <p class="text-gray-700 text-base mb-3">សូមប្រើព័ត៌មានខាងក្រោមដើម្បីធ្វើការផ្ទេរប្រាក់:</p>
                                    <ul id="bankDetailsList" class="text-left mx-auto max-w-xs space-y-2 text-gray-800 text-base bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <li><strong class="font-semibold">ឈ្មោះគណនី:</strong> <span id="accountName">Donate4Khmer Org</span></li>
                                        <li><strong class="font-semibold">លេខគណនី:</strong> <span id="accountNumber">123-456-7890</span> (ABC Bank)</li>
                                        <li><strong class="font-semibold">SWIFT Code:</strong> <span id="swiftCode">ABCCKHPP</span></li>
                                    </ul>
                                    <button id="copyBankDetails" class="mt-4 bg-gray-700 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-full transition duration-200 ease-in-out flex items-center justify-center mx-auto">
                                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 0h-2M15 7H9m12 0a2 2 0 01-2 2v5a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h2m-4 0a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                        ចម្លងព័ត៌មានគណនី
                                    </button>
                                    <p class="text-red-500 text-xs mt-3 font-medium">**នេះជាព័ត៌មានគណនីក្លែងបន្លំសម្រាប់តែការបង្ហាញប៉ុណ្ណោះ។**</p>
                                `;
        break;
      default:
        content = `<p class="text-gray-600 text-base">សូមជ្រើសរើសវិធីទូទាត់ដើម្បីមើលព័ត៌មានលម្អិត។</p>`;
        paymentDetails.classList.add("hidden"); // Hide if no method selected or unknown
        break;
    }
    paymentDetails.innerHTML = content;

    // Attach event listener for the copy button if bank transfer is selected
    if (method === "bank_transfer") {
      document
        .getElementById("copyBankDetails")
        .addEventListener("click", copyBankDetailsToClipboard);
    }
  }

  // Event listener for payment method cards
  paymentMethodsContainer.addEventListener("click", (event) => {
    const card = event.target.closest(".payment-method-card");
    if (card) {
      const method = card.dataset.method;
      selectPaymentMethod(method);
      savePreferences(); // Save the selected method
    }
  });

  // --- Copy to Clipboard Functionality from js1 ---
  /**
   * Copies bank transfer details to the clipboard.
   */
  function copyBankDetailsToClipboard() {
    const accountName = document.getElementById("accountName").textContent;
    const accountNumber = document.getElementById("accountNumber").textContent;
    const swiftCode = document.getElementById("swiftCode").textContent;

    const textToCopy = `Account Name: ${accountName}\nAccount Number: ${accountNumber}\nSWIFT Code: ${swiftCode}`;

    // Using document.execCommand('copy') for better compatibility within iframes
    const textarea = document.createElement("textarea");
    textarea.value = textToCopy;
    textarea.style.position = "fixed"; // Prevents scrolling to bottom
    textarea.style.opacity = 0; // Hide it
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand("copy");
      const msg = successful ? "ព័ត៌មានបានចម្លង!" : "មិនអាចចម្លងព័ត៌មានបានទេ។";
      showCopyToast(msg);
    } catch (err) {
      showCopyToast("មិនអាចចម្លងព័ត៌មានបានទេ។");
      console.error("Failed to copy text: ", err);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  /**
   * Shows a small toast notification for copy status.
   * @param {string} message - The message to display in the toast.
   */
  function showCopyToast(message) {
    copyToastMessage.textContent = message;
    copyToast.classList.remove("hidden", "opacity-0", "translate-y-5");
    copyToast.classList.add("opacity-100", "translate-y-0");

    setTimeout(() => {
      copyToast.classList.remove("opacity-100", "translate-y-0");
      copyToast.classList.add("opacity-0", "translate-y-5");
      copyToast.addEventListener(
        "transitionend",
        () => {
          copyToast.classList.add("hidden");
        },
        { once: true }
      ); // Hide completely after transition
    }, 2000); // Show for 2 seconds
  }

  // --- Modal Logic from js1 (renamed to payment-specific modal functions to avoid conflict with donation-modal) ---
  /**
   * Shows the payment confirmation modal with specified content.
   * @param {string} iconSvg - SVG string for the icon (success/failure).
   * @param {string} title - Title of the modal.
   * @param {string} message - Detailed message for the modal.
   * @param {string} buttonColor - Tailwind color class for the main button (e.g., 'bg-green-600').
   * @param {boolean} showSecondaryButton - Whether to show the secondary button (e.g., "Return to Homepage").
   */
  function showPaymentConfirmModal(
    iconSvg,
    title,
    message,
    buttonColor,
    showSecondaryButton = false
  ) {
    modalIcon.innerHTML = iconSvg;
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    // Reset modalOkButton classes and apply new color
    modalOkButton.className = `bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 transform hover:scale-105`;
    modalOkButton.classList.add(buttonColor);

    if (showSecondaryButton) {
      modalOkButton.textContent = "បរិច្ចាគម្តងទៀត";
      modalSecondaryButton.classList.remove("hidden");
    } else {
      modalOkButton.textContent = "យល់ព្រម"; // Default for error/info
      modalSecondaryButton.classList.add("hidden");
    }

    paymentModal.classList.add("show"); // Show the modal with transition
    // Add overflow-hidden to the body to prevent scrolling
    document.body.classList.add("overflow-hidden");
  }

  /**
   * Hides the payment confirmation modal.
   */
  function hidePaymentConfirmModal() {
    paymentModal.classList.remove("show"); // Hide the modal with transition
    // Remove overflow-hidden from the body to re-enable scrolling
    document.body.classList.remove("overflow-hidden");
  }

  // --- Main Payment Logic from js1 ---
  // Event listener for the "Pay Now" button
  if (payButton) {
    payButton.addEventListener("click", () => {
      if (!validateAmountInput()) {
        // If validation fails, do not open modal, just show inline error
        return;
      }

      const amount = parseFloat(donationAmountInput.value);
      // Get the display name of the selected method from the card's text content
      const methodCard = document.querySelector(
        `.payment-method-card[data-method="${selectedPaymentMethod}"]`
      );
      const methodText = methodCard
        ? methodCard.querySelector("span").textContent
        : "វិធីសាស្រ្តមិនស្គាល់";

      // Save preferences before processing
      savePreferences();

      // Disable button and show loading spinner
      payButton.disabled = true;
      buttonText.textContent = "កំពុងដំណើរការ...";
      loadingSpinner.classList.remove("hidden");
      payButton.classList.add("opacity-60", "cursor-not-allowed"); // Reduce opacity slightly more

      // Simulate payment processing with a delay
      setTimeout(() => {
        const isSuccess = Math.random() > 0.1; // 90% chance of success, 10% chance of failure for demonstration

        if (isSuccess) {
          showPaymentConfirmModal(
            `<svg class="w-20 h-20 mx-auto text-green-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
            "ការបរិច្ចាគជោគជ័យ!",
            `ការបរិច្ចាគចំនួន $${amount.toFixed(
              2
            )} USD តាមរយៈ ${methodText} បានជោគជ័យ! សូមអរគុណយ៉ាងជ្រាលជ្រៅចំពោះសេចក្តីសប្បុរសរបស់អ្នក។`,
            "bg-green-600",
            true // Show secondary button for success
          );
        } else {
          showPaymentConfirmModal(
            `<svg class="w-20 h-20 mx-auto text-red-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`,
            "ការបរិច្ចាគបរាជ័យ",
            "ការទូទាត់បានបរាជ័យ។ សូមពិនិត្យព័ត៌មានរបស់អ្នក ឬព្យាយាមម្តងទៀត។",
            "bg-red-600",
            false // No secondary button for failure
          );
        }

        // Re-enable button and hide spinner
        payButton.disabled = false;
        buttonText.textContent = "បរិច្ចាគឥឡូវនេះ";
        loadingSpinner.classList.add("hidden");
        payButton.classList.remove("opacity-60", "cursor-not-allowed");
      }, 2000); // 2-second delay to simulate processing
    });
  }

  // Event listeners to close the payment confirmation modal
  if (closeModalButton) {
    closeModalButton.addEventListener("click", hidePaymentConfirmModal);
  }
  if (modalOkButton) {
    modalOkButton.addEventListener("click", hidePaymentConfirmModal);
  }
  if (modalSecondaryButton) {
    modalSecondaryButton.addEventListener("click", () => {
      console.log("Simulation: Returning to homepage!"); // Replaced alert with console.log
      hidePaymentConfirmModal();
      // window.location.href = '/'; // Uncomment for actual redirection
    });
  }

  // Close payment confirmation modal if clicking outside (optional, but good UX)
  if (paymentModal) {
    paymentModal.addEventListener("click", (event) => {
      if (event.target === paymentModal) {
        hidePaymentConfirmModal();
      }
    });
  }

  // Load preferences and initialize display on page load (from js1)
  loadPreferences();
  // Initial state for quick amount buttons based on default/loaded value
  updateQuickAmountButtonState(parseFloat(donationAmountInput.value));
  // Initial display of payment details for the default/loaded method
  updatePaymentDetailsDisplay(selectedPaymentMethod);

  // --- Global DOM Elements from js2 ---
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const closeMobileMenuButton = document.getElementById("close-mobile-menu");
  const mobileMenu = document.getElementById("mobile-menu");
  const mainNavbar = document.getElementById("main-navbar");
  const navDonateButton = document.getElementById("nav-donate-button");
  const heroDonateButton = document.getElementById("hero-donate-button");
  const mobileDonateButton = document.getElementById("mobile-donate-button");
  const donationModal = document.getElementById("donation-modal"); // Conflicting ID with paymentModal, kept separate as they serve different purposes.
  const closeDonationModalButton = document.getElementById("close-modal"); // Renamed to avoid conflict
  const donationForm = document.getElementById("donation-form");
  const donationMessage = document.getElementById("donation-message");
  const selectedCauseDropdown = document.getElementById("selected-cause");
  const contactForm = document.getElementById("contact-form");
  const contactMessageFeedback = document.getElementById(
    "contact-message-feedback"
  );
  const newsletterForm = document.getElementById("newsletter-form");
  const newsletterFeedback = document.getElementById("newsletter-feedback");
  const backToTopButton = document.getElementById("back-to-top");
  const currentYearSpan = document.getElementById("current-year");
  const hiddenSections = document.querySelectorAll(".hidden-section");
  const faqToggles = document.querySelectorAll(".faq-toggle");

  // --- 1. Mobile Navigation Toggle from js2 ---
  // Function to open mobile menu
  const openMobileMenu = () => {
    mobileMenu.classList.remove("hidden");
    // Add a class to body to prevent scrolling
    document.body.classList.add("overflow-hidden");
  };

  // Function to close mobile menu
  const closeMobileMenu = () => {
    mobileMenu.classList.add("hidden");
    // Remove class to allow scrolling
    document.body.classList.remove("overflow-hidden");
  };

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", openMobileMenu);
  }
  if (closeMobileMenuButton) {
    closeMobileMenuButton.addEventListener("click", closeMobileMenu);
  }
  // Close mobile menu when a navigation link is clicked
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  // --- 2. Sticky Navbar from js2 ---
  const handleScroll = () => {
    if (mainNavbar) {
      if (window.scrollY > 50) {
        // Add 'navbar-scrolled' class after scrolling 50px
        mainNavbar.classList.add("navbar-scrolled");
      } else {
        mainNavbar.classList.remove("navbar-scrolled");
      }
    }

    // Show/hide back to top button
    if (backToTopButton) {
      if (window.scrollY > 300) {
        // Show button after scrolling 300px
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }
    }
  };

  window.addEventListener("scroll", handleScroll);
  // Call once on load to set initial state
  handleScroll();

  // --- 3. Hero Section Carousel (Flowbite) ---
  // Flowbite carousel functionality is initialized by their script.js,
  // but we ensure it's present and ready.
  // The data-carousel attributes in HTML handle much of this.
  // We can add custom logic if needed, but for now, the CDN handles it.
  // Example of manual initialization if needed:
  // const carouselElement = document.getElementById('default-carousel');
  // if (carouselElement) {
  //   const items = [...carouselElement.querySelectorAll('[data-carousel-item]')];
  //   const options = {
  //     interval: 5000, // 5 seconds
  //     indicators: {
  //       activeClasses: 'bg-emerald-500',
  //       inactiveClasses: 'bg-gray-300 hover:bg-gray-400',
  //       wrapperClasses: 'flex absolute bottom-5 left-1/2 z-30 -translate-x-1/2 space-x-3',
  //     }
  //   };
  //   const carousel = new Carousel(carouselElement, items, options);
  // }

  // --- 4. Dynamic Donation Cards from js2 ---
  const donationProjects = [
    {
      id: "medical-care",
      title: "មូលនិធិមន្ទីរពេទ្យគន្ធបុប្ផា",
      description:
        "មូលនិធិមន្ទីរពេទ្យគន្ធបុប្ផា គឺជាមូលនិធិជាតិផ្លូវការដែលរៃអង្គាសថវិកាដើម្បីទ្រទ្រង់ការផ្ដល់សេវាព្យាបាលដោយឥតគិតថ្លៃជូនកុមារ និងស្ត្រីមានផ្ទៃពោះនៅមន្ទីរពេទ្យគន្ធបុប្ផា។",
      currentAmount: 12500,
      goalAmount: 20000,
      image:
        "https://images.unsplash.com/photo-1576091160550-fd42a8b007fb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      fallbackImage:
        "https://placehold.co/400x300/A7F3D0/047857?text=Medical+Care",
    },
    {
      id: "education",
      title: "មូលនិធិកងកម្លាំងជើងមុខ",
      description:
        "មូលនិធិកងកម្លាំងជើងមុខ គាំទ្រនិងជួយកងកម្លាំងការពារជាតិយើង។ រាល់ការបរិច្ចាគរបស់អ្នកនឹងលើកទឹកចិត្តវីរៈយុទ្ធជន។ ",
      currentAmount: 8500,
      goalAmount: 15000,
      image:
        "https://images.unsplash.com/photo-1546410531-bb4486241bba?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      fallbackImage:
        "https://placehold.co/400x300/93C5FD/1D4ED8?text=Education",
    },
    {
      id: "community-development",
      title: "មូលនិធិមន្ទីរពេទ្យកុមារជាតិ",
      description:
        "មូលនិធិមន្ទីរពេទ្យកុមារជាតិ គាំទ្រនិងលើកកម្ពស់សេវាសុខភាពដល់កុមារនៅមន្ទីរពេទ្យកុមារជាតិ។ ការបរិច្ចាគរបស់អ្នកជួយសុខភាពកុមារកម្ពុជា។",
      currentAmount: 18000,
      goalAmount: 25000,
      image:
        "https://images.unsplash.com/photo-1582213782179-e0d53f9ef1d2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      fallbackImage:
        "https://placehold.co/400x300/FDBA74/C2410C?text=Community+Dev",
    },
    {
      id: "animal-welfare",
      title: "មូលនិធិតាសុីក្លូ",
      description:
        "មូលនិធិតាស៊ីក្លូ ជួយគាំទ្រជីវភាពអ្នកធាក់ស៊ីក្លូក្រីក្រនៅកម្ពុជា។​ ការបរិច្ចាគរបស់អ្នកអាចនឹងជួយសម្រាលបន្ទុកពួកគាត់បានខ្លះ។",
      currentAmount: 4200,
      goalAmount: 7000,
      image:
        "https://images.unsplash.com/photo-1587300003388-59208cc9ff0e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      fallbackImage:
        "https://placehold.co/400x300/D8B4FE/7E22CE?text=Animal+Welfare",
    },
    {
      id: "clean-water",
      title: "មូលនិធិសម្រាប់សិស្ស​ក្រីក្រ",
      description:
        "មូលនិធិសម្រាប់សិស្សក្រីក្រ ជួយឧបត្ថម្ភការសិក្សារបស់សិស្សានុសិស្សដែលមានជីវភាពខ្វះខាត ផ្ដល់ឱកាសឱ្យពួកគេទទួលបានការអប់រំ និងកសាងអនាគតដ៏ភ្លឺស្វាង។",
      currentAmount: 9800,
      goalAmount: 12000,
      image:
        "https://images.unsplash.com/photo-1508210339908-410a803f2604?q=80&w=2862&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      fallbackImage:
        "https://placehold.co/400x300/FECACA/EF4444?text=Clean+Water",
    },
    {
      id: "disaster-relief",
      title: "មូលនិធិកុមារកំព្រា",
      description:
        "ជាមូលនិធិដែលផ្ដល់ជំនួយ និងការគាំទ្រដល់កុមារកំព្រា រួមមានការផ្គត់ផ្គង់ចំណីអាហារ សម្លៀកបំពាក់ ការអប់រំ និងទីជម្រកសមរម្យ។",
      currentAmount: 25000,
      goalAmount: 30000,
      image: "/img/10000.jpg",
      fallbackImage:
        "https://placehold.co/400x300/A8A29E/44403C?text=Disaster+Relief",
    },
  ];

  const donationCardsContainer = document.getElementById(
    "donation-cards-container"
  );

  // Function to render donation cards
  const renderDonationCards = () => {
    if (!donationCardsContainer) return;

    donationCardsContainer.innerHTML = ""; // Clear existing cards
    donationProjects.forEach((project) => {
      const progress = (project.currentAmount / project.goalAmount) * 100;
      const card = `
                <div class="bg-emerald-50 rounded-2xl shadow-lg border border-emerald-100 p-6 flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <img src="${
                      project.image
                    }" onerror="this.onerror=null;this.src='${
        project.fallbackImage
      }';" alt="${
        project.title
      } project image" class="w-full h-48 object-cover rounded-xl mb-6 shadow-md">
                    <h3 class="text-2xl font-bold text-gray-800 mb-3 font-bayon">${
                      project.title
                    }</h3>
                    <p class="text-gray-700 text-base mb-4 flex-grow">${
                      project.description
                    }</p>
                    <div class="mb-4">
                        <div class="flex justify-between mb-1 text-sm font-medium text-gray-600">
                            <span>បានរៃអង្គាស: $${project.currentAmount.toLocaleString()}</span>
                            <span>គោលដៅ: $${project.goalAmount.toLocaleString()}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-green-600 h-2.5 rounded-full" style="width: ${Math.min(
                              100,
                              progress
                            )}%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">${progress.toFixed(
                          2
                        )}% រួចរាល់</p>
                    </div>
                    <button data-project-id="${
                      project.id
                    }" class="donate-card-button px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center text-base font-semibold w-full">
                        បរិច្ចាគឥឡូវនេះ
                        
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            `;
      donationCardsContainer.innerHTML += card;
    });

    // Attach event listeners to newly created donate buttons
    document.querySelectorAll(".donate-card-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const projectId = event.currentTarget.dataset.projectId;
        openDonationModal(projectId);
      });
    });
  };

  renderDonationCards(); // Render cards on page load

  // --- 5. Donation Modal from js2 ---
  // const modalContent = document.getElementById("modal-content"); // This variable was declared but not used in js2

  // Function to open the donation modal, optionally pre-selecting a cause
  const openDonationModal = (preselectedCauseId = "") => {
    // Populate the dropdown with project titles
    if (selectedCauseDropdown) {
      selectedCauseDropdown.innerHTML =
        '<option value="">ជ្រើសរើសបុព្វហេតុ</option>';
      donationProjects.forEach((project) => {
        const option = document.createElement("option");
        option.value = project.id;
        option.textContent = project.title;
        if (project.id === preselectedCauseId) {
          option.selected = true;
        }
        selectedCauseDropdown.appendChild(option);
      });
    }

    if (donationModal) {
      donationModal.classList.remove("hidden");
      donationModal.classList.add("modal-show");
      document.body.classList.add("overflow-hidden"); // Prevent body scroll
      // Reset form feedback messages
      if (donationMessage) donationMessage.classList.add("hidden");
      const donorNameError = document.getElementById("donor-name-error");
      const donationAmountErrorJs2 = document.getElementById(
        "donation-amount-error"
      ); // Renamed to avoid conflict
      const selectedCauseError = document.getElementById(
        "selected-cause-error"
      );

      if (donorNameError) donorNameError.classList.add("hidden");
      if (donationAmountErrorJs2)
        donationAmountErrorJs2.classList.add("hidden");
      if (selectedCauseError) selectedCauseError.classList.add("hidden");
    }
  };

  // Function to close the donation modal
  const closeDonationModal = () => {
    if (donationModal) {
      donationModal.classList.remove("modal-show");
      donationModal.classList.add("modal-hide");
      // Use a timeout to ensure animation completes before hiding
      setTimeout(() => {
        donationModal.classList.add("hidden");
        donationModal.classList.remove("modal-hide");
        document.body.classList.remove("overflow-hidden"); // Restore body scroll
        if (donationForm) donationForm.reset(); // Reset the form
      }, 300); // Match CSS transition duration
    }
  };

  // Attach event listeners to all buttons that open the donation modal
  [navDonateButton, heroDonateButton, mobileDonateButton].forEach((button) => {
    if (button) {
      button.addEventListener("click", () => openDonationModal());
    }
  });

  if (closeDonationModalButton) {
    closeDonationModalButton.addEventListener("click", closeDonationModal);
  }

  // Close donation modal when clicking outside the modal content
  if (donationModal) {
    donationModal.addEventListener("click", (e) => {
      if (e.target === donationModal) {
        closeDonationModal();
      }
    });
  }

  // Handle donation form submission
  if (donationForm) {
    donationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Simple form validation
      let isValid = true;
      const donorNameInput = document.getElementById("donor-name");
      const donationAmountInputJs2 = document.getElementById("donation-amount"); // Renamed to avoid conflict
      const selectedCauseInput = document.getElementById("selected-cause");

      const donorNameError = document.getElementById("donor-name-error");
      const donationAmountErrorJs2 = document.getElementById(
        "donation-amount-error"
      );
      const selectedCauseError = document.getElementById(
        "selected-cause-error"
      );

      // Reset errors
      if (donorNameError) donorNameError.classList.add("hidden");
      if (donationAmountErrorJs2)
        donationAmountErrorJs2.classList.add("hidden");
      if (selectedCauseError) selectedCauseError.classList.add("hidden");

      if (donorNameInput && donorNameInput.value.trim() === "") {
        if (donorNameError) donorNameError.classList.remove("hidden");
        isValid = false;
      }
      if (
        donationAmountInputJs2 &&
        (parseFloat(donationAmountInputJs2.value) <= 0 ||
          isNaN(parseFloat(donationAmountInputJs2.value)))
      ) {
        if (donationAmountErrorJs2)
          donationAmountErrorJs2.classList.remove("hidden");
        isValid = false;
      }
      if (selectedCauseInput && selectedCauseInput.value === "") {
        if (selectedCauseError) selectedCauseError.classList.remove("hidden");
        isValid = false;
      }

      if (isValid) {
        // Simulate donation process (e.g., send data to a server)
        console.log("Donation submitted:", {
          name: donorNameInput.value,
          amount: parseFloat(donationAmountInputJs2.value),
          cause: selectedCauseInput.value,
        });

        // Update the progress for the specific project
        const donatedProject = donationProjects.find(
          (p) => p.id === selectedCauseInput.value
        );
        if (donatedProject) {
          donatedProject.currentAmount += parseFloat(
            donationAmountInputJs2.value
          );
          renderDonationCards(); // Re-render cards to show updated progress
        }

        // Show success message
        if (donationMessage) donationMessage.classList.remove("hidden");
        setTimeout(() => {
          closeDonationModal(); // Close after showing message
        }, 2000); // Hide message and close modal after 2 seconds
      }
    });
  }

  // --- 6. Contact Form from js2 ---
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;
      const contactNameInput = document.getElementById("contact-name");
      const contactEmailInput = document.getElementById("contact-email");
      const contactSubjectInput = document.getElementById("contact-subject");
      const contactMessageInput = document.getElementById("contact-message");

      const nameError = document.getElementById("name-error");
      const emailError = document.getElementById("email-error");
      const subjectError = document.getElementById("subject-error");
      const messageError = document.getElementById("message-error");

      // Reset errors
      if (nameError) nameError.classList.add("hidden");
      if (emailError) emailError.classList.add("hidden");
      if (subjectError) subjectError.classList.add("hidden");
      if (messageError) messageError.classList.add("hidden");

      if (contactNameInput && contactNameInput.value.trim() === "") {
        if (nameError) nameError.classList.remove("hidden");
        isValid = false;
      }
      if (
        contactEmailInput &&
        (contactEmailInput.value.trim() === "" ||
          !contactEmailInput.value.includes("@"))
      ) {
        if (emailError) emailError.classList.remove("hidden");
        isValid = false;
      }
      if (contactSubjectInput && contactSubjectInput.value.trim() === "") {
        if (subjectError) subjectError.classList.remove("hidden");
        isValid = false;
      }
      if (contactMessageInput && contactMessageInput.value.trim() === "") {
        if (messageError) messageError.classList.remove("hidden");
        isValid = false;
      }

      if (isValid) {
        console.log("Contact form submitted:", {
          name: contactNameInput.value,
          email: contactEmailInput.value,
          subject: contactSubjectInput.value,
          message: contactMessageInput.value,
        });
        if (contactMessageFeedback)
          contactMessageFeedback.classList.remove("hidden");
        contactForm.reset();
        setTimeout(() => {
          if (contactMessageFeedback)
            contactMessageFeedback.classList.add("hidden");
        }, 3000);
      }
    });
  }

  // --- 7. Newsletter Form from js2 ---
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (
        emailInput &&
        emailInput.value.trim() !== "" &&
        emailInput.value.includes("@")
      ) {
        console.log("Newsletter subscription:", emailInput.value);
        if (newsletterFeedback) newsletterFeedback.classList.remove("hidden");
        emailInput.value = ""; // Clear input field
        setTimeout(() => {
          if (newsletterFeedback) newsletterFeedback.classList.add("hidden");
        }, 3000);
      }
    });
  }

  // --- 8. Back to Top Button from js2 ---
  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // --- 9. Current Year in Footer from js2 ---
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --- 10. Scroll-based Section Animation (Intersection Observer) from js2 ---
  const observerOptions = {
    root: null, // viewport
    rootMargin: "0px",
    threshold: 0.2, // 20% of the section must be visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show-section");
        entry.target.classList.remove("hidden-section"); // Ensure it's fully visible
        observer.unobserve(entry.target); // Stop observing once it's visible
      }
    });
  }, observerOptions);

  hiddenSections.forEach((section) => {
    observer.observe(section);
  });

  // --- 11. FAQ Accordion from js2 ---
  faqToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("aria-controls");
      const targetContent = document.getElementById(targetId);
      const icon = toggle.querySelector(".faq-icon");

      const isExpanded = toggle.getAttribute("aria-expanded") === "true";

      // Close all other open FAQ items
      faqToggles.forEach((otherToggle) => {
        if (
          otherToggle !== toggle &&
          otherToggle.getAttribute("aria-expanded") === "true"
        ) {
          const otherTargetId = otherToggle.getAttribute("aria-controls");
          const otherTargetContent = document.getElementById(otherTargetId);
          const otherIcon = otherToggle.querySelector(".faq-icon");

          if (otherTargetContent) otherTargetContent.classList.add("hidden");
          otherToggle.setAttribute("aria-expanded", "false");
          if (otherIcon) otherIcon.classList.remove("rotated");
        }
      });

      // Toggle current FAQ item
      if (isExpanded) {
        if (targetContent) targetContent.classList.add("hidden");
        toggle.setAttribute("aria-expanded", "false");
        if (icon) icon.classList.remove("rotated");
      } else {
        if (targetContent) targetContent.classList.remove("hidden");
        toggle.setAttribute("aria-expanded", "true");
        if (icon) icon.classList.add("rotated");
      }
    });
  });
});
