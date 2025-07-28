<?php
// File: admin/views-todo-page.php
if ( ! defined( 'ABSPATH' ) ) exit;
?>
<div class="wrap">
    <div id="todo-list-container" class="mt-10 p-5 bg-white rounded-lg shadow-sm">
        <h1 class="text-2xl font-semibold text-gray-800 mb-3"><?php _e( 'Application Development Plan (To-Do)', 'shift-planner' ); ?></h1>
        <div class="space-y-6">
            
            <div>
                <h3 class="text-md font-semibold text-gray-700 border-b pb-2 mb-3"><?php _e( 'Priority 1: Core Functionality & Simplest to Implement', 'shift-planner' ); ?></h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700">
                    <li><span class="font-semibold"><?php _e( 'Save State:', 'shift-planner' ); ?></span> <?php _e( '(Critical for usability) Implement saving the schedule in `localStorage` so that changes do not reset after refreshing.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Hour Counting:', 'shift-planner' ); ?></span> <?php _e( 'Automatically sum the work hours for each employee and display them under the employee list.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Vacation Mode:', 'shift-planner' ); ?></span> <?php _e( 'Ability to mark longer periods of unavailability (e.g., by selecting a whole day/week) in the edit panel.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Shift Notes:', 'shift-planner' ); ?></span> <?php _e( 'Allow managers to add short notes to a specific shift.', 'shift-planner' ); ?></li>
                </ul>
            </div>

            <div>
                <h3 class="text-md font-semibold text-gray-700 border-b pb-2 mb-3"><?php _e( 'Priority 2: Important, but More Complex Features', 'shift-planner' ); ?></h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700">
                    <li class="text-gray-400"><span class="font-semibold text-green-700 line-through"><?php _e( 'Employee Panel:', 'shift-planner' ); ?></span><span class="text-gray-400 line-through"> <?php _e( 'Create a separate view/login for employees to enter their availability themselves.', 'shift-planner' ); ?></span> (DONE)</li>
                    <li><span class="font-semibold"><?php _e( 'Print & Export:', 'shift-planner' ); ?></span> <?php _e( 'Option to generate the schedule in PDF/Excel format.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Roles & Permissions:', 'shift-planner' ); ?></span> <?php _e( 'Add categories (e.g., Bar/Kitchen) and related rules (e.g., there must be at least one person from "Bar" on a shift).', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Shift Swapping:', 'shift-planner' ); ?></span> <?php _e( 'A system for employees to request shift swaps.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Advanced Task Management:', 'shift-planner' ); ?></span> <?php _e( 'Create a module with to-do lists. Tasks per shift, daily, weekly, and monthly tasks.', 'shift-planner' ); ?></li>
                </ul>
            </div>

            <div>
                <h3 class="text-md font-semibold text-gray-700 border-b pb-2 mb-3"><?php _e( 'Priority 3: Advanced Features & Future Development', 'shift-planner' ); ?></h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700">
                    <li><span class="font-semibold"><?php _e( 'Notifications:', 'shift-planner' ); ?></span> <?php _e( 'System for sending the finalized schedule to employees (e.g., via email).', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Gamification & Motivation:', 'shift-planner' ); ?></span> <?php _e( 'Introduce a point system or "Employee of the Week" badges.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Schedule Templates:', 'shift-planner' ); ?></span> <?php _e( 'Ability to save a layout as a template and load it in the future.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Cost Management:', 'shift-planner' ); ?></span> <?php _e( 'Assign rates and automatically calculate costs.', 'shift-planner' ); ?></li>
                    <li><span class="font-semibold"><?php _e( 'Calendar Integration:', 'shift-planner' ); ?></span> <?php _e( 'Export to `.ics` format for Google/Apple calendars.', 'shift-planner' ); ?></li>
                     <li class="text-gray-400"><span class="font-semibold text-green-700 line-through"><?php _e( 'Platform:', 'shift-planner' ); ?></span><span class="text-gray-400 line-through"> <?php _e( 'Consider setting up the application on WordPress with an account system for employees.', 'shift-planner' ); ?></span> (DONE)</li>
                </ul>
            </div>

        </div>
    </div>
</div>
