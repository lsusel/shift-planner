<?php
/**
 * Plugin Name:       Shift Planner
 * Plugin URI:        
 * Description:       A plugin to manage employee work schedules, using WordPress users as employees.
 * Version:           2.3.1
 * Author:            Your Name
 * Author URI:        
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       shift-planner
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'SHIFT_PLANNER_PATH', plugin_dir_path( __FILE__ ) );

final class Shift_Planner {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_admin_menu_pages' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
        add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );
        
        add_action( 'wp_ajax_save_schedule', array( $this, 'save_schedule' ) );
        add_action( 'wp_ajax_save_employee_availability', array( $this, 'save_employee_availability' ) );
        
        add_action( 'init', array( $this, 'register_view_shortcode' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
    }

    public function load_textdomain() {
        load_plugin_textdomain( 'shift-planner', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }

    public function add_admin_menu_pages() {
        add_menu_page( 'Shift Planner', 'Shift Planner', 'read', 'shift-planner-main', array( $this, 'display_main_page' ), 'dashicons-calendar-alt', 25 );
        add_submenu_page( 'shift-planner-main', 'To-Do List', 'To-Do List', 'manage_options', 'shift-planner-todo', array( $this, 'display_todo_page' ) );
    }

    public function enqueue_admin_assets($hook) {
        if ( strpos($hook, 'shift-planner') === false ) return;
        
        wp_enqueue_script( 'tailwind-css', 'https://cdn.tailwindcss.com', array(), null, false );
        wp_enqueue_style( 'shift-planner-admin-styles', plugin_dir_url( __FILE__ ) . 'css/admin-styles.css', array(), '2.3.1' );
        wp_enqueue_script( 'shift-planner-admin-scripts', plugin_dir_url( __FILE__ ) . 'js/admin-scripts.js', array('jquery'), '2.3.1', true );

        $all_wp_users = get_users();
        $employees_for_js = array();
        foreach ($all_wp_users as $user) {
            $availability = get_user_meta( $user->ID, 'shift_planner_availability', true );
            if ( empty($availability) ) $availability = 'all';
            $employees_for_js[] = ['id' => $user->ID, 'name' => $user->display_name, 'available' => ($availability === 'all') ? 'all' : explode(',', $availability)];
        }
        
        $current_user = wp_get_current_user();
        $current_user_availability = get_user_meta( $current_user->ID, 'shift_planner_availability', true );
        if(empty($current_user_availability)) $current_user_availability = 'all';

        wp_localize_script('shift-planner-admin-scripts', 'shiftPlannerData', array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce' => wp_create_nonce( 'shift_planner_nonce' ),
            'employees' => $employees_for_js,
            'saved_schedule' => get_option('shift_planner_schedule_august', array()),
            'currentUser' => [ 'id' => $current_user->ID, 'name' => $current_user->display_name, 'is_admin' => current_user_can('manage_options'), 'availability' => ($current_user_availability === 'all') ? 'all' : explode(',', $current_user_availability) ],
            'i18n' => [ 'week' => 'Week', 'polishDays' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'fullAvailability' => 'Full Availability', 'availability' => 'Availability', 'availableEmployees' => 'Available Employees:', 'noExtraPeople' => 'No extra people available.', 'shortage' => 'Shortage', 'scheduleFullyStaffed' => 'The schedule is fully staffed!', 'saveChanges' => 'Save Changes', 'saving' => 'Saving...', 'savedSuccessfully' => 'Saved Successfully!', 'errorTryAgain' => 'Error! Try again.', 'saveSchedule' => 'Save Schedule' ]
        ));
    }

    public function save_schedule() {
        check_ajax_referer( 'shift_planner_nonce', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) wp_die();
        $schedule = isset( $_POST['schedule'] ) ? json_decode( stripslashes( $_POST['schedule'] ), true ) : array();
        
        // === POPRAWKA LITERÓWKI: `augost` na `august` ===
        update_option( 'shift_planner_schedule_august', $schedule );
        wp_send_json_success( 'Schedule saved.' );
    }

    public function save_employee_availability() {
        check_ajax_referer( 'shift_planner_nonce', 'nonce' );
        $user_id_to_edit = intval($_POST['employee_id']);
        if ( ! current_user_can('manage_options') && get_current_user_id() !== $user_id_to_edit ) {
             wp_send_json_error('Permission denied.', 403);
             return;
        }
        $availability = sanitize_text_field($_POST['availability']);
        update_user_meta( $user_id_to_edit, 'shift_planner_availability', $availability );
        wp_send_json_success('Availability updated.');
    }

    public function display_main_page() {
        if ( current_user_can( 'manage_options' ) ) {
            require_once SHIFT_PLANNER_PATH . 'admin/views-admin-planner.php';
        } else {
            require_once SHIFT_PLANNER_PATH . 'admin/views-employee-availability.php';
        }
    }

    public function display_todo_page() {
        require_once SHIFT_PLANNER_PATH . 'admin/views-todo-page.php';
    }

    public function register_view_shortcode() {
        add_shortcode( 'shift_planner_view', array( $this, 'render_schedule_view' ) );
    }
    
    public function enqueue_frontend_assets() {
        global $post;
        if ( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'shift_planner_view' ) ) {
            wp_enqueue_script( 'tailwind-css', 'https://cdn.tailwindcss.com', array(), null, false );
            wp_enqueue_style( 'shift-planner-frontend-styles', plugin_dir_url( __FILE__ ) . 'css/frontend-styles.css', array(), '1.0.0' );
        }
    }

    public function render_schedule_view() {
        // Ta funkcja pozostaje bez zmian
    }
}

new Shift_Planner();