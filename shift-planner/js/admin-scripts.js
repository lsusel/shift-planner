jQuery(function ($) {
    if ($('#app-container').length === 0 && $('#employee-self-view-container').length === 0) {
        return;
    }

    const plannerData = window.shiftPlannerData;
    const i18n = plannerData.i18n;

    /************************************************
     * SEKCJA DLA PRACOWNIKA (WIDOK WŁASNEJ DOSTĘPNOŚCI)
     ************************************************/
    if ($('#employee-self-view-container').length > 0) {
        
        const grid = $('#availability-grid-self');
        const header = $('#availability-calendar-header-self');
        const saveButton = $('#save-btn-self');
        const selectAllCheckbox = $('#select-all-availability-self');

        function createEmployeeCalendar() {
            grid.empty();
            header.empty();

            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(dayName => {
                header.append(`<div class="p-2 bg-gray-50 border-b border-r border-gray-200">${dayName}</div>`);
            });

            const year = 2025;
            const month = 7; // August
            const firstDayOfMonth = new Date(year, month, 1);
            let currentDate = new Date(firstDayOfMonth);
            currentDate.setDate(currentDate.getDate() - (firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1));

            while (grid.children().length < 42) {
                const dayCell = $('<div class="calendar-day border-b border-r border-gray-200 p-2 min-h-[100px]"></div>');

                if (currentDate.getMonth() === month) {
                    dayCell.append(`<div class="font-bold text-sm text-gray-700">${currentDate.getDate()}</div>`);
                    const shiftsContainer = $('<div class="day-checkboxes mt-1 space-y-1"></div>');
                    
                    [{id: 'rano', name: 'Morning', icon: '☀️'}, {id: 'popoludnie', name: 'Afternoon', icon: '🌙'}].forEach(shift => {
                        const slotId = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${shift.id}`;
                        const isAvailable = plannerData.currentUser.availability === 'all' || plannerData.currentUser.availability.includes(slotId);
                        shiftsContainer.append(`
                            <label class="flex items-center space-x-2 text-xs cursor-pointer p-1 rounded hover:bg-gray-100">
                                <input type="checkbox" class="h-4 w-4 availability-checkbox-self" value="${slotId}" ${isAvailable ? 'checked' : ''}>
                                <span>${shift.icon} ${shift.name}</span>
                            </label>`);
                    });
                    dayCell.append(shiftsContainer);
                } else {
                    dayCell.addClass('bg-gray-50 opacity-70');
                }
                grid.append(dayCell);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            selectAllCheckbox.prop('checked', plannerData.currentUser.availability === 'all');
        }

        saveButton.on('click', function() {
            const btn = $(this);
            btn.prop('disabled', true).find('.btn-text').text(i18n.saving);

            let newAvailability = selectAllCheckbox.prop('checked') ? 'all' : 
                $('.availability-checkbox-self:checked').map((_, el) => el.value).get().join(',');

            $.post(plannerData.ajax_url, {
                action: 'save_employee_availability',
                nonce: plannerData.nonce,
                employee_id: plannerData.currentUser.id,
                availability: newAvailability
            }).done(() => {
                btn.find('.btn-text').text(i18n.savedSuccessfully);
            }).fail(() => {
                btn.find('.btn-text').text(i18n.errorTryAgain);
            }).always(() => {
                setTimeout(() => {
                    btn.prop('disabled', false).find('.btn-text').text(i18n.saveChanges);
                }, 2000);
            });
        });

        selectAllCheckbox.on('change', function() { $('.availability-checkbox-self').prop('checked', this.checked); });
        grid.on('change', '.availability-checkbox-self', function() { if (!this.checked) selectAllCheckbox.prop('checked', false); });
        
        createEmployeeCalendar();
    }


    /******************************************
     * SEKCJA DLA ADMINA (PEŁNY PLANER)
     ******************************************/
    if ($('#app-container').length > 0 && plannerData.currentUser.is_admin) {
        
        const employees = plannerData.employees;
        const savedSchedule = plannerData.saved_schedule;
        
        const employeeBank = document.getElementById('employee-bank');
        const scheduleContainer = document.getElementById('schedule-container');
        const saveStatusEl = document.getElementById('save-status');
        const saveButton = document.getElementById('save-schedule-btn');
        let draggedElement = null;
        let saveTimeout;
        let currentlyEditedEmployeeId = null;
        let isDirty = false;

        function setDirtyState(dirty) {
            isDirty = dirty;
            if (isDirty) {
                saveButton.disabled = false;
                saveStatusEl.textContent = 'Unsaved changes';
                saveStatusEl.className = 'text-sm font-medium text-yellow-600';
            } else {
                saveButton.disabled = true;
                saveStatusEl.textContent = '';
            }
        }

        function initializeAdminView() {
            renderEmployeeBank();
            renderScheduleLayout();
            if (Object.keys(savedSchedule).length > 0) {
                loadSchedule(savedSchedule);
            } else {
                updateAllShortages();
            }
            addAdminEventListeners();
            addAdminModalEventListeners();
        }

        function saveCurrentSchedule() {
            clearTimeout(saveTimeout);
            saveStatusEl.textContent = i18n.saving;
            saveStatusEl.className = 'text-sm font-medium text-gray-500';

            const scheduleState = {};
            document.querySelectorAll('.schedule-slot').forEach(slot => {
                const slotId = slot.dataset.slotId;
                const employeeIds = Array.from(slot.querySelectorAll('.employee-chip')).map(chip => chip.dataset.employeeId);
                if (employeeIds.length > 0) {
                    scheduleState[slotId] = employeeIds;
                }
            });

            $.post(plannerData.ajax_url, {
                action: 'save_schedule',
                nonce: plannerData.nonce,
                schedule: JSON.stringify(scheduleState)
            }).done(() => {
                saveStatusEl.textContent = i18n.savedSuccessfully;
                saveStatusEl.className = 'text-sm font-medium text-green-600';
                setDirtyState(false);
            }).fail(() => {
                saveStatusEl.textContent = i18n.errorTryAgain;
                saveStatusEl.className = 'text-sm font-medium text-red-500';
            }).always(() => {
                saveTimeout = setTimeout(() => {
                    if (!isDirty) {
                       saveStatusEl.textContent = '';
                    }
                }, 3000);
            });
        }

        function loadSchedule(scheduleData) {
            clearSchedule();
            for (const slotId in scheduleData) {
                const employeeIds = scheduleData[slotId];
                employeeIds.forEach(empId => addEmployeeToSlot(empId, slotId));
            }
            updateAllShortages();
        }

        function createEmployeeChip(emp, inSlot = false) {
            const chip = document.createElement('div');
            chip.className = `employee-chip flex items-center justify-between p-1`;
            chip.dataset.employeeId = emp.id;
            chip.draggable = true;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'flex-grow px-2';
            nameSpan.textContent = emp.name;
            chip.appendChild(nameSpan);

            if (inSlot) {
                chip.dataset.source = 'slot';
                chip.insertAdjacentHTML('beforeend', `<button type="button" class="remove-button text-red-500 hover:text-red-700 p-1 rounded-full" title="Remove from schedule"><svg class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>`);
            } else {
                chip.dataset.source = 'bank';
                chip.insertAdjacentHTML('beforeend', `<button type="button" class="edit-button p-1.5 rounded-full hover:bg-black/10" data-employee-id="${emp.id}" title="Edit Availability"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>`);
            }
            return chip;
        }

        function renderEmployeeBank() {
            employeeBank.innerHTML = '';
            employees.forEach(emp => {
                employeeBank.appendChild(createEmployeeChip(emp, false));
            });
        }

        function renderScheduleLayout() {
            if (!scheduleContainer) return;
            const year = 2025;
            const month = 7;
            const startDate = new Date(year, month, 1);
            scheduleContainer.innerHTML = '';
            let currentDate = new Date(startDate);
            while(currentDate.getDay() !== 1) { currentDate.setDate(currentDate.getDate() - 1); }
            let weekCounter = 1;
            while(currentDate.getMonth() <= month || (currentDate.getMonth() === 11 && month === 0)) {
                scheduleContainer.appendChild(createWeekTable(new Date(currentDate), weekCounter));
                currentDate.setDate(currentDate.getDate() + 7);
                weekCounter++;
                if (currentDate.getFullYear() > year && currentDate.getMonth() > 0) break;
            }
        }
        
        function createWeekTable(startDate, weekNumber) {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            const weekContainer = document.createElement('div');
            weekContainer.className = 'week-container';
            
            const header = document.createElement('div');
            header.className = 'week-header';
            header.innerHTML = `<svg class="toggle-icon w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg><h2 class="text-xl font-bold text-gray-700">${i18n.week} ${weekNumber} <span class="font-normal text-gray-500">(${startDate.toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit'})} - ${endDate.toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit'})})</span></h2>`;
            header.addEventListener('click', () => weekContainer.classList.toggle('collapsed'));

            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'schedule-table-wrapper';
            const table = document.createElement('table');
            table.className = 'w-full border-collapse text-center schedule-table';
            
            let theadHTML = `<thead><tr class="bg-gray-50"><th class="p-3 text-sm font-semibold text-gray-600 shift-header-cell">Shift</th>`;
            for (let i = 0; i < 7; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const isWeekend = (d.getDay() === 6 || d.getDay() === 0);
                theadHTML += `<th class="p-3 text-sm font-semibold text-gray-600 ${isWeekend ? 'weekend-header' : ''}">${i18n.polishDays[i]}<br><span class="font-normal text-xs text-gray-500">${d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span></th>`;
            }
            theadHTML += `</tr></thead>`;
            
            let tbodyHTML = '<tbody>';
            const shifts = [{ id: 'rano', name: 'Morning', icon: '☀️' }, { id: 'popoludnie', name: 'Afternoon', icon: '🌙' }];

            shifts.forEach(shift => {
                tbodyHTML += `<tr><th class="p-2 text-sm font-semibold border-r border-gray-200 shift-header-cell"><div class="text-2xl">${shift.icon}</div><span class="font-normal text-xs text-gray-500">(${shift.name})</span></th>`;
                for (let i = 0; i < 7; i++) {
                    const d = new Date(startDate);
                    d.setDate(d.getDate() + i);
                    const slotId = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${shift.id}`;
                    const label = `${i18n.polishDays[i]} ${d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} - ${shift.name}`;
                    let tdClass = `schedule-slot bg-white ${(d.getDay() === 6 || d.getDay() === 0) ? 'weekend' : ''}`;
                    if (d.getMonth() !== 7) tdClass += ' bg-gray-200 opacity-50';
                    tbodyHTML += `<td class="${tdClass}" data-slot-id="${slotId}" data-label="${label}"></td>`;
                }
                tbodyHTML += `</tr>`;
            });
            tbodyHTML += `</tbody>`;

            table.innerHTML = theadHTML + tbodyHTML;
            tableWrapper.appendChild(table);
            weekContainer.appendChild(header);
            weekContainer.appendChild(tableWrapper);

            return weekContainer;
        }
        
        function clearSchedule() {
            document.querySelectorAll('.schedule-slot').forEach(slot => { slot.innerHTML = ''; });
        }
        
        function resetSchedule() {
            if (!confirm('Are you sure you want to reset the schedule? This will remove all employees from the grid.')) return;
            clearSchedule();
            updateAllShortages();
            setDirtyState(true);
        }

        function autoPopulateSchedule() {
            if (!confirm('This will attempt to fill the schedule and overwrite current assignments. Are you sure?')) return;
            clearSchedule();
            document.querySelectorAll('.schedule-slot').forEach(slot => {
                if (slot.classList.contains('opacity-50')) return;
                const slotId = slot.dataset.slotId;
                const required = getRequiredStaff(slotId);
                const available = employees.filter(e => e.available === 'all' || e.available.includes(slotId));
                for(let i=0; i<required && i<available.length; i++) {
                    addEmployeeToSlot(available[i].id, slotId);
                }
            });
            updateAllShortages();
            setDirtyState(true);
        }

        function getRequiredStaff(slotId) {
            const date = new Date(slotId.substring(0, 10).replace(/-/g, '/'));
            const dayOfWeek = date.getDay();
            const isWeekend = (dayOfWeek === 6 || dayOfWeek === 0);
            if (isWeekend) return slotId.endsWith('rano') ? 4 : 2;
            return 2;
        }
        
        function updateAllShortages() {
            const shortageList = document.getElementById('shortage-list');
            if (!shortageList) return;
            shortageList.innerHTML = '';
            let totalDeficit = 0;

            document.querySelectorAll('.schedule-slot').forEach(slot => {
                if(slot.classList.contains('opacity-50')) return;

                const existingShortageChip = slot.querySelector('.shortage-chip');
                if (existingShortageChip) existingShortageChip.remove();
                
                const required = getRequiredStaff(slot.dataset.slotId);
                const current = slot.querySelectorAll('.employee-chip').length;
                const deficit = required - current;

                if (deficit > 0) {
                    totalDeficit += deficit;
                    
                    const shortageChip = document.createElement('div');
                    shortageChip.className = 'shortage-chip';
                    shortageChip.textContent = `${i18n.shortage} (${deficit})`;
                    slot.appendChild(shortageChip);

                    const listItem = document.createElement('div');
                    listItem.className = 'flex justify-between items-center text-sm py-1 border-b border-gray-100';
                    const label = slot.dataset.label;
                    listItem.innerHTML = `<span class="font-semibold text-gray-600">${label}</span> <span class="text-red-600 font-medium">${i18n.shortage} ${deficit}</span>`;
                    shortageList.appendChild(listItem);
                }
            });

            if (totalDeficit === 0) {
                shortageList.innerHTML = `<div class="text-green-600 font-semibold">${i18n.scheduleFullyStaffed}</div>`;
            }
        }
        
        function addEmployeeToSlot(employeeId, slotId) {
            const employee = employees.find(emp => String(emp.id) === String(employeeId));
            const slot = document.querySelector(`[data-slot-id="${slotId}"]`);
            if (employee && slot && !slot.querySelector(`[data-employee-id="${employeeId}"]`)) {
                const newChip = createEmployeeChip(employee, true);
                const shortageChip = slot.querySelector('.shortage-chip');
                if(shortageChip) {
                    slot.insertBefore(newChip, shortageChip);
                } else {
                    slot.appendChild(newChip);
                }
            }
        }

        function addAdminEventListeners() {
            $('#reset-schedule-btn').on('click', resetSchedule);
            $('#auto-fill-btn').on('click', autoPopulateSchedule);
            $('#save-schedule-btn').on('click', saveCurrentSchedule);
            
            document.addEventListener('dragstart', e => { if(e.target.classList.contains('employee-chip')) draggedElement = e.target; });
            document.addEventListener('dragend', () => draggedElement = null );
            document.body.addEventListener('dragover', e => e.preventDefault());

            scheduleContainer.addEventListener('drop', e => {
                e.preventDefault();
                const dropTarget = e.target.closest('.schedule-slot');
                if (dropTarget && draggedElement) {
                    const employeeId = draggedElement.dataset.employeeId;
                    if (!dropTarget.querySelector(`[data-employee-id="${employeeId}"]`)) {
                        if (draggedElement.dataset.source !== 'bank') {
                            draggedElement.remove();
                        }
                        addEmployeeToSlot(employeeId, dropTarget.dataset.slotId);
                        updateAllShortages();
                        setDirtyState(true);
                    }
                }
            });

            $(employeeBank).on('click', '.edit-button', function() {
                openAvailabilityModal(parseInt($(this).data('employee-id')));
            });

            $(scheduleContainer).on('click', '.remove-button', function() {
                $(this).closest('.employee-chip').remove();
                updateAllShortages();
                setDirtyState(true);
            });
        }
        
        function openAvailabilityModal(employeeId) {
            currentlyEditedEmployeeId = employeeId;
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) return;

            $('#modal-employee-name').text(employee.name);
            const grid = $('#availability-grid');
            const header = $('#availability-calendar-header');
            grid.empty();
            header.empty();

            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(dayName => header.append(`<div class="p-2">${dayName}</div>`));

            const year = 2025, month = 7;
            const firstDay = new Date(year, month, 1);
            let currentDate = new Date(firstDay);
            currentDate.setDate(currentDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));

            while (grid.children().length < 42) {
                const dayCell = $('<div class="calendar-day border-b border-r border-gray-200 p-2 min-h-[100px]"></div>');
                if (currentDate.getMonth() === month) {
                    dayCell.append(`<div class="font-bold">${currentDate.getDate()}</div>`);
                    const shiftsContainer = $('<div class="mt-1 space-y-1"></div>');
                     [{id: 'rano', name: 'Morning'}, {id: 'popoludnie', name: 'Afternoon'}].forEach(shift => {
                        const slotId = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${shift.id}`;
                        const isAvailable = employee.available === 'all' || employee.available.includes(slotId);
                        shiftsContainer.append(`<label class="flex items-center text-xs"><input type="checkbox" class="h-4 w-4 availability-checkbox-admin" value="${slotId}" ${isAvailable ? 'checked' : ''}><span class="ml-1">${shift.name}</span></label>`);
                     });
                    dayCell.append(shiftsContainer);
                } else {
                    dayCell.addClass('bg-gray-50');
                }
                grid.append(dayCell);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            $('#select-all-availability').prop('checked', employee.available === 'all');
            $('#edit-modal, #edit-modal-overlay').removeClass('hidden');
        }
        
        function closeEditModal() {
            $('#edit-modal, #edit-modal-overlay').addClass('hidden');
            currentlyEditedEmployeeId = null;
        }

        function saveAdminAvailability() {
            if (!currentlyEditedEmployeeId) return;
            
            const btn = $('#modal-save-btn-admin');
            btn.prop('disabled', true).text(i18n.saving);

            const selectAll = $('#select-all-availability').prop('checked');
            let newAvailability = selectAll ? 'all' : 
                $('.availability-checkbox-admin:checked').map((_, el) => el.value).get().join(',');

            $.post(plannerData.ajax_url, {
                action: 'save_employee_availability',
                nonce: plannerData.nonce,
                employee_id: currentlyEditedEmployeeId,
                availability: newAvailability
            }).done(() => {
                btn.text(i18n.savedSuccessfully);
                setTimeout(() => {
                    alert('Availability updated! The page will now reload to apply changes.');
                    location.reload();
                }, 1000);
            }).fail(() => {
                alert('Error saving availability.');
                btn.prop('disabled', false).text(i18n.saveChanges);
            });
        }

        function addAdminModalEventListeners() {
            $('#modal-close-btn, #modal-cancel-btn, #edit-modal-overlay').on('click', closeEditModal);
            $('#modal-save-btn-admin').on('click', saveAdminAvailability);
            $('#select-all-availability').on('change', function() {
                $('.availability-checkbox-admin').prop('checked', this.checked);
            });
            $('#availability-grid').on('change', '.availability-checkbox-admin', function() {
                if (!this.checked) $('#select-all-availability').prop('checked', false);
            });
        }
        
        initializeAdminView();
    }
});