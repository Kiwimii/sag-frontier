<?php
/**
 * Plugin Name: S.A.G. Frontier Game
 * Description: Embeds the S.A.G. Frontier Godot web build with a resilient loading and error screen.
 * Version: 0.1.0
 * Author: Star Atlas Germany
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit;
}

final class SAG_Frontier_Game {
    private const SHORTCODES = ['sag_frontier', 'sag_voidrunner'];

    public static function init(): void {
        foreach (self::SHORTCODES as $shortcode) {
            add_shortcode($shortcode, [self::class, 'render']);
        }
        add_action('wp_enqueue_scripts', [self::class, 'register_assets']);
    }

    public static function register_assets(): void {
        $base = plugin_dir_url(__FILE__);
        wp_register_style('sag-frontier-game', $base . 'assets/loader.css', [], '0.1.0');
        wp_register_script('sag-frontier-game', $base . 'assets/loader.js', [], '0.1.0', true);
    }

    public static function render(): string {
        wp_enqueue_style('sag-frontier-game');
        wp_enqueue_script('sag-frontier-game');

        $game_url = esc_url(plugin_dir_url(__FILE__) . 'public/game/index.html');

        return sprintf(
            '<section class="sag-frontier-shell" data-game-url="%1$s">
                <div class="sag-frontier-loader" role="status" aria-live="polite">
                    <p class="sag-frontier-kicker">S.A.G. FRONTIER</p>
                    <h2>Expedition wird vorbereitet</h2>
                    <p class="sag-frontier-status">Spielkern wird geladen …</p>
                    <div class="sag-frontier-progress"><span></span></div>
                    <button class="sag-frontier-retry" type="button" hidden>Erneut versuchen</button>
                </div>
                <iframe class="sag-frontier-frame" title="S.A.G. Frontier" src="about:blank" allow="autoplay; fullscreen; gamepad" allowfullscreen></iframe>
            </section>',
            $game_url
        );
    }
}

SAG_Frontier_Game::init();
