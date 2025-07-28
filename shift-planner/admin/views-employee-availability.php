<?php
// File: admin/views-employee-availability.php
if ( ! defined( 'ABSPATH' ) ) exit;
$current_user = wp_get_current_user();
?>
<div class="wrap">
    <div id="employee-self-view-container" class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
        <div class="border-b pb-4 mb-6">
            <h1 class="text-2xl font-bold text-gray-800"><?php _e('Submit Your Availability', 'shift-planner'); ?></h1>
            <p class="text-gray-500 mt-1"><?php printf(__('Hello, %s! Please mark the shifts you are available for in August 2025.', 'shift-planner'), esc_html($current_user->display_name)); ?></p>
        </div>
        
        <div class="mb-4">
            <label class="flex items-center cursor-pointer">
                <input type="checkbox" id="select-all-availability-self" class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                <span class="ml-2 text-gray-700 font-medium"><?php _e('Full Availability (select/unselect all)', 'shift-planner'); ?></span>
            </label>
        </div>

        <div id="availability-calendar-header-self" class="grid grid-cols-7 text-center font-semibold text-sm text-gray-600 mb-2 border-t border-l border-r"></div>
        <div id="availability-grid-self" class="grid grid-cols-7 border-t border-l border-gray-200">
            <div class="flex items-center justify-center min-h-[120px] col-span-7 text-gray-400">Loading calendar...</div>
        </div>

        <div class="mt-6 text-right">
            <button id="save-btn-self" class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                <span class="btn-text"><?php _e('Save Changes', 'shift-planner'); ?></span>
            </button>
        </div>
    </div>
</div>