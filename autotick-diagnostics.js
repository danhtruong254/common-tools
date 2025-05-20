function automateDataSafetyForm() {
    console.log("Starting automation...");

    function clickIfNotChecked(element) {
        if (element && !element.checked) {
            element.click();
            console.log(`Clicked: ${element.id || element.name || 'element with no id/name'}`);
        } else if (element && element.checked) {
            console.log(`Already checked: ${element.id || element.name || 'element with no id/name'}`);
        } else {
            console.warn("Element not found for clicking.");
        }
    }

    function findInputByLabelText(labelText, parentElement, inputType = 'checkbox') {
        if (!parentElement) return null;
        const labels = parentElement.querySelectorAll('label');
        for (let label of labels) {
            if (label.textContent.trim() === labelText) {
                // Handle label with 'for' attribute
                if (label.htmlFor) {
                    const input = document.getElementById(label.htmlFor);
                    if (input && input.type === inputType) return input;
                }

                // Try to find input in custom component parent
                let componentParent = label.closest('material-checkbox, material-radio');
                if (componentParent) {
                    const input = componentParent.querySelector(`input[type="${inputType}"]`);
                    if (input) return input;
                }

                // Fallback to nearby input elements
                let potentialInput = label.parentElement.querySelector(`input[type="${inputType}"]`) ||
                                     label.previousElementSibling;
                if (potentialInput && potentialInput.tagName === 'INPUT' && potentialInput.type === inputType) {
                    return potentialInput;
                }
            }
        }
        return null;
    }

    // Step 1: Tick "Collected" and "Shared"
    function tickCollectedAndShared() {
        const collectedParent = document.querySelector('material-checkbox[debug-id="collected-checkbox"]');
        const sharedParent = document.querySelector('material-checkbox[debug-id="shared-checkbox"]');

        if (collectedParent && sharedParent) {
            clickIfNotChecked(collectedParent.querySelector('input[type="checkbox"]'));
            clickIfNotChecked(sharedParent.querySelector('input[type="checkbox"]'));
            console.log("Ticked Collected & Shared");

            // Proceed to wait for next elements to appear
            waitForDynamicSections();
        } else {
            console.warn("Collected or Shared checkbox not found. Retrying...");
            setTimeout(tickCollectedAndShared, 500); // Retry every 500ms
        }
    }

    // Step 2: Wait for dynamic sections to appear
    function waitForDynamicSections() {
        const ephemeralityGroup = document.querySelector('material-radio-group[debug-id="ephemerality-question"]');
        const userControlGroup = document.querySelector('material-radio-group[debug-id="user-control-question"]');
        const collectedPurposeContainer = document.querySelector('data-use-purpose[debug-id="collected-purpose-question"]');
        const sharedPurposeContainer = document.querySelector('data-use-purpose[debug-id="shared-purpose-question"]');

        if (ephemeralityGroup && userControlGroup && collectedPurposeContainer && sharedPurposeContainer) {
            console.log("All dynamic sections loaded. Proceeding...");
            proceedWithRest(ephemeralityGroup, userControlGroup, collectedPurposeContainer, sharedPurposeContainer);
        } else {
            setTimeout(waitForDynamicSections, 500);
        }
    }

    // Step 3: Continue automation after dynamic content is available
    function proceedWithRest(ephemeralityGroup, userControlGroup, collectedPurposeContainer, sharedPurposeContainer) {
        const ephemeralYesRadio = findInputByLabelText(
            "Yes, this collected data is processed ephemerally",
            ephemeralityGroup,
            'radio'
        );
        clickIfNotChecked(ephemeralYesRadio);

        const usersCanChooseRadio = findInputByLabelText(
            "Users can choose whether this data is collected",
            userControlGroup,
            'radio'
        );
        clickIfNotChecked(usersCanChooseRadio);

        const purposes = ["App functionality", "Analytics", "Developer communications"];

        purposes.forEach(purpose => {
            const checkbox = findInputByLabelText(purpose, collectedPurposeContainer, 'checkbox');
            clickIfNotChecked(checkbox);
        });

        purposes.forEach(purpose => {
            const checkbox = findInputByLabelText(purpose, sharedPurposeContainer, 'checkbox');
            clickIfNotChecked(checkbox);
        });

        console.log("Automation complete.");
    }

    // Start the automation
    tickCollectedAndShared();
}

// Run the script
automateDataSafetyForm();
