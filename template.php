<?php
/**
* @package   WK Map Style Pro
* @author    Lech H. Conde http://www.saved.mx
* @copyright Copyright (C) Lech H. Conde
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

	wp_enqueue_script( 'wk-map', plugins_url('js/lazyloader.js', __FILE__) );
	$widget_id = $widget->id.'-'.uniqid();
	$settings  = $widget->settings;
	$init      = array();
	$adresses  = array();
	$gSettings = array();

	foreach ($widget->items as $item) {
		$item['popup'] = strlen(trim($item['popup'])) ? '<div class="wk-content">'.$item['popup'].'</div>': '';
		if (!count($init)) {
			$init = $item;
			$init['text'] = $item['popup'];
			$init['mainIcon'] = $item['icon'];
		} else {
			$adresses[] = $item;
		}
	}
	
	$width = $settings['width'] == "auto" ? "100%": $settings['width']."px";
?>
<div id="map-<?php echo $widget_id; ?>" class="wk-map wk-map-default" style="height: <?php echo $settings['height']; ?>px; width:<?php echo $width; ?>;" data-widgetkit="googlemaps" data-options='<?php echo str_replace("'","\u0027",json_encode(array_merge($init, $settings, array("adresses"=>$adresses)))); ?>'></div>
