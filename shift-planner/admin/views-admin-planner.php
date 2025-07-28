<?php
// File: admin/views-admin-planner.php
if ( ! defined( 'ABSPATH' ) ) exit;
?>
<div class="wrap">
    <div id="app-container" class="max-w-screen-2xl mx-auto">
        <header class="mb-6 pb-4 border-b border-gray-200 flex justify-between items-start flex-wrap">
             <div class="mb-4 md:mb-0">
                <h1 class="text-3xl font-bold text-gray-900"><?php _e( 'Shift Planner', 'shift-planner' ); ?></h1>
                <p class="text-gray-500 mt-1"><?php _e( 'August 2025 Schedule', 'shift-planner' ); ?></p>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <button id="save-schedule-btn" class="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400" disabled>
                        <?php _e('Save Schedule', 'shift-planner'); ?>
                    </button>
                    <span id="save-status" class="text-sm font-medium min-w-[140px] text-left"></span>
                </div>
                <div class="flex items-center gap-2">
                    <button id="auto-fill-btn" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"><?php _e('Auto-fill Schedule', 'shift-planner'); ?></button>
                    <button id="reset-schedule-btn" class="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"><?php _e('Reset Schedule', 'shift-planner'); ?></button>
                </div>
            </div>
        </header>

        <div class="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800 mb-3"><?php _e( 'Employees', 'shift-planner' ); ?></h2>
            <div id="employee-bank" class="flex flex-row flex-wrap gap-2 items-center"></div>
        </div>
        <div id="shortage-summary-container" class="mb-8 p-5 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800 mb-3"><?php _e( 'Staffing Shortage Summary:', 'shift-planner' ); ?></h2>
            <div id="shortage-list" class="text-gray-700 space-y-2"></div>
        </div>
        
        <main id="schedule-container" class="space-y-4"></main>

    </div>

    <div id="availability-tooltip" class="tooltip"></div>
    <div id="slot-tooltip" class="tooltip"></div>
    <div id="edit-modal-overlay" class="fixed inset-0 bg-black bg-opacity-50 hidden z-40"></div>
    <div id="edit-modal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-4xl hidden z-50">
        <div id="modal-header" class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-semibold text-gray-800"><?php _e( 'Edit Availability', 'shift-planner' ); ?> - <span id="modal-employee-name"></span></h3>
            <button id="modal-close-btn" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div id="modal-body" class="p-5 max-h-[70vh] overflow-y-auto">
             <div class="mb-4">
                <label class="flex items-center">
                    <input type="checkbox" id="select-all-availability" class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                    <span class="ml-2 text-gray-700"><?php _e( 'Full Availability (select/unselect all)', 'shift-planner' ); ?></span>
                </label>
            </div>
            <div id="availability-calendar-header" class="grid grid-cols-7 text-center font-semibold text-sm text-gray-600 mb-2"></div>
            <div id="availability-grid" class="grid grid-cols-7 border-t border-l border-gray-200"></div>
        </div>
        <div id="modal-footer" class="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
            <button id="modal-cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300"><?php _e( 'Cancel', 'shift-planner' ); ?></button>
            <button id="modal-save-btn-admin" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><?php _e( 'Save Changes', 'shift-planner' ); ?></button>
        </div>
    </div>
</div>