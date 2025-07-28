<?php
// File: admin/views-todo-page.php
if ( ! defined( 'ABSPATH' ) ) exit;
?>
<div class="wrap">
    <div id="todo-list-container" class="mt-10 p-5 bg-white rounded-lg shadow-sm">
        <h1 class="text-2xl font-semibold text-gray-800 mb-3"><?php _e( 'Application Development Plan (To-Do)', 'shift-planner' ); ?></h1>
        <div class="space-y-6">
             <div>
                <h3 class="text-md font-semibold text-gray-700 border-b pb-2 mb-3"><?php _e( 'Priority 1: Core Functionality', 'shift-planner' ); ?></h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700">
                    <li class="text-gray-400"><span class="font-semibold text-green-700 line-through"><?php _e( 'Save State:', 'shift-planner' ); ?></span><span class="text-gray-400 line-through"> <?php _e( 'Saving the schedule to the database.', 'shift-planner' ); ?></span> (DONE)</li>
                    <li class="text-gray-400"><span class="font-semibold text-green-700 line-through"><?php _e( 'WordPress Users:', 'shift-planner' ); ?></span><span class="text-gray-400 line-through"> <?php _e( 'Use WP accounts as employees.', 'shift-planner' ); ?></span> (DONE)</li>
                    <li class="text-gray-400"><span class="font-semibold text-green-700 line-through"><?php _e( 'Employee Panel:', 'shift-planner' ); ?></span><span class="text-gray-400 line-through"> <?php _e( 'A view for employees to submit availability.', 'shift-planner' ); ?></span> (DONE)</li>
                    <li><span class="font-semibold"><?php _e( 'Hour Counting:', 'shift-planner' ); ?></span> <?php _e( 'Automatically sum the work hours for each employee and display them.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Vacation Mode:', 'shift-planner' ); ?></span> <?php _e( 'Ability to mark longer periods of unavailability (e.g., whole days).', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Shift Notes:', 'shift-planner' ); ?></span> <?php _e( 'Allow managers to add short notes to specific shifts.', 'shift-planner' ); ?></li>
                </ul>
            </div>
            <div>
                <h3 class="text-md font-semibold text-gray-700 border-b pb-2 mb-3"><?php _e( 'Priority 2: Major Features', 'shift-planner' ); ?></h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700">
                    <li><span class="font-semibold"><?php _e( 'Print & Export:', 'shift-planner' ); ?></span> <?php _e( 'Option to generate the schedule in PDF/Excel format.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Roles & Permissions:', 'shift-planner' ); ?></span> <?php _e( 'Add categories (e.g., Bar/Kitchen) and related rules.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Shift Swapping:', 'shift-planner' ); ?></span> <?php _e( 'A system for employees to request shift swaps.', 'shift-planner' ); ?></li>
                </ul>
            </div>
        </div>
    </div>
</div>