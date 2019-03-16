<?php
/**
 * Plugin Name: 43rd Donations
 * Description: Provides donation/membership dues collection and processing through Stripe.
 * Version:     0.1
 * Author:      Annabelle Backman
 */

require_once('config.php');
if (!class_exists('FortyThirdDonations')) {

    class FortyThirdDonations {
        private static $STRIPE_JS_URL = 'https://js.stripe.com/v3/';
        private static $NONCE_TAG = 'donate-button';
        private static $singleton;

        protected function __construct() {
            add_action('wp_enqueue_scripts', array($this, 'enqueue'));
            add_action('wp_ajax_donate_button', array($this, 'process_donation'));
            add_shortcode('donate-button', array($this, 'donate_button'));
        }

        private function __clone() { }
        private function __wakeup() { }

        public static function init() {
            FortyThirdDonations::$singleton = new FortyThirdDonations();
        }

        public function enqueue() {
            wp_enqueue_script('donate-button-script',
                plugins_url('/app.js', __FILE__),
                array('jquery'));
            wp_enqueue_script('stripe-elements-script',
                FortyThirdDonations::$STRIPE_JS_URL);
            wp_enqueue_style('donate-style', plugins_url('/donations.css', __FILE__));
            wp_localize_script('donate-button-script', 'donate_context',
                array(
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce'    => wp_create_nonce(FortyThirdDonations::$NONCE_TAG)
                )
            );
        }

        public function donate_button($attrs) {
            $attrs = shortcode_atts(array('id' => 'donate-button'), $attrs);
            return sprintf('<input type="submit" id="%s" class="donate-button" value="Donate" />',
                esc_attr($attrs['id'])
            );
        }

        public function process_donation() {
            check_ajax_referer(FortyThirdDonations::$NONCE_TAG);
            $amount = $_POST['amount'];
            $token_id = $_POST['stripe-token-id'];
            $response = wp_remote_post('https://' . $fortythird_stripe_test_secret . ':@api.stripe.com/v1/charges', array(
                'blocking' => true,
                'body'     => array(
                    'amount'      => intval($amount) * 100,
                    'currency'    => 'usd',
                    'description' => 'test',
                    'source'      => $token_id
                )
            ));
            if (is_wp_error($response)) {
                $error_message = $response->get_error_message();
                wp_send_json_error($response->get_error_message(), 400);
            } else {
                wp_send_json_success(array(
                    'amount' => $amount,
                    'response'   => $response,
                    'status' => $response->response
                ));
            }
            wp_die();
        }
    }

    FortyThirdDonations::init();
}
?>
